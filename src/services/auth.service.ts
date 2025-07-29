import prisma from "../config";
import { Organizer, User } from "../generated/prisma";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { generateToken } from "../lib/jwt";
import { ApiError } from "../utils/ApiError";
import { generateReferralCode } from "../utils/generateReferralCode";
import { generateUniqueSlug } from "../utils/generateSlug";

export const registerUserService = async (body: Pick<User, 'name' | 'email' | 'password'>) => {
    // *Setup
    const hashedPassword = await hashPassword(body.password);

    let generatedReferralCode: string;
    let attempts = 0;
    const maxAttempts = 5;
    do {
        if (attempts >= maxAttempts) throw new ApiError(500, "Failed to generate unique referral code", false);
        generatedReferralCode = generateReferralCode();
        const existing = await prisma.user.findUnique({ where: { referralCode: generatedReferralCode } });
        if (!existing) break;
        attempts++;
    } while (true);

    // * Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: body.email } })
    if (existingEmail) throw new ApiError(409, "Email already exists");

    // * Create new user
    const newUser = await prisma.user.create({
        data: {
            ...body,
            password: hashedPassword,
            referralCode: generatedReferralCode,
        }
    })

    // *Return when AL IZ WEL
    return { status: "success", message: "User created successfully", details: newUser }
}

export const loginUserService = async (body: Pick<User, 'email' | 'password'>) => {
    // *Check user validity
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
    if (!existingUser) throw new ApiError(404, "User not found");

    // *Check password validity
    const isPasswordValid = await comparePassword(body.password, existingUser.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid email or password");

    // *Generate token
    const payload = { id: existingUser.id, role: existingUser.role };
    const accessToken = generateToken(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });

    const { password, ...rest } = existingUser;

    // *Return when AL IZ WEL
    return { status: "success", message: "User logged in successfully", details: { ...rest, accessToken } }
}

export const registerOrganizerService = async (body: Pick<Organizer, 'name' | 'email' | 'password' | 'description'>) => {
    // *Setup
    const hashedPassword = await hashPassword(body.password);
    const generatedSlug = await generateUniqueSlug(body.name);

    // * Check if email already exists
    const existingEmail = await prisma.organizer.findUnique({ where: { email: body.email } })
    if (existingEmail) throw new ApiError(400, "Email already exists");

    // * Create new organizer
    const newOrganizer = await prisma.organizer.create({
        data: {
            ...body,
            password: hashedPassword,
            slug: generatedSlug,
        }
    })

    // *Return when AL IZ WEL
    return { status: "success", message: "Organizer created successfully", details: newOrganizer }
}

export const loginOrganizerService = async (body: Pick<Organizer, 'email' | 'password'>) => {
    // *Check user validity
    const existingOrganizer = await prisma.organizer.findUnique({ where: { email: body.email } })
    if (!existingOrganizer) throw new ApiError(404, "Organizer not found");

    // *Check password validity
    const isPasswordValid = await comparePassword(body.password, existingOrganizer.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid email or password");

    // *Generate token
    const payload = { id: existingOrganizer.id, role: "ORGANIZER" };
    const accessToken = generateToken(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });

    const { password, ...rest } = existingOrganizer;

    // *Return when AL IZ WEL
    return { status: "success", message: "Organizer logged in successfully", details: { ...rest, accessToken } }
}