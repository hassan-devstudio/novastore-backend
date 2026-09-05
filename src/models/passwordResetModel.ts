import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    resetTokenHash: {
      type: String,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema,
);
