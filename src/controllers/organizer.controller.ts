import { NextFunction, Request, Response } from "express";
import { changePasswordService, getEventsSummaryService, getOrganizerProfileService, getOverviewService, getRevenueOverviewService, patchOrganizerProfileService } from "../services/organizer.service";

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

export const getOverviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organizerId } = res.locals.payload; // ← from JWT
        const result = await getOverviewService({ id: organizerId });
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const getRevenueOverviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organizerId } = res.locals.payload;

        // quert parameter `view`
        const view = req.query.view as "daily" | "monthly" | "yearly";
        const result = await getRevenueOverviewService({ id: organizerId }, view);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const getEventsSummaryController = async (req: Request, res: Response, next: NextFunction,) => {
    try {
        const { organizerId } = res.locals.payload;
        const result = await getEventsSummaryService(organizerId);
        res.status(200).json({ result });
    } catch (error) {
        next(error);
    }
};