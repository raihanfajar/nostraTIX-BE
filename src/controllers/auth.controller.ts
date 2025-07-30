import { Request, Response, NextFunction } from "express";
import {
    loginOrganizerService,
    loginUserService,
    registerOrganizerService,
    registerUserService
} from "../services/auth.service";

export const registerUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await registerUserService(req.body, req.body.referralCode);
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
