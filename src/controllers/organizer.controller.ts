import { NextFunction, Request, Response } from "express";
import { getOrganizerProfileService } from "../services/organizer.service";

// src/controllers/organizer.controller.ts
export const getOrganizerProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organizerId } = res.locals.payload; // ← from JWT
        console.log(organizerId);
        // const result = await getOrganizerProfileService({ id: organizerId });
        // res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};