import { z } from "zod";

const notificationTypes = [
  "auth",
  "order",
  "payment",
  "review",
  "coupon",
  "system",
];

export const notificationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),

  type: z
    .enum(notificationTypes, {
      message:
        "Type must be auth, order, payment, review, coupon, or system",
    })
    .optional(),

  isRead: z
    .enum(["true", "false"], {
      message: "isRead must be either true or false",
    })
    .optional(),
});