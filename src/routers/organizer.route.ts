import express from "express";
import { changePasswordController, deleteEventController, editEventController, getEventAttendeesController, getEventsSummaryController, getOrganizerProfileController, getOverviewController, getPendingTransactionsByOrganizerIdController, getRevenueOverviewController, patchOrganizerProfileController } from "../controllers/organizer.controller";
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
organizerRouter.get("/events/:eventId/attendees", verifyToken, verifyRole("ORGANIZER"), getEventAttendeesController);
organizerRouter.delete("/events/delete/:eventId", verifyToken, verifyRole("ORGANIZER"), deleteEventController);
organizerRouter.patch("/events/edit/:eventId", verifyToken, verifyRole("ORGANIZER"), editEventController);

// !Transactions
organizerRouter.get("/transactions/pending", verifyToken, verifyRole("ORGANIZER"), getPendingTransactionsByOrganizerIdController);

export default organizerRouter;