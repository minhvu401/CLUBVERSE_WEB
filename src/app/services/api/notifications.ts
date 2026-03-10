import { AUTH_BASE_URL } from "./auth";

export type NotificationType =
  | "event_reminder"
  | "event_update"
  | "application_status"
  | "club_invite"
  | "forum_reply"
  | "system";

export type NotificationItem = {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: "event" | "application" | "club" | "post";
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
};

export type MarkAsReadResponse = {
  message: string;
};

export type DeleteNotificationResponse = {
  message: string;
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
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

/**
 * Lấy danh sách thông báo của user hiện tại
 * @param token - Access token
 * @param page - Trang hiện tại (mặc định: 1)
 * @param limit - Số lượng thông báo mỗi trang (mặc định: 20)
 */
export const getNotifications = (
  token: string,
  page = 1,
  limit = 20,
): Promise<NotificationsResponse> => {
  return request<NotificationsResponse>(
    `/notifications?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    },
  );
};

/**
 * Lấy số lượng thông báo chưa đọc
 * @param token - Access token
 */
export const getUnreadCount = (token: string): Promise<{ count: number }> => {
  return request<{ count: number }>("/notifications/unread-count", {
    method: "GET",
    headers: getAuthHeaders(token),
  });
};

/**
 * Đánh dấu một thông báo là đã đọc
 * @param token - Access token
 * @param notificationId - ID của thông báo
 */
export const markAsRead = (
  token: string,
  notificationId: string,
): Promise<MarkAsReadResponse> => {
  return request<MarkAsReadResponse>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @param token - Access token
 */
export const markAllAsRead = (token: string): Promise<MarkAsReadResponse> => {
  return request<MarkAsReadResponse>("/notifications/read-all", {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
};

/**
 * Xóa một thông báo
 * @param token - Access token
 * @param notificationId - ID của thông báo
 */
export const deleteNotification = (
  token: string,
  notificationId: string,
): Promise<DeleteNotificationResponse> => {
  return request<DeleteNotificationResponse>(
    `/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
    },
  );
};

/**
 * Xóa tất cả thông báo đã đọc
 * @param token - Access token
 */
export const deleteAllRead = (
  token: string,
): Promise<DeleteNotificationResponse> => {
  return request<DeleteNotificationResponse>("/notifications/read", {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
};
