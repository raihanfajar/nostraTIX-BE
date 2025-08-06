import prisma from "../config";
import { Category, Prisma } from "../generated/prisma";
import { ICreateEvent, IEventPictures } from "../types/event";
import { query } from "../types/query";
import { ApiError } from "../utils/ApiError";
import { cloudinaryUpload } from "../utils/cloudinary";
import { generateUniqueSlug } from "../utils/generateSlug";

export const getEventsService = async (query: query) => {
	const { name, category, countryId, cityId, location, limit, page } = query;

	const take = limit ? Number(limit) : 10;
	const currentPage = page ? Number(page) : 1;

	const whereClause: Prisma.EventWhereInput = {};

	if (name) whereClause.name = { contains: name, mode: "insensitive" };
	if (countryId) whereClause.countryId = Number(countryId);
	if (cityId) whereClause.cityId = Number(cityId);
	if (location)
		whereClause.location = { contains: location, mode: "insensitive" };
	whereClause.endDate = {
		gte: new Date(), // gte = greater than or equal to
	};
	if (category) whereClause.category = { equals: category };

	const events = await prisma.event.findMany({
		take: take,
		skip: (currentPage - 1) * Number(take),
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
					gte: new Date(),
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 5,
	});
};

export const getEventBySlugService = async (slug: string) => {
	const event = await prisma.event.findUnique({
		where: { slug },
		include: {
			pictures: true,
			ticketCategories: true,
			organizer: {
				select: {
					name: true,
					profilePicture: true,
					slug: true,
				},
			},
		},
	});
	if (!event) throw new ApiError(404, "Event not found");

	return event;
};

export const createEventService = async (data: ICreateEvent) => {
	const {
		organizerId,
		name,
		description,
		category,
		countryId,
		cityId,
		location,
		startDate,
		endDate,
		files,
		ticketCategories,
	} = data;

	return prisma.$transaction(async (tx) => {
		console.log(">>>> Creating event service <<<<");
		try {
			// 1. Validate input data
			if (!files || !ticketCategories) {
				throw new ApiError(400, "Files and ticket categories are required");
			}

			// 1.1 Validate Category
			if (!Object.values(Category).includes(category)) {
				throw new ApiError(400, "Invalid category value");
			}

			// 2. Generate slug
			const slug = await generateUniqueSlug(name);

			// 3. Create event
			const event = await tx.event.create({
				data: {
					organizerId,
					name,
					slug,
					description,
					category,
					countryId,
					cityId,
					location,
					startDate: new Date(startDate),
					endDate: new Date(endDate),
				},
			});

			// 4. Process and upload images
			if (!files.banner?.[0] || !files.picture1?.[0]) {
				throw new ApiError(400, "Banner and Picture1 are required");
			}

			const eventPictures: IEventPictures = {
				banner: files.banner[0],
				picture1: files.picture1[0],
				picture2: files.picture2?.[0],
				picture3: files.picture3?.[0],
			};

			// 5. Upload pictures using the separate function
			const pictures = await uploadEventPictures(eventPictures, event.id, tx);
			console.log(">>>> Event Pictures Uploaded:", pictures);

			// 6. Create ticket categories
			const ticketPromises = ticketCategories.map((ticket) => {
				console.log(">>>> Creating ticket category:", ticket.name);
				return tx.ticketEventCategory.create({
					data: {
						eventId: event.id,
						name: ticket.name,
						description: ticket.description,
						price: ticket.price,
						seatQuota: ticket.seatQuota,
					},
				});
			});

			// 7. Wait for all ticket categories to be created
			const tickets = await Promise.all(ticketPromises);
			console.log(">>>> Ticket Categories Created:", tickets);

			// 8. Return complete event with relations
			return await tx.event.findUnique({
				where: { id: event.id },
				include: {
					pictures: true,
					ticketCategories: true,
					organizer: {
						select: {
							name: true,
							profilePicture: true,
						},
					},
				},
			});
		} catch (error) {
			// Rollback will happen automatically on error
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError(500, "Failed to create event");
		}
	});
};

const uploadEventPictures = async (
	files: IEventPictures,
	eventId: string,
	tx: any
): Promise<any> => {
	try {
		// Upload images to Cloudinary
		const uploadPromises = [
			cloudinaryUpload(files.banner.buffer),
			cloudinaryUpload(files.picture1.buffer),
		];

		if (files.picture2) {
			uploadPromises.push(cloudinaryUpload(files.picture2.buffer));
		}
		if (files.picture3) {
			uploadPromises.push(cloudinaryUpload(files.picture3.buffer));
		}

		const uploadResults = await Promise.all(uploadPromises);

		// Create event picture record
		return await tx.eventPicture.create({
			data: {
				eventId,
				banner: uploadResults[0].secure_url,
				picture1: uploadResults[1].secure_url,
				picture2: uploadResults[2]?.secure_url || null,
				picture3: uploadResults[3]?.secure_url || null,
			},
		});
	} catch (error) {
		throw new ApiError(500, "Failed to upload event pictures");
	}
};
