import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Authenticate and log in a user
router.post("/login", loginUser);

//    Remove the authentication cookie from the browser.
router.post("/logout", logoutUser);

export default router;
