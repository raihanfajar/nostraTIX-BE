import prisma from "../config";
import { Prisma, User } from "../generated/prisma";
import dayjs from "dayjs";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../lib/bcrypt";

export const getUserOverviewService = async (userId: string) => {
    // * Validate user
    const existingUser = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
    });

    if (!existingUser) throw new ApiError(404, "User not found");

    // * Fetch Total Events Attended
    // * Fetch Total Events Attended (distinct eventId from DONE transactions)
    const distinctEvents = await prisma.transaction.findMany({
        where: {
            userId,
            status: "DONE",
            deletedAt: null,
        },
        distinct: ["eventId"],
        select: {
            eventId: true,
        },
    });

    const totalEventsAttended = distinctEvents.length;



    // * Fetch Total Tickets Bought
    const totalTicketsBoughtResult = await prisma.transaction.aggregate({
        where: {
            userId,
            status: "DONE",
            deletedAt: null,
        },
        _sum: {
            quantity: true,
        },
    });

    // * Fetch Active Voucher Count
    const activeVoucherCount = await prisma.voucher.count({
        where: {
            expiredDate: {
                gt: dayjs().toDate(),
            },
            deletedAt: null,
            transactions: {
                some: {
                    userId,
                    status: "DONE",
                    deletedAt: null,
                },
            },
        },
    });

    // *Return when AL IZ WEL
    return {
        status: "success",
        message: "User overview fetched successfully",
        data: {
            totalEventsAttended,
            totalTicketsBought: totalTicketsBoughtResult._sum.quantity || 0,
            activeVoucherCount,
        },
    };
};

export const getUserProfileService = async (body: Pick<User, 'id'>) => {

    const targetUser = await prisma.user.findUnique({
        where: { id: body.id },
    })

    if (!targetUser) throw new ApiError(404, "User not found");

    const { name, email } = targetUser;

    return { status: "success", message: "User found", details: { name, email } }
}

export const patchUserProfileService = async (body: Pick<User, 'id' | 'name' | 'email'>) => {
    const targetUser = await prisma.user.findUnique({
        where: { id: body.id },
    })

    if (!targetUser) throw new ApiError(404, "user not found");

    const emailExists = await prisma.user.findUnique({ where: { email: body.email } })
    if (emailExists && emailExists.id !== body.id) throw new ApiError(400, "Email already exists");

    const updatedUser = await prisma.user.update({
        where: { id: body.id },
        data: { name: body.name, email: body.email },
    })

    return { status: "success", message: "user updated", details: updatedUser }
}

export const changePasswordService = async (body: Pick<User, 'id' | 'password'>, currentPassword: string) => {
    const targetUser = await prisma.user.findUnique({
        where: { id: body.id },
    })

    if (!targetUser) throw new ApiError(404, "user not found");

    const isPasswordValid = await comparePassword(currentPassword, targetUser.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid password");

    const hashedPassword = await hashPassword(body.password);

    const updatedUser = await prisma.user.update({
        where: { id: body.id },
        data: { password: hashedPassword },
    })

    return { status: "success", message: "Password updated", details: updatedUser }
}
