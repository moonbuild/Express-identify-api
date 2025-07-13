import { Router } from "express";
import { z } from "zod";
import { IdentifyRequest } from "../types/identify";
import { prisma } from "../db";

const router = Router();

const schema = z.object({
  phoneNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

//prisma function to find related contacts based on email and phonenumber
const findRelatedContacts = async ({ email, phoneNumber }: IdentifyRequest) => {
  const related = await prisma.contacts.findMany({
    where: {
      OR: [{ email: email }, { phoneNumber: phoneNumber }],
    },
    orderBy: { createdAt: "asc" },
  });
  return related;
};

// prisma function that will create a new primary contact
const createPrimaryContact = async ({
  email,
  phoneNumber,
}: IdentifyRequest) => {
  const primaryContact = await prisma.contacts.create({
    data: {
      email,
      phoneNumber,
      linkPrecedence: "primary",
    },
  });
  return primaryContact;
};

// this is root endpoint for '/identify'
router.post("/", async (req, res) => {
  try {
    // checking for invalid inputs
    const parse = schema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: "Invalid input", data: parse });

    const { email: parsedEmail, phoneNumber: parsedPhoneNumber } = parse.data;

    if (!parsedEmail && !parsedPhoneNumber)
      return res
        .status(400)
        .json({ error: "Either Email or Phone number is required" });

    //after safe parse, we convert type of email to either string or undefined
    const email = parsedEmail ?? undefined;
    const phoneNumber = parsedPhoneNumber ?? undefined;

    // The below is demo logic to ensure prisma code is working
    const contacts = await findRelatedContacts({ email, phoneNumber });
    // if no related contacts, create primary contact
    if (contacts.length == 0) {
      const primaryContact = await createPrimaryContact({ email, phoneNumber });
      return res.json(primaryContact);
    } else {
      res.json({ message: "There already exists a similar contact" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Internal Server error in contact create/fetch" });
  }
});

// endpoint to verify successfull server response
router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Identify Service is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
