import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { changePasswordService, getUserOverviewService, getUserProfileService, patchUserProfileService } from "../services/user.service";

export const getUserOverviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = res.locals.payload;

        if (!userId) throw new ApiError(401, "Unauthorized");

        const result = await getUserOverviewService(userId);

        return res.status(200).json({ result });
    } catch (error) {
        next(error);
    }
};

export const getUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = res.locals.payload; // ← from JWT
        const result = await getUserProfileService({ id: userId });
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const patchUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = res.locals.payload; // ← from JWT
        const result = await patchUserProfileService({ id: userId, ...req.body });
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = res.locals.payload; // ← from JWT
        const result = await changePasswordService({ id: userId, password: req.body.password }, req.body.currentPassword);
        res.status(200).send({ result });
    } catch (error) {
        next(error);
    }
};
