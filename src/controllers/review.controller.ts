import { Request, Response } from "express";
import { getToReviewListService, submitReviewService } from "../services/review.service";

export const getToReviewListController = async (
	req: Request,
	res: Response
) => {
	try {
		const { userId } = res.locals.payload;

		const reviewableEvents = await getToReviewListService(userId);

		res.status(200).json({
			message: "Successfully fetched reviewable events.",
			data: reviewableEvents,
		});
	} catch (error) {
		res.status(500).json({ message: `Failed to fetch list: ${error}` });
	}
};

export const submitReviewController = async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals.payload;
    const { eventId, rating, comment } = req.body; 

    if (!eventId || !rating) {
      return res.status(400).json({ message: "Event ID and rating are required." });
    }

    const result = await submitReviewService({
      userId,
      eventId,
      rating,
      comment,
    });

    res.status(201).json({ // Use 201 for resource creation
      message: "Review submitted successfully.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};