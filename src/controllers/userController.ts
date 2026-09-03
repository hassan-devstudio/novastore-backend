import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import * as yup from "yup";

// 1. import the validation schema rules
import { registerSchema } from "../validators/userValidator.js";

export const registerUser = asyncHandler((async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 2. Validate the request body
    // abortEarly: false forces Yup to check ALL fields, not just stop at the first error
    const validatedBody = await registerSchema.validate(req.body, {
      abortEarly: false,
    });

    // 3. Proceed with user registration logic if validation passes
    res.status(200).json({
      message: "Register user success",
      data: validatedBody,
    });
  } catch (error) {
    // 4. Catch Yup validation errors and format them neatly
    if (error instanceof yup.ValidationError) {
      res.status(400);
      return next(new Error(`Validation Error: ${error.errors.join(", ")}`));
    }

    // Pass any other unexpected server errors to Express handler
    return next(error);
  }
}) as any);
