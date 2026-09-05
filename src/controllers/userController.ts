import { Request, Response, NextFunction } from "express";
import { randomBytes, randomInt } from "node:crypto";
import * as yup from "yup";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
} from "../validators/userValidator.js";
import { User } from "../models/userModel.js";
import { PasswordReset } from "../models/passwordResetModel.js";
import constants from "../constants/constants.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";
import passwordResetEmail from "../utils/passwordResetEmail.js";

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

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the current and new password from the request body
    const { currentPassword, newPassword } =
      await changePasswordSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    // Find the logged-in user using the user ID from the JWT
    const user = await User.findById(req.user.userId);

    // Make sure the user still exists
    if (!user) {
      return next(new AppError("User not found", constants.NOT_FOUND));
    }

    // Compare the current password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    // Reject the request if the current password is incorrect
    if (!passwordMatch) {
      return next(
        new AppError("Current password is incorrect", constants.UNAUTHORIZED),
      );
    }

    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Replace the old password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Send a success response after the password has been updated
    res.status(constants.OK).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    // Convert Yup validation errors into our standard AppError
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }

    // Pass unexpected errors to the global error handler
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate the email from the request body
    const { email } = await forgotPasswordSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Find the user associated with the email
    const user = await User.findOne({ email });

    // Don't reveal whether an account exists with this email
    if (!user) {
      res.status(constants.OK).json({
        message:
          "If an account exists with this email, a verification code has been sent.",
      });
      return;
    }

    // Generate a cryptographically secure 6-digit OTP.
    const otp = randomInt(100000, 1000000).toString();

    // OTP will expire after 10 minutes
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Keep only the newest pending request and never store the OTP itself.
    await PasswordReset.deleteMany({ userId: user._id, verified: false });
    const hashedOtp = await bcrypt.hash(otp, 10);
    await PasswordReset.create({
      userId: user._id,
      otp: hashedOtp,
      otpExpiresAt,
    });

    const emailHtml = passwordResetEmail(user.firstName, otp);

    await sendEmail(
      user.email,
      "Your NovaStore Password Reset Code",
      emailHtml,
    );
    res.status(constants.OK).json({
      message:
        "If an account exists with this email, a verification code has been sent.",
    });
  } catch (error) {
    // Convert Yup validation errors into our standard AppError
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }

    // Pass unexpected errors to the global error handler
    next(error);
  }
};

export const verifyResetOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the email and six-digit OTP sent to the user.
    const { email, otp } = await verifyResetOtpSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Resolve the account without exposing whether the email is registered.
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError("Invalid or expired OTP", constants.UNAUTHORIZED),
      );
    }

    // Only the newest pending reset request can be used.
    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      verified: false,
    }).sort({ createdAt: -1 });

    // Reject expired requests before checking the submitted OTP.
    if (!resetRequest || resetRequest.otpExpiresAt < new Date()) {
      return next(
        new AppError("Invalid or expired OTP", constants.UNAUTHORIZED),
      );
    }

    // Limit guesses and compare against the bcrypt hash stored in MongoDB.
    if (resetRequest.attempts >= 5) {
      return next(
        new AppError("Too many OTP attempts", constants.UNAUTHORIZED),
      );
    }

    const otpMatches = await bcrypt.compare(otp, resetRequest.otp);
    if (!otpMatches) {
      resetRequest.attempts += 1;
      await resetRequest.save();
      return next(new AppError("Invalid OTP", constants.UNAUTHORIZED));
    }

    // Consume the OTP and issue a separate short-lived reset token.
    resetRequest.verified = true;
    const resetToken = randomBytes(32).toString("hex");
    resetRequest.resetTokenHash = await bcrypt.hash(resetToken, 10);
    resetRequest.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await resetRequest.save();

    res.status(constants.OK).json({
      message: "OTP verified successfully",
      data: { resetToken },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    next(error);
  }
};
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the email, reset token, and new password
    const { email, resetToken, newPassword } =
      await resetPasswordSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    // Find the user associated with the reset request
    const user = await User.findOne({ email });

    // Stop if the user does not exist
    if (!user) {
      return next(
        new AppError("Invalid or expired reset token", constants.UNAUTHORIZED),
      );
    }

    // Find the latest verified password reset request for this user
    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      verified: true,
    }).sort({ createdAt: -1 });

    // Make sure the reset token exists and has not expired
    if (
      !resetRequest?.resetTokenHash ||
      !resetRequest.resetTokenExpiresAt ||
      resetRequest.resetTokenExpiresAt < new Date()
    ) {
      return next(
        new AppError("Invalid or expired reset token", constants.UNAUTHORIZED),
      );
    }

    // Compare the provided reset token with the hashed token stored in the database
    const tokenMatches = await bcrypt.compare(
      resetToken,
      resetRequest.resetTokenHash,
    );

    // Reject the request if the token is invalid
    if (!tokenMatches) {
      return next(
        new AppError("Invalid or expired reset token", constants.UNAUTHORIZED),
      );
    }

    // Hash the new password before storing it in the database
    user.password = await bcrypt.hash(newPassword, 10);

    // Save the new password
    await user.save();

    // Delete the reset request so the token cannot be used again
    await PasswordReset.deleteOne({ _id: resetRequest._id });

    // Send a success response
    res.status(constants.OK).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    // Convert Yup validation errors into our standard AppError
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }

    // Pass unexpected errors to the global error handler
    next(error);
  }
};
