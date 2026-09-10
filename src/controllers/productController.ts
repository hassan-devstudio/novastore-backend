import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import Product from "../models/productModel.js";
import generateSlug from "../utils/generateSlug.js";
import AppError from "../utils/AppError.js";
import constants from "../constants/constants.js";
import {
  createProductSchema,
  productIdParamSchema,
  updateProductSchema,
  updateStockSchema,
} from "../validators/productValidator.js";

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

/**
 * Get products
 *
 * GET /api/products
 *
 * Query params:
 * search, category, minPrice, maxPrice, sort, page, limit
 */
/**
 * Get products
 *
 * GET /api/products
 *
 * Query params:
 * search, category, minPrice, maxPrice, sort, page, limit
 */

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get query parameters from the URL
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = "1",
      limit = "10",
    } = req.query;

    // Convert page and limit to numbers
    const currentPage = Number(page);
    const pageLimit = Number(limit);

    // Calculate how many products to skip
    const skip = (currentPage - 1) * pageLimit;

    // Create an empty filter object
    const filter: Record<string, any> = {};

    // Search by product name or description
    if (search) {
      filter.$text = { $search: String(search) };
    }

    // Filter by category
    if (category) {
      filter.category = String(category).toLowerCase().trim();
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Define sorting options
    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLowToHigh: { price: 1 },
      priceHighToLow: { price: -1 },
      nameAZ: { name: 1 },
      nameZA: { name: -1 },
    };

    // Get the requested sort or use newest by default
    const sortQuery = sortOptions[String(sort)] || sortOptions.newest;

    // Get products and total count
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const totalProducts = await Product.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / pageLimit);

    // Send response
    res.status(constants.OK).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        totalProducts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    // Pass errors to the global error handler
    next(error);
  }
};

/**
 * Get a single product by ID
 *
 * GET /api/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate the product ID from the URL parameters
    const { id } = await productIdParamSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    // Find the product by ID
    const product = await Product.findOne({ _id: id, status: "active" })
      .select(
        "name slug description price compareAtPrice stock category images status isFeatured createdAt updatedAt",
      )
      .lean();
    // Return not found if the product does not exist
    if (!product) {
      return next(new AppError("Product not found", constants.NOT_FOUND));
    }
    // Return the product
    res.status(constants.OK).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
    // Return not found if the product does not exist
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    return next(error);
  }
};

/**
 * Update a product by ID (partial update)
 *
 * PATCH /api/products/:id
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = await productIdParamSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    const validatedData = await updateProductSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError("Product not found", constants.NOT_FOUND));
    }

    // Handle SKU uniqueness if SKU is being updated
    if (validatedData.sku) {
      const normalizedSku = validatedData.sku.trim().toUpperCase();
      const skuConflict = await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: id },
      }).lean();

      if (skuConflict) {
        return next(
          new AppError("A product with this SKU already exists", constants.CONFLICT),
        );
      }

      validatedData.sku = normalizedSku;
    }

    // Regenerate slug if name is changing
    if (validatedData.name) {
      const baseSlug = generateSlug(validatedData.name);
      let slug = baseSlug;
      let counter = 1;

      while (await Product.exists({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
      }

      (product as any).slug = slug;
    }

    // Normalize category if provided
    if (validatedData.category) {
      validatedData.category = validatedData.category.trim().toLowerCase();
    }

    Object.assign(product, validatedData);
    await product.save();

    res.status(constants.OK).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    return next(error);
  }
};

/**
 * Update stock for a product by ID
 *
 * PATCH /api/products/:id/stock
 */
export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate the product ID from route params
    const { id } = await productIdParamSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Validate the stock value from the request body
    const { stock } = await updateStockSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Update only the stock field and return the updated document
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true },
    );

    if (!product) {
      return next(new AppError("Product not found", constants.NOT_FOUND));
    }

    res.status(constants.OK).json({
      success: true,
      message: "Product stock updated successfully",
      data: { _id: product._id, stock: product.stock },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    return next(error);
  }
};

/**
 * Soft delete a product by ID (sets status to "archived")
 *
 * DELETE /api/products/:id
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = await productIdParamSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    const product = await Product.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true },
    );

    if (!product) {
      return next(new AppError("Product not found", constants.NOT_FOUND));
    }

    res.status(constants.OK).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(validationError(error));
    }
    return next(error);
  }
};
