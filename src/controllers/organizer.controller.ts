import { NextFunction, Request, Response } from "express";
import { getOrganizerProfileService } from "../services/organizer.service";

export const getOrganizerProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getOrganizerProfileService(req.body);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
}