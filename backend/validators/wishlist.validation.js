import { z } from "zod";

export const addToWishlistSchema = z.object({
  productId: z.string({ error: "Product ID is required" }),

  variantId: z.string({ error: "Variant ID is required" }),
});

export const removeFromWishlistSchema = z.object({
  productId: z.string({ error: "Product ID is required" }),

  variantId: z.string({ error: "Variant ID is required" }),
});