import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed O/0, I/1 for clarity
const nanoid = customAlphabet(alphabet, 8); // 8-char alphanumeric

export const generateReferralCode = () => nanoid();
