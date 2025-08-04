import express from "express";
import { getOrganizerProfileController } from "../controllers/organizer.controller";

const organizerRouter = express.Router();

organizerRouter.get("/profile", getOrganizerProfileController);

export default organizerRouter;