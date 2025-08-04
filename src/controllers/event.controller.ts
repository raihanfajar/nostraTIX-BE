import { Request, Response } from "express";
import {
	createEventService,
	getBannerService,
	getEventBySlugService,
	getEventsService,
} from "../services/event.service";
import { Category } from "../generated/prisma";
import { ApiError } from "../utils/ApiError";
import { ICreateEvent, IEventPictures, ITicketCategory } from "../types/event";
import multer from "multer";

const upload = multer().fields([
  { name: 'banner', maxCount: 1 },
  { name: 'picture1', maxCount: 1 },
  { name: 'picture2', maxCount: 1 },
  { name: 'picture3', maxCount: 1 }
]);

export const getEventsController = async (req: Request, res: Response) => {
	const query = req.query;
	const result = await getEventsService(query);

	if (!result) throw new ApiError(401, "Get events UnSuccessfully");

	res.status(201).json({
		success: true,
		message: "Get Events data successfully",
		data: {
			result,
		},
	});
};

export const getBannerController = async (_: Request, res: Response) => {
	const result = await getBannerService();
	res.status(201).send(result);
};

export const getEventBySlugController = async (req: Request, res: Response) => {
	const slug = req.params.slug;
	const result = await getEventBySlugService(slug);
	res.status(201).send(result);
};

export const getAllEventCategories = async (_: Request, res: Response) => {
	const result = Object.values(Category);
	res.status(201).json(result);
};

export const createEventController = async (req: Request, res: Response) => {
  try {
    // 1. Validate files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.banner?.[0] || !files.picture1?.[0]) {
      throw new ApiError(400, "Banner and Picture1 are required");
    }

    // 2. Get and validate body data
    const {
      name,
      description,
      category,
      countryId,
      cityId,
      location,
      startDate,
      endDate,
      ticketCategories: ticketCategoriesString,
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !countryId || !cityId || !location || !startDate || !endDate) {
      throw new ApiError(400, "All required fields must be provided");
    }

    // 3. Validate category
    if (!Object.values(Category).includes(category)) {
      throw new ApiError(400, "Invalid category value");
    }

    // 4. Get organizerId from token
    const { organizerId } = res.locals.payload;
    // const organizerId = "5ed9f8d9-65a7-4c7b-bdd6-a1c973bf30f4"; // Placeholder for organizerId, replace with actual logic to get from token
    if (!organizerId) {
      throw new ApiError(401, "Unauthorized: Missing organizer ID");
    }

    // 5. Parse and validate ticket categories
    let ticketCategories: ITicketCategory[];
    try {
      if (!ticketCategoriesString || typeof ticketCategoriesString !== "string") {
        throw new ApiError(400, "Ticket categories are required");
      }
      ticketCategories = JSON.parse(ticketCategoriesString);
      
      // Validate ticket categories structure
      if (!Array.isArray(ticketCategories) || ticketCategories.length === 0) {
        throw new ApiError(400, "At least one ticket category is required");
      }
      
      // Validate each ticket category
      ticketCategories.forEach(ticket => {
        if (!ticket.name || !ticket.description || !ticket.price || !ticket.seatQuota) {
          throw new ApiError(400, "Invalid ticket category format");
        }
      });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(400, "Invalid ticket categories format");
    }

    // 6. Create event payload
    const eventPayload: ICreateEvent = {
      organizerId,
      name,
      description,
      category,
      countryId: Number(countryId),
      cityId: Number(cityId),
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      files,
      ticketCategories,
      eventPictures: {
        banner: files.banner[0],
        picture1: files.picture1[0],
        picture2: files.picture2?.[0],
        picture3: files.picture3?.[0],
      }
    };

    // 7. Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }
    if (startDateTime >= endDateTime) {
      throw new ApiError(400, "End date must be after start date");
    }

    // 8. Call service and return response
    const event = await createEventService(eventPayload);
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    console.error("Create event error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
