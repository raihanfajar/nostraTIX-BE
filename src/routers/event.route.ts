import express from "express";
import {
	getAllEventCategories,
	getBannerController,
	getEventBySlugController,
	getEventsController,
} from "../controllers/event.controller";

const eventsRouter = express.Router();

eventsRouter.get("/", getEventsController);
eventsRouter.get("/banner", getBannerController);
eventsRouter.get("/categories", getAllEventCategories);
eventsRouter.get("/:slug", getEventBySlugController);

export default eventsRouter;
