import mongoose from 'mongoose';
import { DEFAULT_USER_AVATAR } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    avatar: {
      url: {
        type: String,
        default: DEFAULT_USER_AVATAR,
      },

      public_id: {
        type: String,
        default: null,
      },
    },

    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer",
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    tokenVersion: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;

