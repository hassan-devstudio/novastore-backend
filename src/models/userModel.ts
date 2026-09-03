import mongoose from "mongoose";
// Define a clean schema where Yup handles the complex validation rules
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Crucial database constraint to prevent duplicate accounts
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Simply ensures a password string is physically stored
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  },
);

export const User = mongoose.model("User", userSchema, "users");
