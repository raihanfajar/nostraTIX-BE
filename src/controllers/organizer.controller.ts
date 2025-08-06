import { NextFunction, Request, Response } from "express";
import { changePasswordService, deleteEventService, editEventService, getEventAttendeesService, getEventsSummaryService, getOrganizerProfileService, getOverviewService, getRevenueOverviewService, patchOrganizerProfileService } from "../services/organizer.service";

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

export const getEventAttendeesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const result = await getEventAttendeesService(eventId);
        res.status(200).json({ result });
    } catch (error) {
        next(error);
    }
};

export const deleteEventController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const result = await deleteEventService(eventId);
        res.status(200).json({ result });
    } catch (error) {
        next(error);
    }
};


export const editEventController = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { organizerId } = res.locals.payload;

        if (!organizerId) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized access",
            });
        }

        const {
            name,
            description,
            category,
            location,
            startDate,
            endDate,
        } = req.body;

        const updatedEvent = await editEventService({
            eventId,
            organizerId,
            name,
            category,
            location,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        return res.status(200).json({
            status: "success",
            message: "Event updated successfully",
            data: updatedEvent,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.message || "Something went wrong",
        });
    }
};

