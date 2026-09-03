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
    statusCode = constants.VALIDATION_ERROR;
    err.message = Object.values(
      err.errors as Record<string, { message: string }>,
    )
      .map((item) => item.message)
      .join(", ");
  }

  // Send a structured JSON error response based on the resolved HTTP status code
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({
        title: "Validation Failed",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.UNAUTHORIZED:
      res.status(statusCode).json({
        title: "Unauthorized",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.FORBIDDEN:
      res.status(statusCode).json({
        title: "Forbidden",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.NOT_FOUND:
      res.status(statusCode).json({
        title: "Not Found",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.SERVER_ERROR:
    default:
      res.status(statusCode).json({
        title: "Server Error",
        message: err.message || "Internal Server Error",
        stackTrace: err.stack,
      });
      break;
  }
};

export default errorHandler;
