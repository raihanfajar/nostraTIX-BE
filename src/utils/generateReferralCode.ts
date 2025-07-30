// import { customAlphabet } from 'nanoid';

// export const generateReferralCode = (): string => {
//   const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//   const nanoid = customAlphabet(alphabet, 8);
//   return nanoid();
// };

import { customAlphabet } from 'nanoid';
import prisma from '../config';
import { ApiError } from "../utils/ApiError";

export const generateReferralCode = async (): Promise<string> => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const nanoid = customAlphabet(alphabet, 8);

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const code = nanoid();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });

    if (!existing) return code;
    attempts++;
  }

  throw new ApiError(500, 'Failed to generate unique referral code', false);
};
