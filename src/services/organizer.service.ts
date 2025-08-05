import dayjs from "dayjs";
import prisma from "../config";
import { Organizer } from "../generated/prisma";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { ApiError } from "../utils/ApiError";
export const getOrganizerProfileService = async (body: Pick<Organizer, 'id'>) => {

    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    const { name, email, profilePicture, description, } = targetOrganizer;

    return { status: "success", message: "Organizer found", details: { name, email, profilePicture, description } }
}

export const patchOrganizerProfileService = async (body: Pick<Organizer, 'id' | 'name' | 'email' | 'description'>) => {
    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    const emailExists = await prisma.organizer.findUnique({ where: { email: body.email } })
    if (emailExists && emailExists.id !== body.id) throw new ApiError(400, "Email already exists");

    const updatedOrganizer = await prisma.organizer.update({
        where: { id: body.id },
        data: { name: body.name, email: body.email, description: body.description },
    })

    return { status: "success", message: "Organizer updated", details: updatedOrganizer }
}

export const changePasswordService = async (body: Pick<Organizer, 'id' | 'password'>, currentPassword: string) => {
    const targetOrganizer = await prisma.organizer.findUnique({
        where: { id: body.id },
    })

    if (!targetOrganizer) throw new ApiError(404, "Organizer not found");

    const isPasswordValid = await comparePassword(currentPassword, targetOrganizer.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid password");

    const hashedPassword = await hashPassword(body.password);

    const updatedOrganizer = await prisma.organizer.update({
        where: { id: body.id },
        data: { password: hashedPassword },
    })

    return { status: "success", message: "Password updated", details: updatedOrganizer }
}


export const getOverviewService = async (body: Pick<Organizer, 'id'>) => {
    // 1. Count total events
    const totalEventsCreated = await prisma.event.count({
        where: {
            organizerId: body.id,
            deletedAt: null,
        },
    });

    // 2. Get all DONE transactions from events by this organizer
    const transactions = await prisma.transaction.findMany({
        where: {
            status: "DONE",
            event: {
                organizerId: body.id,
            },
        },
        select: {
            totalPrice: true,
            tickets: {
                select: { id: true }, // just count later
            },
        },
    });

    // 3. Calculate revenue & tickets sold
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const totalTicketsSold = transactions.reduce((count, tx) => count + tx.tickets.length, 0);

    // 4. Get active coupons (linked through events created by this organizer)
    const activeCoupons = await prisma.coupon.findMany({
        where: {
            deletedAt: null,
            expiredDate: {
                gt: dayjs().toDate(),
            },
            user: {
                // This will include coupons only for users who bought tickets to this organizer's events
                transactions: {
                    some: {
                        event: {
                            organizerId: body.id,
                        },
                    },
                },
            },
        },
    });

    return {
        status: "success",
        message: "Get overview successfully",
        data: {
            totalEventsCreated,
            totalRevenue,
            totalTicketsSold,
            activeCouponsCount: activeCoupons.length,
            // optionally: activeCoupons,
        },
    };
};

type ViewType = "daily" | "monthly" | "yearly";
export const getRevenueOverviewService = async (body: Pick<Organizer, "id">, view: ViewType) => {
    if (!["daily", "monthly", "yearly"].includes(view)) {
        throw new ApiError(400, "Invalid view type");
    }

    // Fetch all DONE transactions related to this organizer's events
    const transactions = await prisma.transaction.findMany({
        where: {
            status: "DONE",
            event: {
                organizerId: body.id,
            },
        },
        select: {
            totalPrice: true,
            createdAt: true,
        },
    });

    // Group and format revenue
    const grouped: Record<string, number> = {};

    for (const tx of transactions) {
        let key = "";
        switch (view) {
            case "daily":
                key = dayjs(tx.createdAt).format("D MMM"); // e.g. 5 Aug
                break;
            case "monthly":
                key = dayjs(tx.createdAt).format("MMM"); // e.g. Aug
                break;
            case "yearly":
                key = dayjs(tx.createdAt).format("YYYY"); // e.g. 2025
                break;
        }

        grouped[key] = (grouped[key] || 0) + tx.totalPrice;
    }

    // Convert to array for charting
    const revenueChart = Object.entries(grouped).map(([date, revenue]) => ({
        date,
        revenue,
    }));

    // Optional: sort by time
    revenueChart.sort((a, b) => {
        const aDate = dayjs(a.date, view === "yearly" ? "YYYY" : view === "monthly" ? "MMM" : "D MMM");
        const bDate = dayjs(b.date, view === "yearly" ? "YYYY" : view === "monthly" ? "MMM" : "D MMM");
        return aDate.isBefore(bDate) ? -1 : 1;
    });

    console.log(revenueChart);

    return {
        status: "success",
        message: "Revenue overview fetched successfully",
        data: revenueChart,
    };
};

export const getEventsSummaryService = async (organizerId: string) => {
    const events = await prisma.event.findMany({
        where: {
            organizerId,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            category: true,
            startDate: true,
            endDate: true,
            location: true,
            countries: {
                select: {
                    name: true,
                },
            },
            cities: {
                select: {
                    name: true,
                },
            },
            transactions: {
                where: { status: "DONE" },
                select: {
                    totalPrice: true,
                    quantity: true,
                },
            },
        },
        orderBy: {
            startDate: "desc",
        },
    });

    const formattedEvents = events.map((event) => {
        const ticketsSold = event.transactions.reduce(
            (total, tx) => total + tx.quantity,
            0,
        );

        const revenue = event.transactions.reduce(
            (total, tx) => total + tx.totalPrice,
            0,
        );

        return {
            id: event.id,
            name: event.name,
            category: event.category,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            country: event.countries.name,
            city: event.cities.name,
            location: event.location,
            ticketsSold,
            revenue,
        };
    });

    return {
        status: "success",
        message: "Events summary fetched successfully",
        data: formattedEvents,
    };
};