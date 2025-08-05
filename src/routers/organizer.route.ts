import express from "express";
import { changePasswordController, getOrganizerProfileController, patchOrganizerProfileController } from "../controllers/organizer.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const organizerRouter = express.Router();

organizerRouter.get("/profile", verifyToken, verifyRole("ORGANIZER"), getOrganizerProfileController);
organizerRouter.patch("/profile/update", verifyToken, verifyRole("ORGANIZER"), patchOrganizerProfileController);
organizerRouter.patch("/profile/change-password", verifyToken, verifyRole("ORGANIZER"), changePasswordController);

organizerRouter.get("/profile/overview", verifyToken, verifyRole("ORGANIZER"), getOrganizerProfileController);


export default organizerRouter;