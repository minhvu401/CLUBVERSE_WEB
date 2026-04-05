/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getAllEvents,
  softDeleteEvent,
  getDeletedEvents,
  restoreEvent,
  type EventItem,
  type EventFilter,
} from "@/app/services/api/events";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Archive,
  RefreshCw,
  Eye,
  CheckCircle,
  Filter,
  Clock,
  XCircle,
} from "lucide-react";

import { motion, Variants } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type TabType = "active" | "deleted";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition border",
        active
          ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export default function ClubEventsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventFilter | "all">("all");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role],
  );

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isClubRole) {
      router.replace("/");
      return;
    }
  }, [loading, token, isClubRole, router]);

  useEffect(() => {
    if (!token || !isClubRole) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "active") {
          const data = await getAllEvents(token, {
            limit: LIMIT,
            skip: (page - 1) * LIMIT,
          });
          setEvents(data);
          // Note: API should return total count, for now we estimate
          if (data.length < LIMIT) {
            setTotal((page - 1) * LIMIT + data.length);
          } else {
            setTotal(page * LIMIT + 1); // At least one more page
          }
        } else {
          const data = await getDeletedEvents(token);
          setDeletedEvents(data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [token, isClubRole, activeTab, page, LIMIT]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when switching tabs
  }, [activeTab]);

  const displayEvents = activeTab === "active" ? events : deletedEvents;

  const totalPages = Math.ceil(total / LIMIT) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const getEventStatus = (
    event: EventItem,
  ): "upcoming" | "ongoing" | "past" => {
    if (!event.time) return "upcoming";
    const now = new Date();
    const eventTime = new Date(event.time);
    if (eventTime < now) return "past";
    if (eventTime > now) return "upcoming";
    return "ongoing";
  };

  const filteredEvents = useMemo(() => {
    let result = displayEvents;

    // Filter by status
    if (statusFilter !== "all" && activeTab === "active") {
      result = result.filter((e) => getEventStatus(e) === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query),
      );
    }

    return result;
  }, [displayEvents, searchQuery, statusFilter, activeTab]);

  const handleDelete = async (eventId: string) => {
    if (!token) return;
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa sự kiện này không?",
    );
    if (!confirm) return;

    setActioningId(eventId);
    try {
      await softDeleteEvent(token, eventId);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (error: any) {
      alert(error.message || "Không thể xóa sự kiện");
    } finally {
      setActioningId(null);
    }
  };

  const handleRestore = async (eventId: string) => {
    if (!token) return;
    setActioningId(eventId);
    try {
      await restoreEvent(token, eventId);
      setDeletedEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (error: any) {
      alert(error.message || "Không thể khôi phục sự kiện");
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

      <Header />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-4 py-10 pb-20"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Quản lý sự kiện</h1>
            <p className="mt-2 text-white/60">
              Tạo và quản lý các sự kiện của câu lạc bộ
            </p>
          </div>

          <button
            onClick={() => router.push("/club/events/create")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            Tạo sự kiện mới
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            icon={<Calendar className="h-4 w-4" />}
          >
            Đang hoạt động ({events.length})
          </TabButton>
          <TabButton
            active={activeTab === "deleted"}
            onClick={() => setActiveTab("deleted")}
            icon={<Archive className="h-4 w-4" />}
          >
            Đã xóa ({deletedEvents.length})
          </TabButton>
        </motion.div>

        {/* Filter by status (only for active tab) */}
        {activeTab === "active" && (
          <motion.div variants={itemVariants} className={cn("rounded-3xl p-4 mb-6", glass)}>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">
                Lọc theo trạng thái:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition border",
                  statusFilter === "all"
                    ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                )}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition border",
                  statusFilter === "upcoming"
                    ? "border-blue-400/50 bg-blue-400/20 text-blue-200"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                )}
              >
                <Clock className="h-4 w-4" />
                Sắp diễn ra
              </button>
              <button
                onClick={() => setStatusFilter("ongoing")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition border",
                  statusFilter === "ongoing"
                    ? "border-green-400/50 bg-green-400/20 text-green-200"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Đang diễn ra
              </button>
              <button
                onClick={() => setStatusFilter("past")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition border",
                  statusFilter === "past"
                    ? "border-gray-400/50 bg-gray-400/20 text-gray-200"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                )}
              >
                <XCircle className="h-4 w-4" />
                Đã kết thúc
              </button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <motion.div variants={itemVariants} className={cn("rounded-3xl p-4 mb-6", glass)}>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sự kiện..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
        </motion.div>

        {/* Events List */}
        <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className={cn("rounded-3xl p-12 text-center", glass)}>
            <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Đang tải...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className={cn("rounded-3xl p-12 text-center", glass)}>
            <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">
              {activeTab === "active"
                ? "Chưa có sự kiện nào"
                : "Không có sự kiện đã xóa"}
            </p>
            {activeTab === "active" && (
              <button
                onClick={() => router.push("/club/events/create")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:brightness-110 transition"
              >
                <Plus className="h-4 w-4" />
                Tạo sự kiện đầu tiên
              </button>
            )}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.article
                variants={itemVariants}
                key={event._id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-3xl p-5 border border-white/5 transition-all duration-300 hover:shadow-cyan-500/20 group hover:-translate-y-1 hover:border-white/20",
                  glass,
                )}
              >
                {/* Glowing Outline */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Event Image Banner */}
                {event.images && event.images.length > 0 ? (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 flex-shrink-0 relative">
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"/>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 bg-white/5 flex items-center justify-center flex-shrink-0 relative group-hover:bg-white/10 transition-colors">
                     <Calendar className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-700"/>
                  </div>
                )}

                {/* Event Info */}
                <div className="flex-1 flex flex-col relative z-10 min-w-0">
                  <h3 className="text-[1.3rem] leading-tight font-bold text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                        {formatDate(event.time)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin className="h-4 w-4 text-violet-400" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Users className="h-4 w-4 text-emerald-400" />
                        {event.joinedUsers?.length || 0}
                        {event.maxParticipants
                          ? ` / ${event.maxParticipants}`
                          : ""}{" "}
                        người đăng ký
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                        Check-in: 0 người
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-white/5">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/club/events/${event._id}`)
                            }
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition title-tooltip"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/club/events/${event._id}/edit`)
                            }
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/club/events/${event._id}/participants`,
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 transition"
                          >
                            <Users className="h-4 w-4" />
                            <span className="truncate">Người tham gia</span>
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            disabled={actioningId === event._id}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                            title="Xóa"
                          >
                            {actioningId === event._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(event._id)}
                            disabled={actioningId === event._id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-md hover:brightness-110 transition disabled:opacity-50"
                          >
                            {actioningId === event._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Khôi phục
                          </button>
                        </>
                      )}
                    </div>
                  </div>
              </motion.article>
            ))}
          </motion.div>
        )}
        </motion.div>

        {/* Pagination */}
        {activeTab === "active" && !isLoading && filteredEvents.length > 0 && (
          <div className={cn("rounded-3xl p-6 mt-6", glass)}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Trang {page} / {totalPages} • Tổng: {total} sự kiện
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.main>

      <Footer />
    </div>
  );
}
