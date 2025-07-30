import { customAlphabet } from 'nanoid';
import prisma from '../config';
import { ApiError } from "../utils/ApiError";

export const generateCouponCode = async (): Promise<string> => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const nanoid = customAlphabet(alphabet, 6);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        const couponCode = nanoid();
        const existing = await prisma.coupon.findUnique({ where: { code: couponCode } });

        if (!existing) return couponCode;
        attempts++;
    }

    throw new ApiError(500, 'Failed to generate unique referral code', false);
};
