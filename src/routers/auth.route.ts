import express from "express";
import { loginOrganizerController, loginUserController, organizerSessionLoginController, registerOrganizerController, registerUserController, sessionLoginController, validateReferralCodeController } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/session-login-user", sessionLoginController);
authRouter.post("/session-login-organizer", organizerSessionLoginController);
authRouter.post("/register-user", registerUserController);
authRouter.post("/register-organizer", registerOrganizerController);
authRouter.post("/login-user", loginUserController);
authRouter.post("/login-organizer", loginOrganizerController);
authRouter.post("/validate-referral-code", validateReferralCodeController);

export default authRouter;