import express from "express";
import { createProduct } from "../controllers/productController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/", validateToken, createProduct);

export default router;
