import express from "express";
import authRouter from "./auth.route";
import eventsRouter from "./event.route";
import locationRouter from "./location.route";
import organizerRouter from "./organizer.route";
import userRouter from "./user.route";
import transactionRouter from "./transaction.route";

const mainRouter = express.Router();

mainRouter.use("/api/auth", authRouter);
mainRouter.use("/events", eventsRouter);
mainRouter.use("/location", locationRouter);
mainRouter.use("/organizer", organizerRouter);

export default mainRouter;