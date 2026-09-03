// import express frame
import express from "express";

// import dotenv for environment variables
import dotenv from "dotenv";
import errorHandler from "./src/middleware/errorHandler.js";
import connectDB from "./src/config/dbConnect.js";

// initliaze express app
const app = express();

// load environment variables
dotenv.config();

// parse json data
app.use(express.json());

// get port from environment variables
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};
startServer();
