import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/", validateToken, createProduct);
router.get("/", validateToken, getProducts);
router.get("/:id", validateToken, getProductById);
router.patch("/:id", validateToken, updateProduct);
router.delete("/:id", validateToken, deleteProduct);

export default router;
