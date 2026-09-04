import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import * as yup from "yup";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. Import dependencies
import { loginSchema, registerSchema } from "../validators/userValidator.js";
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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate and sanitize the login request.
    const { email, password } = await loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Find the user by email.
    const user = await User.findOne({ email });

    // Use the same error message for both invalid email
    // and invalid password to avoid revealing account information.
    if (!user) {
      return next(new Error("Invalid email or password"));
    }

    // Compare the plain-text password with the stored bcrypt hash.
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return next(new Error("Invalid email or password"));
    }

    // Generate a JWT after successful authentication.
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      },
    );

    // Return the JWT and safe user information.
    // Never return the password or password hash.
    res.status(constants.OK).json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    // Handle Yup validation errors.
    if (error instanceof yup.ValidationError) {
      res.status(constants.FORBIDDEN);

      return next(new Error(`Validation Error: ${error.errors.join(", ")}`));
    }

    // Forward unexpected errors to the global error handler.
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  // Remove the authentication cookie from the browser.
  res.clearCookie("accessToken");

  // Tell the client that logout was successful.
  res.status(constants.OK).json({
    message: "Logout successful",
  });
};
