import { parseApiError } from "@/utils/apiError";
import { AUTH_BASE_URL } from "./auth";

export type NotificationType =
  | "APPLICATION_STATUS"
  | "EVENT_REMINDER"
  | "EVENT_UPDATE"
  | "CLUB_INVITE"
  | "FORUM_REPLY"
  | "SYSTEM";

export type NotificationItem = {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
};

export type CreateNotificationBody = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
};

export type UpdateNotificationBody = {
  isRead?: boolean;
};

const jsonHeaders = {
  "Content-Type": "application/json",
  accept: "application/json",
};

function getAuthHeaders(token: string) {
  return {
    ...jsonHeaders,
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, `Request failed with status ${res.status}`));
    }

    try {
      return (await res.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Fetch error at ${AUTH_BASE_URL}${path}:`, message);
    throw error;
  }
}

/**
 * Tạo thông báo mới
 */
export const createNotification = (
  token: string,
  body: CreateNotificationBody,
): Promise<NotificationItem> => {
  return request<NotificationItem>("/notifications", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
};

/**
 * Lấy danh sách thông báo của user hiện tại
 */
export const getNotifications = (
  token: string,
  params?: { isRead?: boolean; page?: number; limit?: number },
): Promise<NotificationsResponse> => {
  const query = new URLSearchParams();
  if (params?.isRead !== undefined) query.set("isRead", String(params.isRead));
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return request<NotificationsResponse>(`/notifications${qs}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
};

/**
 * Xóa tất cả thông báo của user hiện tại
 */
export const deleteAllNotifications = (token: string): Promise<void> => {
  return request<void>("/notifications", {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadCount = (token: string): Promise<{ count: number }> => {
  return request<{ count: number }>("/notifications/unread-count", {
    method: "GET",
    headers: getAuthHeaders(token),
  });
};

/**
 * Lấy một thông báo theo ID
 */
export const getNotificationById = (
  token: string,
  notificationId: string,
): Promise<NotificationItem> => {
  return request<NotificationItem>(`/notifications/${notificationId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
};

/**
 * Cập nhật một thông báo
 */
export const updateNotification = (
  token: string,
  notificationId: string,
  body: UpdateNotificationBody,
): Promise<NotificationItem> => {
  return request<NotificationItem>(`/notifications/${notificationId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
};

/**
 * Xóa một thông báo
 */
export const deleteNotification = (
  token: string,
  notificationId: string,
): Promise<void> => {
  return request<void>(`/notifications/${notificationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
};

/**
 * Đánh dấu một thông báo là đã đọc
 */
export const markAsRead = (
  token: string,
  notificationId: string,
): Promise<NotificationItem> => {
  return request<NotificationItem>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
};

/**
 * Đánh dấu một thông báo là chưa đọc
 */
export const markAsUnread = (
  token: string,
  notificationId: string,
): Promise<NotificationItem> => {
  return request<NotificationItem>(`/notifications/${notificationId}/unread`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllAsRead = (token: string): Promise<{ message: string }> => {
  return request<{ message: string }>("/notifications/read-all/mark", {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
};
