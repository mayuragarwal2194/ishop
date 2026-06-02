import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name can not exceed 50 characters")
    .optional(),
}).refine((data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  }
);

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required" })
    .min(6, "Current password must be at least 6 characters")
    .max(100, "Current password can not exceed 100 characters"),

  newPassword: z
    .string({ error: "New password is required" })
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password can not exceed 100 characters"),
}).refine((data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }
);

export const deleteAccountSchema = z.object({
  password: z
    .string({ error: "Password is required" })
});

export const updateUserStatusSchema = z.object({
  status: z
    .enum(
      ["active", "suspended"],
      {
        error: "Status must be active or suspended",
      }
    ),
});

export const updateUserRoleSchema = z.object({
  role: z
    .enum(
      ["customer", "admin"],
      {
        error: "Role must be customer or admin",
      }
    ),
});