import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name can not exceed 50 characters"),

  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address"),  

  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password can not exceed 100 characters"),  
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password can not exceed 100 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string({ error: "New password is required" })
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password can not exceed 100 characters"),
});

