import { IdentifyRequest } from '../types/identify';

// Simple regex that checks for spaces and '@'
function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// Simple regex to check if phone number is all digits
function isPhoneNumberValid(phoneNumber: string): boolean {
  return /^\d+$/.test(phoneNumber);
}

// Validation logic for Email and Phone Number
export function validateIdentifyInput({ email, phoneNumber }: IdentifyRequest) {
  if (!email && !phoneNumber) {
    return { valid: false, error: 'One of Email | Phone Number must be provided' };
  }
  if (email && !isEmailValid(email)) {
    return { valid: false, error: 'Invalid Email' };
  }
  if (phoneNumber && !isPhoneNumberValid(phoneNumber)) {
    return { valid: false, error: 'Invalid Phone Number' };
  }
  // If none of the conditions match then request is valid
  return { valid: true, error: '' };
}
