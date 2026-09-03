import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import constants from "../constants/constants.js";

// Convert jwt.verify callback API into a Promise-based function
const verifyToken = promisify(jwt.verify);

const validateToken = asyncHandler(async (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  // Make sure the header exists and follows:
  // Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("User is not authorized or token is missing");
    error.statusCode = constants.UNAUTHORIZED;

    throw error;
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT using the secret key
    const decoded = await verifyToken(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Attach the logged-in user's information to the request
    req.user = decoded.user;

    // Continue to the next middleware/controller
    next();
  } catch (err) {
    const error = new Error("User is not authorized or token is invalid");
    error.statusCode = constants.UNAUTHORIZED;

    throw error;
  }
});

export default validateToken;