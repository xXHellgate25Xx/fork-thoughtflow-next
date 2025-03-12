import { AES } from 'crypto-js';

export const hashPassword = (password: string): string => {
  const privateToken = import.meta.env.VITE_JWT_PRIVATE_KEY;

  if (!privateToken) {
    throw new Error("Missing private token in environment variables");
  }

  const encryptedPassword = AES.encrypt(password, privateToken).toString();
  
  // Return the hash as a hex string
  return encryptedPassword;
}