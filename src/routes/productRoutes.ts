import express from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/productController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.post("/", validateToken, createProduct);
router.get("/products", validateToken, getProducts);

export default router;
