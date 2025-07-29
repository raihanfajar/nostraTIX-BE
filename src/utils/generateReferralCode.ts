import { customAlphabet } from 'nanoid';

export const generateReferralCode = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const nanoid = customAlphabet(alphabet, 8);
  return nanoid();
};
