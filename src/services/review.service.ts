import prisma from "../config";

interface ISubmitReviewData {
	userId: string;
	eventId: string;
	rating: number;
	comment: string;
}

export const getToReviewListService = async (userId: string) => {
	const eventsToReview = await prisma.event.findMany({
		where: {
			endDate: {
				lt: new Date(),
			},
			transactions: {
				some: {
					userId: userId,
					status: "DONE",
				},
			},
			reviews: {
				none: {
					userId: userId,
				},
			},
		},
		select: {
			id: true,
			name: true,
			slug: true,
		},
		orderBy: {
			endDate: "desc",
		},
	});

	return eventsToReview;
};

export const submitReviewService = async (data: ISubmitReviewData) => {
	const { userId, eventId, rating, comment } = data;

	return prisma.$transaction(async (tx) => {
		const eligibleTransaction = await tx.transaction.findFirst({
			where: {
				userId,
				eventId,
				status: "DONE",
			},
		});

		if (!eligibleTransaction) {
			throw new Error("You are not eligible to review this event.");
		}

		const newReview = await tx.review.create({
			data: {
				rating,
				comment,
				user: { connect: { id: userId } },
				event: { connect: { id: eventId } },
			},
		});

		const eventRatingAggregation = await tx.review.aggregate({
			where: { eventId: eventId },
			_avg: { rating: true },
		});

		const newEventRating = eventRatingAggregation._avg.rating || 0;

		const updatedEvent = await tx.event.update({
			where: { id: eventId },
			data: { totalRating: newEventRating },
		});

		const organizerEvents = await tx.event.findMany({
			where: { organizerId: updatedEvent.organizerId },
			select: { totalRating: true },
		});

		const totalRatingSum = organizerEvents.reduce(
			(sum, event) => sum + event.totalRating,
			0
		);
		const newOrganizerRating = totalRatingSum / organizerEvents.length;

		await tx.organizer.update({
			where: { id: updatedEvent.organizerId },
			data: { ratings: newOrganizerRating },
		});

		return newReview; 
	});
};
