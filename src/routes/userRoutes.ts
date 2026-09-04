import express from "express";
import { loginUser, logoutUser, registerUser, updateUser } from "../controllers/userController.js";
import validateToken from "../middleware/validateTokenHandler.js";
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Authenticate and log in a user
router.post("/login", loginUser);

//    Remove the authentication cookie from the browser.
router.post("/logout", logoutUser);

router.patch("/profile", validateToken, updateUser);

export default router;
