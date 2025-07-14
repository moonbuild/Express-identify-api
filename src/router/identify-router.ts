import { Router } from 'express';

import { IdentifyService } from '../services/identify-service';
import { validateIdentifyInput } from '../utils/validate-identify';

const router = Router();

const identifyService = new IdentifyService();

// this is root endpoint for '/identify'
router.post('/', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate email and phone number and send the appropriate message
    const isInputValid = validateIdentifyInput({ email, phoneNumber });
    if (!isInputValid.valid) {
      return res.status(400).json({ error: isInputValid.error });
    }

    // process the request
    const response = await identifyService.identify({ email, phoneNumber });
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server error in contact create/fetch' });
  }
});

// endpoint to verify successfull server response
router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Identify Service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
