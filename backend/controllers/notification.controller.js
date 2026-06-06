import {
  getMyNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  deleteAllNotificationsService,
  getUnreadNotificationCountService,
} from "../services/notification.service.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const getMyNotifications = asyncHandler(
  async (req, res) => {
    const result = await getMyNotificationsService(
      req.user._id,
      req.validatedQuery
    );

    return ApiResponse(
      res,
      200,
      "Notifications fetched successfully",
      result
    );
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req, res) => {
    const result = await markNotificationAsReadService(
      req.user._id,
      req.params.id
    );

    return ApiResponse(
      res,
      200,
      "Notification marked as read successfully",
      result
    );
  }
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req, res) => {
    const result = await markAllNotificationsAsReadService(
      req.user._id
    );

    return ApiResponse(
      res,
      200,
      "All notifications marked as read successfully",
      result
    );
  }
);

export const deleteNotification = asyncHandler(
  async (req, res) => {
    const result = await deleteNotificationService(
      req.user._id,
      req.params.id
    );

    return ApiResponse(
      res,
      200,
      "Notification deleted successfully",
      result
    );
  }
);

export const deleteAllNotifications = asyncHandler(
  async (req, res) => {
    const result = await deleteAllNotificationsService(
      req.user._id
    );

    return ApiResponse(
      res,
      200,
      "All notifications deleted successfully",
      result
    );
  }
);

export const getUnreadNotificationCount = asyncHandler(
  async (req, res) => {
    const result = await getUnreadNotificationCountService(
      req.user._id
    );

    return ApiResponse(
      res,
      200,
      "Unread notification count fetched successfully",
      result
    );
  }
);