import { Request, Response, NextFunction } from "express";
import constants from "../constants/constants.js";

/**
 * Global error-handling middleware for Express applications.
 * Captures thrown or passed errors, assigns appropriate status codes,
 * formats Mongoose-specific errors, and returns structured JSON responses.
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Fallback order: custom status code -> custom status property -> default 500 server error
  let statusCode = err.statusCode || err.status || constants.SERVER_ERROR;

  // Handle Mongoose invalid database ID syntax (CastError)
  if (err.name === "CastError") {
    statusCode = constants.NOT_FOUND;
    err.message = `Resource not found with id: ${err.value}`;
  }

  // Handle Mongoose schema validation failures and extract individual error messages
  if (err.name === "ValidationError") {
    statusCode = constants.BAD_REQUEST;
    err.message = Object.values(
      err.errors as Record<string, { message: string }>,
    )
      .map((item) => item.message)
      .join(", ");
  }

  const titleByStatus: Record<number, string> = {
    [constants.BAD_REQUEST]: "Validation Failed",
    [constants.UNAUTHORIZED]: "Unauthorized",
    [constants.FORBIDDEN]: "Forbidden",
    [constants.NOT_FOUND]: "Not Found",
    [constants.SERVER_ERROR]: "Server Error",
  };

  // Send a consistent response that frontend clients can handle.
  res.status(statusCode).json({
    statusCode,
    title: titleByStatus[statusCode] || "Error",
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
