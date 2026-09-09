import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import Product from "../models/productModel.js";
import generateSlug from "../utils/generateSlug.js";
import AppError from "../utils/AppError.js";
import constants from "../constants/constants.js";
import { createProductSchema } from "../validators/productValidator.js";

const validationError = (error: yup.ValidationError) =>
  new AppError(
    `Validation Error: ${error.errors.join(", ")}`,
    constants.BAD_REQUEST,
  );

/**
 * Create a new product
 *
 * POST /api/products
 */

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check if the authenticated user's ID is available
    if (!req.user?.userId) {
      return next(
        new AppError(
          "User is not authorized or token is missing",
          constants.UNAUTHORIZED,
        ),
      );
    }

    // Validate request body and remove unknown fields
    const validatedData = await createProductSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Extract validated product data from the request
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
    } = validatedData;

    // Normalize SKU for consistent storage and duplicate checking
    const normalizedSku = sku.trim().toUpperCase();

    // Check if a product with the same SKU already exists
    const existingProduct = await Product.findOne({
      sku: normalizedSku,
    }).lean();

    // Return conflict error if the SKU is already in use
    if (existingProduct) {
      return next(
        new AppError(
          "A product with this SKU already exists",
          constants.CONFLICT,
        ),
      );
    }

    // Generate a URL-friendly slug from the product name
    const baseSlug = generateSlug(name);

    // Start with the base slug and prepare a counter for duplicates
    let slug = baseSlug;
    let counter = 1;

    // Check if the slug already exists and add a number if needed
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Create and save the new product in MongoDB
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      sku: normalizedSku,
      category: category.trim().toLowerCase(),
      images,
      status,
      isFeatured,
      createdBy: req.user.userId,
    });

    // Return successful response with the created product
    res.status(constants.CREATED).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // Handle Yup validation errors separately
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }

    // Pass all other errors to the global error handler
    return next(error);
  }
};
