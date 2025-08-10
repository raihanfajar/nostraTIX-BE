import express from "express";
import { loginOrganizerController, loginUserController, organizerSessionLoginController, registerOrganizerController, registerUserController, resetPasswordController, resetPasswordUpdateController, sessionLoginController, validateReferralCodeController } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/jwt.middleware";

const authRouter = express.Router();

authRouter.post("/session-login-user", sessionLoginController);
authRouter.post("/session-login-organizer", organizerSessionLoginController);
authRouter.post("/register-user", registerUserController);
authRouter.post("/register-organizer", registerOrganizerController);
authRouter.post("/login-user", loginUserController);
authRouter.post("/login-organizer", loginOrganizerController);
authRouter.post("/validate-referral-code", validateReferralCodeController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.patch("/reset-password-update", verifyToken, resetPasswordUpdateController);

export default authRouter;