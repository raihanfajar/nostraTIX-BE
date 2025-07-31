import prisma from "../config";
import { Prisma } from "../generated/prisma";
import { query } from "../types/query";

export const getEventsService = async (query: query) => {
	const { name, category, countryId, cityId, location } = query;

	const whereClause: Prisma.EventWhereInput = {};

	if (name) whereClause.name = { contains: name, mode: "insensitive" };
	if (countryId) whereClause.countryId = { equals: Number(countryId) };
	if (cityId) whereClause.cityId = { equals: Number(cityId) };
	if (location)
		whereClause.location = { contains: location, mode: "insensitive" };
	whereClause.endDate = {
		gte: new Date(), // gte = greater than or equal to
	};
	if (category) whereClause.category = { equals: category };

	const events = await prisma.event.findMany({
		where: whereClause,
		include: {
			pictures: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	return events;
};

export const getBannerService = async () => {
	return await prisma.eventPicture.findMany({
		where: {
			// Akses relasi 'event' dan filter kolom di dalamnya
			event: {
				endDate: {
					lt: new Date(),
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 5,
	});
};
