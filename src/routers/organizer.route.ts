import express from "express";
import { getOrganizerProfileController, patchOrganizerProfileController } from "../controllers/organizer.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const organizerRouter = express.Router();

organizerRouter.get("/profile", verifyToken, verifyRole("ORGANIZER"), getOrganizerProfileController);
organizerRouter.patch("/profile/update", verifyToken, verifyRole("ORGANIZER"), patchOrganizerProfileController);


export default organizerRouter;