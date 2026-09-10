import express from "express";

import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  updateStock,
  deleteProduct,
} from "../controllers/productController.js";

import validateToken from "../middleware/validateTokenHandler.js";

import AppError from "../utils/AppError.js";
import constants from "../constants/constants.js";

const router = express.Router();

// Create a new product
router.post("/", validateToken, createProduct);

// Get all products
router.get("/", validateToken, getProducts);

// Get a single product by ID
router.get("/:id", validateToken, getProductById);

// Handle update request when product ID is missing
router.patch("/", (_req, _res, next) =>
  next(new AppError("Product ID is required", constants.BAD_REQUEST)),
);

// Update a product by ID
router.patch("/:id", validateToken, updateProduct);

// Update stock for a product by ID
router.patch("/:id/stock", validateToken, updateStock);

// Handle delete request when product ID is missing
router.delete("/", (_req, _res, next) =>
  next(new AppError("Product ID is required", constants.BAD_REQUEST)),
);

// Delete/archive a product by ID
router.delete("/:id", validateToken, deleteProduct);

export default router;
