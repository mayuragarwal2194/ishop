import express from "express";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { notificationQuerySchema } from "../validators/notification.validation.js";
import { validateQuery } from "../middlewares/validateQuery.middleware.js"


const router = express.Router();

router.use(protect);

router.get(
  "/",
  validateQuery(notificationQuerySchema),
  getMyNotifications
);

router.get(
  "/unread-count",
  getUnreadNotificationCount
);

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

router.delete(
  "/",
  deleteAllNotifications
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);


router.delete(
  "/:id",
  deleteNotification
);


export default router;