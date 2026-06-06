import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { getPagination } from "../utils/pagination.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";




export const createNotificationService = async (payload) => {
  if (!payload?.user) {
    throw new ApiError(400, "Notification user is required");
  }

  validateObjectId(payload.user, "User");

  if (!payload?.title) {
    throw new ApiError(400, "Notification title is required");
  }

  if (!payload?.message) {
    throw new ApiError(400, "Notification message is required");
  }

  if (!payload?.type) {
    throw new ApiError(400, "Notification type is required");
  }

  const notification = await Notification.create({
    user: payload.user,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    data: payload.data || {},
  });

  return notification;
};

export const getMyNotificationsService = async (userId, queryParams) => {
  const validUserId = validateObjectId(userId, "User");

  const filter = {
    user: validUserId,
  };

  // Type filter
  if (queryParams.type) {
    filter.type = queryParams.type;
  }

  // Read status filter
  if (queryParams.isRead !== undefined) {
    filter.isRead = parseBoolean(queryParams.isRead);
  }

  // Get pagination parameters
  const { page, limit, skip } = getPagination(queryParams);

  const totalNotifications = await Notification.countDocuments(filter);

  const totalPages = Math.ceil(totalNotifications / limit);

  // Fetch notifications with filters, pagination, and latest first
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    notifications,
    pagination: {
      total: totalNotifications,
      page,
      limit,
      totalPages,
    },
  };
};

export const markNotificationAsReadService = async (userId, notificationId) => {
  const validUserId = validateObjectId(userId, "User");
  const validNotificationId = validateObjectId(
    notificationId,
    "Notification"
  );

  const notification = await Notification.findOne({
    _id: validNotificationId,
    user: validUserId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.isRead) {
    return notification;
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

export const markAllNotificationsAsReadService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const result = await Notification.updateMany(
    {
      user: validUserId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

export const deleteNotificationService = async (userId, notificationId) => {
  const validUserId = validateObjectId(userId, "User");
  const validNotificationId = validateObjectId(
    notificationId,
    "Notification"
  );

  const notification = await Notification.findOneAndDelete({
    _id: validNotificationId,
    user: validUserId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

export const deleteAllNotificationsService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const result = await Notification.deleteMany({
    user: validUserId,
  });

  return {
    deletedCount: result.deletedCount,
  };
};

export const getUnreadNotificationCountService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const unreadCount = await Notification.countDocuments({
    user: validUserId,
    isRead: false,
  });

  return {
    unreadCount,
  };
};