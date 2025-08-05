import { NextFunction, Request, Response } from "express";
import { changePasswordService, getOrganizerProfileService, patchOrganizerProfileService } from "../services/organizer.service";

// src/controllers/organizer.controller.ts
export const getOrganizerProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organizerId } = res.locals.payload; // ← from JWT
        const result = await getOrganizerProfileService({ id: organizerId });
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const patchOrganizerProfileController = async (req: Request, res: Response, next: NextFunction) => {
    console.log("ayam");
    try {
        const { organizerId } = res.locals.payload; // ← from JWT
        const result = await patchOrganizerProfileService({ id: organizerId, ...req.body });
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organizerId } = res.locals.payload; // ← from JWT
        const result = await changePasswordService({ id: organizerId, password: req.body.password }, req.body.currentPassword);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};