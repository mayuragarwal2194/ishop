import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z
    .enum(["home", "work", "other"])
    .optional(),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long"),

  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters long"),

  addressLine2: z
    .string()
    .trim()
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters long"),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters long"),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters long"),

  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters long"),

  landmark: z
    .string()
    .trim()
    .optional(),
});

export const updateAddressSchema = z.object({
  label: z
    .enum(["home", "work", "other"])
    .optional(),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional(),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters long")
    .optional(),

  addressLine2: z
    .string()
    .trim()
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters long")
    .optional(),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters long")
    .optional(),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters long")
    .optional(),

  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters long")
    .optional(),

  landmark: z
    .string()
    .trim()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  }
);