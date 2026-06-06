import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },

  type: {
    type: String,
    enum: ["order", "payment", "review", "coupon","auth", "system"],
    required: true,
    index: true,
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
},
  {
    timestamps: true,
    minimise: false
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;