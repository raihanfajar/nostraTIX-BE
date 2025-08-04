import { Request, Response, NextFunction } from "express";
import {
    loginOrganizerService,
    loginUserService,
    organizerSessionLoginService,
    registerOrganizerService,
    registerUserService,
    sessionLoginService,
    validateReferralCodeService
} from "../services/auth.service";

export const registerUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await registerUserService(req.body, req.body?.referralCode);
        res.status(201).send({ result });
    } catch (error) {
        next(error);
    }
};

export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await loginUserService(req.body);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const registerOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await registerOrganizerService(req.body);
        res.status(201).send({ result });
    } catch (error) {
        next(error);
    }
};

export const loginOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await loginOrganizerService(req.body);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const validateReferralCodeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await validateReferralCodeService(req.body);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
}

export const sessionLoginController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.payload;

    const result = await sessionLoginService(userId);

    res.status(200).send({ result })

    // isian result = { status: "success", message: "Organizer found", details: findOrganizerById }
}

export const organizerSessionLoginController = async (req: Request, res: Response, next: NextFunction) => {
    const { organizerId } = res.locals.payload;

    const result = await organizerSessionLoginService(organizerId);

    res.status(200).send({ result });
}
