import express from "express";
import authRouter from "./auth.route";
import eventsRouter from "./event.route";
import locationRouter from "./location.route";

const mainRouter = express.Router();

// mainRouter.use('/api/samples', require('./sample.router'));
mainRouter.use("/api/auth", authRouter);
mainRouter.use("/events", eventsRouter);
mainRouter.use("/location", locationRouter)

export default mainRouter;
