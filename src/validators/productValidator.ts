import * as yup from "yup";

/**
 * Validation schema for creating a product.
 *
 * Yup is responsible for validating data
 * coming from the client/API request.
 */
export const createProductSchema = yup
  .object({
    /**
     * Product name
     */
    name: yup
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(150, "Product name cannot exceed 150 characters")
      .required("Product name is required"),

    /**
     * Product description
     *
     * Business requirement:
     * Minimum 20 characters.
     */
    description: yup
      .string()
      .trim()
      .min(20, "Product description must be at least 20 characters")
      .max(5000, "Product description cannot exceed 5000 characters")
      .required("Product description is required"),

    /**
     * Selling price
     */
    price: yup
      .number()
      .typeError("Price must be a number")
      .min(0, "Price cannot be negative")
      .required("Price is required"),

    /**
     * Optional original price.
     *
     * Used for displaying discounts.
     */
    compareAtPrice: yup
      .number()
      .typeError("Compare-at price must be a number")
      .min(0, "Compare-at price cannot be negative")
      .nullable()
      .optional(),

    /**
     * Available inventory
     */
    stock: yup
      .number()
      .typeError("Stock must be a number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock is required"),

    /**
     * SKU
     *
     * Example:
     * WH-1000XM5-BLK
     */
    sku: yup
      .string()
      .trim()
      .min(2, "SKU must be at least 2 characters")
      .max(50, "SKU cannot exceed 50 characters")
      .required("SKU is required"),

    /**
     * Product category
     */
    category: yup
      .string()
      .trim()
      .min(2, "Category must be at least 2 characters")
      .max(100, "Category cannot exceed 100 characters")
      .required("Category is required"),

    /**
     * Product images.
     *
     * We store URLs here instead of actual image files.
     */
    images: yup
      .array()
      .of(
        yup
          .string()
          .url("Each image must be a valid URL")
          .required("Image URL is required"),
      )
      .max(10, "A product cannot have more than 10 images")
      .default([]),

    /**
     * Product status
     */
    status: yup
      .string()
      .oneOf(
        ["draft", "active", "archived"],
        "Status must be draft, active, or archived",
      )
      .default("active"),

    /**
     * Featured product flag
     */
    isFeatured: yup.boolean().default(false),
  })

  /**
   * Cross-field validation.
   *
   * If compareAtPrice exists, it must be
   * greater than the current selling price.
   */
  .test(
    "compare-at-price",
    "Compare-at price must be greater than the current price",
    (product: { compareAtPrice?: number | null; price?: number }) => {
      if (
        product.compareAtPrice === null ||
        product.compareAtPrice === undefined
      ) {
        return true;
      }

      if (product.price === undefined) {
        return true;
      }

      return product.compareAtPrice > product.price;
    },
  );

/**
 * Validation schema for updating a product (all fields optional).
 */
export const updateProductSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(150, "Product name cannot exceed 150 characters")
      .optional(),

    description: yup
      .string()
      .trim()
      .min(20, "Product description must be at least 20 characters")
      .max(5000, "Product description cannot exceed 5000 characters")
      .optional(),

    price: yup
      .number()
      .typeError("Price must be a number")
      .min(0, "Price cannot be negative")
      .optional(),

    compareAtPrice: yup
      .number()
      .typeError("Compare-at price must be a number")
      .min(0, "Compare-at price cannot be negative")
      .nullable()
      .optional(),

    stock: yup
      .number()
      .typeError("Stock must be a number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .optional(),

    sku: yup
      .string()
      .trim()
      .min(2, "SKU must be at least 2 characters")
      .max(50, "SKU cannot exceed 50 characters")
      .optional(),

    category: yup
      .string()
      .trim()
      .min(2, "Category must be at least 2 characters")
      .max(100, "Category cannot exceed 100 characters")
      .optional(),

    images: yup
      .array()
      .of(
        yup
          .string()
          .url("Each image must be a valid URL")
          .required("Image URL is required"),
      )
      .max(10, "A product cannot have more than 10 images")
      .optional(),

    status: yup
      .string()
      .oneOf(
        ["draft", "active", "archived"],
        "Status must be draft, active, or archived",
      )
      .optional(),

    isFeatured: yup.boolean().optional(),
  })
  .test(
    "compare-at-price",
    "Compare-at price must be greater than the current price",
    (product: { compareAtPrice?: number | null; price?: number }) => {
      if (
        product.compareAtPrice === null ||
        product.compareAtPrice === undefined
      ) {
        return true;
      }
      if (product.price === undefined) return true;
      return product.compareAtPrice > product.price;
    },
  );

/**
 * Validate product ID route parameter
 */
export const productIdParamSchema = yup.object({
  id: yup
    .string()
    .trim()
    .required("Product ID is required")
    .matches(
      /^[0-9a-fA-F]{24}$/,
      "Product ID must be a valid MongoDB ObjectId",
    ),
});
