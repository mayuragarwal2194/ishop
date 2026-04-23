import mongoose from "mongoose";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/constants.js";

// 🔹 Variant Schema
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
    },

    // Color
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
    },

    // 🔥 Flexible attributes (storage, ram, etc.)
    attributes: {
      type: Map,
      of: String,
      default: {},
    },

    // 🔥 Stock per variant
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Pricing
    original_price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Images per variant
    featuredImage: {
      url: {
        type: String,
        default: DEFAULT_PRODUCT_IMAGE,
      },
      public_id: {
        type: String,
        default: null,
      },
    },

    galleryImages: [
      {
        url: {
          type: String,
          default: DEFAULT_PRODUCT_IMAGE,
        },
        public_id: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { _id: true }
);

// 🔹 Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      short: { type: String, default: "" },
      long: { type: String, default: "" },
    },

    // Relations
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    // 🔥 Variants (core)
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one variant is required",
      },
    },

    // Product level images
    featuredImage: {
      url: {
        type: String,
        default: DEFAULT_PRODUCT_IMAGE,
      },
      public_id: {
        type: String,
        default: null,
      },
    },

    galleryImages: [
      {
        url: {
          type: String,
          default: DEFAULT_PRODUCT_IMAGE,
        },
        public_id: {
          type: String,
          default: null,
        },
      },
    ],

    // Stock status (derived)
    stockStatus: {
      type: String,
      enum: ["In Stock", "Out Of Stock"],
      default: "Out Of Stock",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔥 Pre-save middleware to update stock status
productSchema.pre("save", function (next) {
  let totalStock = 0;

  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant) => {
      totalStock += variant.stock || 0;
    });
  }

  this.stockStatus = totalStock > 0 ? "In Stock" : "Out Of Stock";
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;