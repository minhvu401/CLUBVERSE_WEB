"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type NotificationItem,
} from "@/app/services/api/notifications";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  token: string;
}

export default function NotificationDropdown({
  token,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Lấy số lượng thông báo chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    if (!token || !token.trim()) {
      console.warn("Token is not available");
      return;
    }
    try {
      const data = await getUnreadCount(token);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.warn("Lỗi tải đếm số thông báo:", error);
    }
  }, [token]);

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(async () => {
    if (!token || !token.trim()) {
      console.warn("Token is not available");
      return;
    }
    setLoading(true);
    try {
      const data = await getNotifications(token, { page: 1, limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.warn("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load unread count khi component mount
  useEffect(() => {
    if (token) {
      fetchUnreadCount();

      // Tự động refresh mỗi 30 giây
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  // Load notifications khi mở dropdown
  useEffect(() => {
    if (isOpen && token) {
      fetchNotifications();
    }
  }, [isOpen, token, fetchNotifications]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(token, notificationId);
      // Cập nhật state
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
      // Cập nhật state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(token, notificationId);
      // Cập nhật state
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId,
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    let path = "";
    const meta = notification.metadata || {};
    switch (notification.type) {
      case "EVENT_REMINDER":
      case "EVENT_UPDATE":
        if (meta.eventId) path = `/events/${meta.eventId}`;
        break;
      case "CLUB_INVITE":
        if (meta.clubId) path = `/clubs/${meta.clubId}`;
        break;
      case "FORUM_REPLY":
        if (meta.postId) path = `/forum/post/${meta.postId}`;
        break;
      case "APPLICATION_STATUS":
        if (meta.applicationId)
          path = `/club/applications/${meta.applicationId}`;
        break;
    }
    if (path) {
      router.push(path);
      setIsOpen(false);
    }
  };

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

    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "EVENT_REMINDER":
      case "EVENT_UPDATE":
        return "📅";
      case "APPLICATION_STATUS":
        return "📝";
      case "CLUB_INVITE":
        return "🎯";
      case "FORUM_REPLY":
        return "💬";
      case "SYSTEM":
        return "🔔";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-2 hover:bg-white/10 transition"
        title="Thông báo"
      >
        <Bell className="h-5 w-5 text-white/85" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] rounded-lg bg-white shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-bold text-gray-800">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Đọc hết</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`group relative px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
                      !notification.isRead ? "bg-indigo-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="p-1 hover:bg-indigo-100 rounded transition"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-4 w-4 text-indigo-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push("/notifications");
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 py-1"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
