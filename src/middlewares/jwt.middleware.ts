import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express"
import { Role } from "../generated/prisma";
import { ApiError } from "../utils/ApiError";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log(">>>> Verifying token <<<<");
  
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) throw new ApiError(401, "Token not provided!");

  const payload = await jwt.verify(token, process.env.JWT_SECRET!);

  if (!payload) throw new ApiError(401, "Invalid token!");

  res.locals.payload = payload;

  next();
}

export const verifyRole = (roles: string) => {
  console.log(">>>> Verifying role <<<<");
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.payload.role;

    if (!userRole) throw new ApiError(403, "Unauthorized access!");

    if (userRole !== roles) throw new ApiError(403, "Forbidden: You do not have the required role!");

    next(); // Proceed to the next middleware or route handler
  }
}