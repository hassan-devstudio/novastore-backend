import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { promisify } from "util";
import constants from "../constants/constants.js";

// Convert jwt.verify callback function into a Promise-based function with correct typings
const verifyToken = promisify(jwt.verify) as (
  token: string,
  secretOrPublicKey: jwt.Secret,
) => Promise<JwtPayload | string>;

/**
 * Authentication middleware to validate incoming JSON Web Tokens.
 * Extracts the token from the Bearer header, verifies it securely,
 * and attaches the decoded user payload to the request object.
 */
const validateToken = asyncHandler((async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  // Validate that the authorization header exists and follows the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error: any = new Error("User is not authorized or token is missing");
    error.statusCode = constants.UNAUTHORIZED;
    throw error;
  }

  // Extract the raw token string from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the same secret used when the token was created.
    const decoded = await verifyToken(
      token,
      process.env.JWT_SECRET as string,
    );

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      const error: any = new Error("User is not authorized or token is invalid");
      error.statusCode = constants.UNAUTHORIZED;
      throw error;
    }

    // Attach the verified user's information to the typed request object.
    req.user = {
      userId: decoded.userId,
      email: typeof decoded.email === "string" ? decoded.email : undefined,
    };

    // Proceed to the next middleware or controller function
    next();
  } catch (err) {
    const error: any = new Error("User is not authorized or token is invalid");
    error.statusCode = constants.UNAUTHORIZED;
    throw error;
  }
}) as any);

export default validateToken;
