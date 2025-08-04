import express from "express";
import { getOrganizerProfileController } from "../controllers/organizer.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const organizerRouter = express.Router();

organizerRouter.get("/profile", verifyToken, verifyRole("ORGANIZER"), getOrganizerProfileController);

export default organizerRouter;