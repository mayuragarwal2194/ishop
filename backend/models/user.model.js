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

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
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
    
    isEmailVerified: {
      type: Boolean,
      default: false,
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

