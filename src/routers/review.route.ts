import express from "express";
import { verifyToken } from "../middlewares/jwt.middleware";
import {
	getToReviewListController,
	submitReviewController,
} from "../controllers/review.controller";

const reviewRouter = express.Router();

reviewRouter.get(`/to-review`, verifyToken, getToReviewListController);
reviewRouter.post("/", verifyToken, submitReviewController);

export default reviewRouter;
