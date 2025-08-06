import express from "express";
import { changePasswordController, getUserOverviewController, getUserProfileController, patchUserProfileController } from "../controllers/user.controller";
import { verifyRole, verifyToken } from "../middlewares/jwt.middleware";

const userRouter = express.Router();

userRouter.get("/overview", verifyToken, getUserOverviewController);
userRouter.get("/profile", verifyToken, getUserProfileController);
userRouter.patch("/profile/update", verifyToken, patchUserProfileController);
userRouter.patch("/profile/change-password", verifyToken, verifyRole("USER"), changePasswordController)

export default userRouter;