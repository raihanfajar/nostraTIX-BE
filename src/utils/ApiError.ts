export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // maintain proper stack trace (for V8 engine)
    Error.captureStackTrace(this, this.constructor);
  }
}
