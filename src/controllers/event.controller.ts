import { Request, Response } from "express";
import { getBannerService, getEventsService } from "../services/event.service";
import { ApiError } from "../utils/ApiError";

export const getEventsController = async (req: Request, res: Response) => {
	const result = await getEventsService();

	if (!result) throw new ApiError(401, "Get events UnSuccessfully");

	res.status(201).json({
		success: true,
		message: "Get Events data successfully",
		data: {
			result,
		},
	});
};

export const getBannerController = async (req: Request, res: Response) => {
	const result = await getBannerService();
	res.status(201).send(result);
};
