import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import * as yup from "yup";
import bcrypt from "bcryptjs";

// 1. Import dependencies
import { registerSchema } from "../validators/userValidator.js";
import { User } from "../models/userModel.js";
import constants from "../constants/constants.js";

export const registerUser = asyncHandler((async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 2. Validate payload using Yup schema (abortEarly: false checks ALL properties)
    const validatedBody = await registerSchema.validate(req.body, {
      abortEarly: false,
    });

    // Destructure properties from our cleanly validated, typed body object
    const { firstName, lastName, email, password } = validatedBody;

    // 3. Check for business collision logic (ensure user doesn't exist)
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      res.status(400);
      return next(new Error("User already registered with this email"));
    }

    // 4. Secure the incoming plaintext payload credentials using bcrypt hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Store new validated, hashed record safely inside MongoDB collection
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Maps securely hashed value into password slot
    });

    // 6. Deliver crisp success mapping payload back to client (sans core password string)
    res.status(constants.CREATED).json({
      message: "User registered successfully",
      data: {
        id: createdUser._id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
      },
    });
  } catch (error) {
    // 7. Parse and route structured schema failures cleanly down to express system handler
    if (error instanceof yup.ValidationError) {
      res.status(constants.FORBIDDEN);
      return next(new Error(`Validation Error: ${error.errors.join(", ")}`));
    }

    // Direct structural exceptions or database connection crashes down line safely
    return next(error);
  }
}) as any);
