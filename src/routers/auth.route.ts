import express from "express";
import { loginOrganizerController, loginUserController, registerOrganizerController, registerUserController } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register-user", registerUserController);
authRouter.post("/register-organizer", registerOrganizerController);
authRouter.post("/login-user", loginUserController);
authRouter.post("/login-organizer", loginOrganizerController);

export default authRouter;