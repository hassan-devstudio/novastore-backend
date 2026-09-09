import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
} from "../controllers/productController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/", validateToken, createProduct);
router.get("/", validateToken, getProducts);
router.get("/:id", validateToken, getProductById);

export default router;
