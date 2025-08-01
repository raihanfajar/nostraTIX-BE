import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken";
import { Role } from "../generated/prisma";
import { ApiError } from "../utils/ApiError";

export const verifyToken = (secretKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new ApiError(401, "Token not provided!");

    verify(token, secretKey, (err, payload) => {
      if (err) throw new ApiError(401, "Token Expired/Invalid token!");

      res.locals.user = payload; // Store the payload in res.locals for access in subsequent middleware or route handlers
      next(); // Proceed to the next middleware or route handler
    })
  }
}

export const verifyRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user.role;

    if (!userRole) throw new ApiError(403, "Unauthorized access!");

    if (!userRole || !roles.includes(userRole)) throw new ApiError(403, "Forbidden: You do not have the required role!");

    next(); // Proceed to the next middleware or route handler
  }
}