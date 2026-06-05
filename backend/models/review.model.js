import mongoose from "mongoose";

const adminReplySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
      default: null,
    },

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },

          public_id: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },

    videos: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },

          public_id: {
            type: String,
            default: null,
          },
        },
      ],
      default: [],
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reportedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    adminReply: {
      type: adminReplySchema,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, variant: 1, status: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;