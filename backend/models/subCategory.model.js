import mongoose from "mongoose";
import { DEFAULT_CATEGORY_IMAGE } from "../utils/constants.js";

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // 🔗 Reference to parent Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true,
  },

  image: {
    url: {
      type: String,
      default: DEFAULT_CATEGORY_IMAGE
    },
    public_id: {
      type: String,
      default: null
    }
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  isHome: {
    type: Boolean,
    default: false,
  },

  isTop: {
    type: Boolean,
    default: false,
  },

  isPopular: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// 🔥 Prevent duplicate subcategory under same category
subCategorySchema.index({ category: 1, isActive: 1 });
subCategorySchema.index({ category: 1, name: 1 }, { unique: true });
subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
export default SubCategory;