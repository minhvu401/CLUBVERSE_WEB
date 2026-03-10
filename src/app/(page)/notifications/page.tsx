/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProviders";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  type NotificationItem,
} from "@/app/services/api/notifications";
import { Bell, CheckCheck, Trash2, Filter, ArrowLeft } from "lucide-react";

export default function NotificationsPage() {
  const { token } = useAuth() as any;
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(token, page, 20);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [token, page, router, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(token, notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(token, notificationId);
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId,
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setTotal((prev) => prev - 1);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead(token);
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      setTotal(unreadCount);
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting all read:", error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    if (notification.relatedId && notification.relatedType) {
      let path = "";
      switch (notification.relatedType) {
        case "event":
          path = `/events/${notification.relatedId}`;
          break;
        case "club":
          path = `/clubs/${notification.relatedId}`;
          break;
        case "post":
          path = `/forum/post/${notification.relatedId}`;
          break;
        case "application":
          path = `/club/applications/${notification.relatedId}`;
          break;
      }
      if (path) {
        router.push(path);
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_reminder":
      case "event_update":
        return "📅";
      case "application_status":
        return "📝";
      case "club_invite":
        return "🎯";
      case "forum_reply":
        return "💬";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thông báo
              </h1>
              <p className="text-gray-600">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Đọc hết</span>
                </button>
              )}
              {notifications.some((n) => n.isRead) && (
                <button
                  onClick={handleDeleteAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa đã đọc</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <Filter className="h-4 w-4 text-gray-400 ml-2" />
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all" ? "Tất cả" : f === "unread" ? "Chưa đọc" : "Đã đọc"}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-1">
                Không có thông báo nào
              </p>
              <p className="text-sm text-gray-400">
                {filter === "unread"
                  ? "Bạn đã đọc hết thông báo"
                  : filter === "read"
                    ? "Chưa có thông báo đã đọc"
                    : "Hãy quay lại sau để xem thông báo mới"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group relative px-6 py-4 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.isRead ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-base text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-indigo-600 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                        {notification.relatedType && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {notification.relatedType === "event"
                              ? "Sự kiện"
                              : notification.relatedType === "club"
                                ? "Câu lạc bộ"
                                : notification.relatedType === "post"
                                  ? "Bài viết"
                                  : "Đơn đăng ký"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-gray-700">
              Trang {page} / {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
