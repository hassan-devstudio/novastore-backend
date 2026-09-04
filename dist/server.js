import express from "express";
import dotenv from "dotenv";
import errorHandler from "./src/middleware/errorHandler.js";
import connectDB from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import AppError from "./src/utils/AppError.js";
// Load environment variables before any configuration
dotenv.config();
// Initialize Express application
const app = express();
const port = process.env.PORT || 5000;
// Middleware: Parse incoming JSON payloads
app.use(express.json());
// ==========================
// ROUTES
// ==========================
app.use("/api/users", userRoutes);
// ==========================
// ERROR HANDLING MIDDLEWARE
// ==========================
// Catch-all 404 Not Found (Must be placed AFTER all valid routes)
app.use((req, res, next) => {
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
});
// Centralized error handler (Must be the last middleware)
app.use(errorHandler);
// ==========================
// GLOBAL CRASH HANDLERS
// ==========================
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason.message);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error.message);
    process.exit(1);
});
// ==========================
// SERVER INITIALIZATION
// ==========================
const startServer = async () => {
    try {
        // Establish database connection first
        await connectDB();
        // Start listening for requests only if DB connection succeeds
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server due to database error:", error.message);
        process.exit(1);
    }
};
startServer();
