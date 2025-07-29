// middlewares/ApiErrorHandler.ts
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const ApiErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    // If it's our custom ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;

        // log only operational errors
        if (err.isOperational) {
            console.error(`[ApiError] ${err.statusCode} - ${err.message}`);
        }
    }

    // Prisma error handling
    else if (err instanceof PrismaClientKnownRequestError) {
        statusCode = 400;
        message = `Prisma Error: ${err.message}`;
        console.error(`[PrismaError] ${err.code} - ${err.message}`);
    }

    else if (err instanceof PrismaClientValidationError) {
        statusCode = 422;
        message = 'Validation failed.';
        console.error(`[ValidationError] ${err.message}`);
    }

    else {
        // Unhandled error, only log generic message (not detailed stack)
        console.error(`[UnhandledError] ${err.name}: ${err.message}`);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};
