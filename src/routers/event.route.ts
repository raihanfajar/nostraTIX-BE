import express from "express";
import {
	getBannerController,
	getEventBySlugController,
	getEventsController,
} from "../controllers/event.controller";

const eventsRouter = express.Router();

eventsRouter.get("/", getEventsController);
eventsRouter.get("/:slug", getEventBySlugController);
eventsRouter.get("/banner", getBannerController);


export default eventsRouter;
