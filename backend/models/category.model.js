import mongoose from "mongoose";
import { DEFAULT_CATEGORY_IMAGE } from "../utils/constants.js";

const categorySchema = new mongoose.Schema({
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
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;