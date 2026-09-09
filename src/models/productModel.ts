import mongoose from "mongoose";

/**
 * Product Schema
 *
 * Mongoose validation acts as the final protection
 * before data is stored in MongoDB.
 */
const productSchema = new mongoose.Schema(
  {
    // Product name
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    // SEO-friendly URL identifier.
    // Example:
    // "Wireless Headphones" -> "wireless-headphones"
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Detailed product description
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [20, "Product description must be at least 20 characters"],
      maxlength: [5000, "Product description cannot exceed 5000 characters"],
    },

    // Current selling price
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },

    // Original price.
    // Useful when showing discounts.
    // Example:
    // price = 180
    // compareAtPrice = 220
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, "Compare-at price cannot be negative"],
    },

    // Number of products currently available
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Product stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },

    // Unique inventory/product identifier
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, "SKU cannot exceed 50 characters"],
      index: true,
    },

    // Product category
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
      index: true,
    },

    // Product image URLs.
    // Actual images should ideally live in
    // Cloudinary, S3, etc.
    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: "A product cannot have more than 10 images",
      },
    },

    // Product lifecycle state
    status: {
      type: String,
      enum: {
        values: ["draft", "active", "archived"],
        message: "Invalid product status",
      },
      default: "active",
      index: true,
    },

    // Used for homepage/featured product sections
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // User who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product creator is required"],
      index: true,
    },
  },

  {
    // Automatically creates:
    // createdAt
    // updatedAt
    timestamps: true,
  },
);

/**
 * Text index for future product search.
 *
 * This will be useful when implementing:
 *
 * GET /api/products?search=headphones
 */
productSchema.index({
  name: "text",
  description: "text",
});

/**
 * Export Product model
 */
const Product = mongoose.model("Product", productSchema);

export default Product;
