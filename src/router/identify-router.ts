import { Router } from "express";
import { z } from "zod";

const router = Router();

const schema = z.object({
  phoneNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

// this is root endpoint for '/identify'
router.post("/", async (req, res) => {
  try {
    // checking for invalid inputs
    const parse = schema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: "Invalid input", data: parse });

    const { email, phoneNumber } = parse.data;
    if (!email && !phoneNumber)
      return res
        .status(400)
        .json({ error: "Either Email or Phone number is required" });

    // returning dummy response
    res.status(200).json({ email: email, phoneNumber: phoneNumber });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Internal Server error in contact create/fetch" });
  }
});

// endpoint to verify successfull server response
router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Identify Service is runnsdsing",
    timestamp: new Date().toISOString(),
  });
});

export default router;
