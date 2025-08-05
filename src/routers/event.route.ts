import express from "express";
import {
	createEventController,
	getAllEventCategories,
	getBannerController,
	getEventBySlugController,
	getEventsController,
} from "../controllers/event.controller";
import { uploaderMulter } from "../middlewares/Uploader.Multer";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const eventsRouter = express.Router();
const uploader = uploaderMulter(
	["image"], // Menerima tipe file gambar (jpeg, png, gif, dll.)
	"memory" // Simpan file di memori sebagai buffer
);

eventsRouter.get("/", getEventsController);
eventsRouter.get("/banner", getBannerController);
eventsRouter.get("/categories", getAllEventCategories);
eventsRouter.get("/:slug", getEventBySlugController);
eventsRouter.post(
	"/create",
	verifyToken,
	verifyRole("ORGANIZER"),
	uploader.fields([
		{ name: "banner", maxCount: 1 },
		{ name: "picture1", maxCount: 1 },
		{ name: "picture2", maxCount: 1 },
		{ name: "picture3", maxCount: 1 },
	]),
	createEventController
);

export default eventsRouter;
