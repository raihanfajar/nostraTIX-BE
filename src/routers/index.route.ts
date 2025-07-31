import express from "express"
import authRouter from "./auth.route";

const mainRouter = express.Router();

// mainRouter.use('/api/samples', require('./sample.router'));
mainRouter.use('/auth', authRouter);

export default mainRouter;