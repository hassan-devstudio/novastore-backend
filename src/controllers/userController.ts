import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const registerUser = asyncHandler((async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // 1. Extract registration data from request body
  const { firstName, lastName, email, password } = req.body;

  // 2. Track missing fields for granular validation feedback
  const missingFields: string[] = [];

  if (!firstName) missingFields.push("First name");
  if (!lastName) missingFields.push("Last name");
  if (!email) missingFields.push("Email");
  if (!password) missingFields.push("Password");

  // 3. If any fields are missing, halt execution and trigger error middleware
  if (missingFields.length > 0) {
    // Creates a readable message like: "Missing fields: First name, Last name"
    const errorMessage = `Validation Error: Missing required fields ${missingFields.join(", ")}`;
    return next(new Error(errorMessage));
  }

  // 4. Proceed with user registration logic if validation passes
  res.status(200).json({ message: "Register user" });
}) as any);
