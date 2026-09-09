import { Request, Response, NextFunction } from "express";
import Product from "../models/productModel.js";
import generateSlug from "../utils/generateSlug.js";
import AppError from "../utils/AppError.js";
import constants from "../constants/constants.js";

/**
 * Create a new product
 *
 * POST /api/products
 */
const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * At this point, req.body has already
     * passed Yup validation.
     */
    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      sku,
      category,
      images,
      status,
      isFeatured,
    } = req.body || {};
    /**
     * --------------------------------------------------
     * 1. Check whether SKU already exists
     * --------------------------------------------------
     *
     * SKU should be unique because it normally
     * identifies a specific product/inventory item.
     */
    const normalizedSku = sku.toUpperCase();
    const existingProduct = await Product.findOne({
      sku: normalizedSku,
    }).lean();

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    if (!existingProduct) {
      return next(
        new AppError(
          "A product with this SKU already exists",
          constants.CONFLICT,
        ),
      );
    }
    /**
     * --------------------------------------------------
     * 2. Generate product slug
     * --------------------------------------------------
     *
     * We don't trust the client to provide a slug.
     * The server generates it from the product name.
     */
    const baseSlug = generateSlug(name);

    let slug = baseSlug;
    let counter = 1;

    /**
     * Ensure the slug is unique.
     *
     * Example:
     *
     * wireless-headphones
     * wireless-headphones-1
     * wireless-headphones-2
     */
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    /**
     * --------------------------------------------------
     * 3. Business validation
     * --------------------------------------------------
     *
     * compareAtPrice is optional.
     *
     * If it exists, it must be higher than
     * the actual selling price.
     */
    if (
      compareAtPrice !== null &&
      compareAtPrice !== undefined &&
      compareAtPrice <= price
    ) {
      return next(
        new AppError(
          "Compare-at price must be greater than the current price",
          constants.BAD_REQUEST,
        ),
      );
    }

    /**
     * --------------------------------------------------
     * 4. Create product
     * --------------------------------------------------
     *
     * req.user.id comes from your authentication
     * middleware.
     */
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      sku: normalizedSku,
      category,
      images,
      status,
      isFeatured,

      // Authenticated user who created this product
      createdBy: req.user.userId,
    });
    /**
     * --------------------------------------------------
     * 5. Return successful response
     * --------------------------------------------------
     */
    return res.status(constants.CREATED).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {}
};
