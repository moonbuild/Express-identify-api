import { Router } from "express";
import { z } from "zod";

import { IdentifyService } from "../services/identify-service";

const router = Router();

const schema = z.object({
  phoneNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

const identifyService = new IdentifyService();

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

    // after safe parse, we convert type of email to either string or undefined
    const email = parsedEmail ?? undefined;
    const phoneNumber = parsedPhoneNumber ?? undefined;

    // process the request
    const response = await identifyService.identify({ email, phoneNumber });
    return res.status(200).json(response);

  } catch (error) {
    res
      .status(500)
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
