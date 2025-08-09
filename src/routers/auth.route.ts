import express from "express";
import { loginOrganizerController, loginUserController, organizerSessionLoginController, registerOrganizerController, registerUserController, sessionLoginController, userResetPasswordController, validateReferralCodeController } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/session-login-user", sessionLoginController);
authRouter.post("/session-login-organizer", organizerSessionLoginController);
authRouter.post("/register-user", registerUserController);
authRouter.post("/register-organizer", registerOrganizerController);
authRouter.post("/login-user", loginUserController);
authRouter.post("/login-organizer", loginOrganizerController);
authRouter.post("/validate-referral-code", validateReferralCodeController);
authRouter.post("/reset-password-user", userResetPasswordController);

export default authRouter;