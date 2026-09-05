import express from "express";

import {
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from "../controllers/userController.js";

import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

// ==========================================
// Public Authentication Routes
// ==========================================

// Register a new user account
router.post("/register", registerUser);

// Login user and issue an authentication token
router.post("/login", loginUser);

// Logout user and clear the authentication token
router.post("/logout", logoutUser);

// ==========================================
// Protected User Routes
// ==========================================

// Get the currently authenticated user's details
router.get("/me", validateToken, getCurrentUser);

// Update the authenticated user's profile
router.patch("/profile", validateToken, updateUser);

// Change the authenticated user's password
router.patch("/change-password", validateToken, changePassword);

// Permanently delete the authenticated user's account
router.delete("/account", validateToken, deleteUser);

// ==========================================
// Password Recovery Routes
// ==========================================

// Send a password-reset OTP to the user's email
router.post("/forgot-password", forgotPassword);

// Verify the OTP and receive a temporary reset token
router.post("/verify-reset-otp", verifyResetOtp);

// Set a new password using the temporary reset token
router.post("/reset-password", resetPassword);

export default router;
