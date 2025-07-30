import prisma from "../config";

export const getEventsService = async () => {
	const events = await prisma.event.findMany({
		include: {
			pictures: true, // Nama relasi di model Event Anda
		},
	});
	return events;
};

export const getBannerService = async () => {
	return await prisma.eventPicture.findMany({
		orderBy: {
			updatedAt: "desc",
		},
		take: 5,
	});
};
