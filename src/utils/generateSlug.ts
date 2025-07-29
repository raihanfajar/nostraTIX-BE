import prisma from '../config';
import { ApiError } from './ApiError';

const baseSlugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') // Replace spaces and symbols with dashes
        .replace(/^-+|-+$/g, '');    // Remove starting/ending dashes
};

export const generateUniqueSlug = async (name: string): Promise<string> => {
    const baseSlug = baseSlugify(name);
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 5;
    let counter = 1;

    do {
        if (attempts >= maxAttempts) throw new ApiError(500, 'Failed to generate unique slug', false);
        const existing = await prisma.organizer.findUnique({
            where: { slug },
        });

        if (!existing) break;
        attempts++;

        slug = `${baseSlug}-${counter++}`;
    } while (true);

    return slug;
};
