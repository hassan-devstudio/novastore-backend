import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import validateToken from "../middleware/validateTokenHandler.js";
import AppError from "../utils/AppError.js";
import constants from "../constants/constants.js";

const router = express.Router();

router.post("/", validateToken, createProduct);
router.get("/", validateToken, getProducts);
router.get("/:id", validateToken, getProductById);
router.patch("/", (_req, _res, next) =>
  next(new AppError("Product ID is required", constants.BAD_REQUEST)),
);
router.patch("/:id", validateToken, updateProduct);
router.delete("/", (_req, _res, next) =>
  next(new AppError("Product ID is required", constants.BAD_REQUEST)),
);
router.delete("/:id", validateToken, deleteProduct);

export default router;
