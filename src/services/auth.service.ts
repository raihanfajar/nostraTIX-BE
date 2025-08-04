import dayjs from "dayjs";
import prisma from "../config";
import { Organizer, User } from "../generated/prisma";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { generateToken } from "../lib/jwt";
import { ApiError } from "../utils/ApiError";
import { generateCouponCode } from "../utils/generateCouponCode";
import { generateReferralCode } from "../utils/generateReferralCode";
import { generateUniqueSlug } from "../utils/generateSlug";

export const registerUserService = async (
    body: Pick<User, 'name' | 'email' | 'password'>, referralCode?: string
) => {

    // * Setup
    const hashedPassword = await hashPassword(body.password);

    // * Check if email already exists
    const existingEmail = await prisma.user.findUnique({
        where: { email: body.email },
    });
    if (existingEmail) throw new ApiError(409, 'Email already exists');

    // * Check referral code validity & fetch referrer
    let referrerUser = null;
    if (referralCode) {
        referrerUser = await prisma.user.findUnique({
            where: { referralCode },
        });
        if (!referrerUser) throw new ApiError(400, 'Invalid referral code');
    }

    // * Transaction logic
    const rollback = await prisma.$transaction(async (tx) => {
        // * Create new user
        const newUser = await tx.user.create({
            data: {
                ...body,
                password: hashedPassword,
                referralCode: await generateReferralCode(),
            },
        });

        // * Create coupon for referred user
        await tx.coupon.create({
            data: {
                code: await generateCouponCode(),
                maxDiscount: 50000,
                onlyForId: newUser.id,
                discount: 0.05,
                quota: 1,
                expiredDate: dayjs().add(3, 'month').toISOString(),
            },
        });

        // * Add points to referrer if exists
        if (referrerUser) {
            await tx.point.create({
                data: {
                    userId: referrerUser.id,
                    expiredDate: dayjs().add(3, 'month').toISOString(),
                },
            });
        }

        return newUser;
    });

    // * Return when AL IZ WEL
    return {
        status: 'success',
        message: 'User created successfully',
        details: rollback,
    };
};

export const loginUserService = async (body: Pick<User, 'email' | 'password'>) => {
    // *Check user validity
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
    if (!existingUser) throw new ApiError(404, "User not found");

    // *Check password validity
    const isPasswordValid = await comparePassword(body.password, existingUser.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid email or password");

    // *Generate token
    const payload = { userId: existingUser.id, role: existingUser.role, balancePoint: existingUser.balancePoint };
    const accessToken = generateToken(payload, process.env.JWT_SECRET!, { expiresIn: "2h"  });

    const balancePoint = await prisma.point.findMany({
        where: {
            userId: existingUser.id,
            expiredDate: { gte: dayjs().toISOString() }
        }
    });
    existingUser.balancePoint = (balancePoint.length) * 10000;

    const { password, ...rest } = existingUser;

    console.log(existingUser);

    // *Return when AL IZ WEL
    return { status: "success", message: `Welcome ${existingUser.name}`, details: { ...rest, accessToken } }
}

export const registerOrganizerService = async (body: Pick<Organizer, 'name' | 'email' | 'password'>) => {
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
    const payload = { organizerId: existingOrganizer.id, role: "ORGANIZER"};
    const accessToken = generateToken(payload, process.env.JWT_SECRET!, { expiresIn: "2h" }); //! Udah ada

    const { password, ...rest } = existingOrganizer;

    // *Return when AL IZ WEL
    return { status: "success", message: `Welcome ${existingOrganizer.name}`, details: { ...rest, accessToken } }
}

export const validateReferralCodeService = async (body: Pick<User, 'referralCode'>) => {
    const existingReferralCode = await prisma.user.findUnique({
        where: { referralCode: body.referralCode },
    });

    if (!existingReferralCode) throw new ApiError(400, 'Invalid referral code');

    return { status: "success", message: `Referral code ${body.referralCode} is valid`, details: existingReferralCode }
}