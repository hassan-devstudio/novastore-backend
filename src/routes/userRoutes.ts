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
// Public Auth Routes
// ==========================================

// Create a new user account
router.post("/register", registerUser);

// Authenticate user and issue token/cookie
router.post("/login", loginUser);

// Clear authentication token/cookie from client
router.post("/logout", logoutUser);

// ==========================================
// Protected User Routes
// ==========================================

// Update specific fields of the user profile
router.patch("/profile", validateToken, updateUser);

// Permanently delete user account
router.delete("/account", validateToken, deleteUser);

// Get the current user
router.get("/me", validateToken, getCurrentUser);

// change password
router.patch("/change-password", validateToken, changePassword);

// forgot-password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
