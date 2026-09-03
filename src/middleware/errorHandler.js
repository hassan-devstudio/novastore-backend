import constants from "../constants/constants.js";

// Global error-handling middleware
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || constants.SERVER_ERROR;

    if (err.name === "CastError") {
        statusCode = constants.NOT_FOUND;
        err.message = `Resource not found with id: ${err.value}`;
    }

    if (err.name === "ValidationError") {
        statusCode = constants.VALIDATION_ERROR;
        err.message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // Send different responses based on the error status code.
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