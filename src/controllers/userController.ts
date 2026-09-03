import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

/**
 * Handle user registration.
 * Route: POST /api/users/register
 */
const registerUser = asyncHandler((async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return next(new Error("All fields are required"));
  }
  res.status(200).json({ message: "Register user" });
}) as any);

export default registerUser;
