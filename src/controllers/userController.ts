import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  profileSchema,
  registerSchema,
} from "../validators/userValidator.js";
import { User } from "../models/userModel.js";
import constants from "../constants/constants.js";
import AppError from "../utils/AppError.js";

const validationError = (error: yup.ValidationError) =>
  new AppError(
    `Validation Error: ${error.errors.join(", ")}`,
    constants.BAD_REQUEST,
  );

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } =
      await registerSchema.validate(req.body, { abortEarly: false });

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return next(
        new AppError(
          "User already registered with this email",
          constants.BAD_REQUEST,
        ),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

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
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = await loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError("Invalid email or password", constants.UNAUTHORIZED),
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(
        new AppError("Invalid email or password", constants.UNAUTHORIZED),
      );
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

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
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    next(error);
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie("accessToken");
  res.status(constants.OK).json({ message: "Logout successful" });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { phone, address, avatar } = await profileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { phone, address, avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new AppError("User not found", constants.NOT_FOUND));
    }

    res.status(constants.OK).json({
      message: "Profile updated successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return next(new AppError("Password is required", constants.BAD_REQUEST));
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError("User not found", constants.NOT_FOUND));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError("Invalid password", constants.UNAUTHORIZED));
    }

    await User.findByIdAndDelete(req.user.userId);
    res.status(constants.OK).json({
      message: "User account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get the logged-in user's ID from the verified JWT.
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return next(new AppError("User not found", constants.NOT_FOUND));
    }

    res.status(constants.OK).json({
      message: "Current user fetched successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
