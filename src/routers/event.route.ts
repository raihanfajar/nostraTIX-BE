import express from "express";
import {
	getBannerController,
	getEventsController,
} from "../controllers/event.controller";

const eventsRouter = express.Router();

eventsRouter.get("/", getEventsController);
eventsRouter.get("/banner", getBannerController);

export default eventsRouter;
