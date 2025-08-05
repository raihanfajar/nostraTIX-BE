import express from "express";
import { changePasswordController, getEventsSummaryController, getOrganizerProfileController, getOverviewController, getRevenueOverviewController, patchOrganizerProfileController } from "../controllers/organizer.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const organizerRouter = express.Router();

// !Profile
organizerRouter.get("/profile", verifyToken, verifyRole("ORGANIZER"), getOrganizerProfileController);
organizerRouter.patch("/profile/update", verifyToken, verifyRole("ORGANIZER"), patchOrganizerProfileController);
organizerRouter.patch("/profile/change-password", verifyToken, verifyRole("ORGANIZER"), changePasswordController);

// !Overview
organizerRouter.get("/overview", verifyToken, verifyRole("ORGANIZER"), getOverviewController);
organizerRouter.get("/overview/revenue-overview", verifyToken, verifyRole("ORGANIZER"), getRevenueOverviewController);

// !Events
organizerRouter.get("/events/events-summary", verifyToken, verifyRole("ORGANIZER"), getEventsSummaryController);

export default organizerRouter;