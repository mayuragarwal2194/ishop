import mongoose from "mongoose";
import { DEFAULT_BRAND_IMAGE } from "../utils/constants.js";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  logo: {
    url: {
      type: String,
      default: DEFAULT_BRAND_IMAGE
    },
    public_id: {
      type: String,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHome: {
    type: Boolean,
    default: false
  },
  isTop: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Category",
    default: []
  }
}, { timestamps: true });

// Indexes
brandSchema.index({ categories: 1 });
brandSchema.index({ isTop: 1, isActive: 1 });

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;