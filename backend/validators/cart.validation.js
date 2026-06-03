import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z
    .string({ error: "Product ID is required" }),

  variantId: z
    .string({ error: "Variant ID is required" }),

  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});