/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  getAllEvents,
  registerEvent,
  cancelEventRegistration,
  type EventItem,
  type EventFilter,
} from "@/app/services/api/events";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition border",
        active
          ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<EventFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getAllEvents(token, {
          filter,
          limit: LIMIT,
          skip: (page - 1) * LIMIT,
        });
        setEvents(data);
        // Estimate total based on results
        if (data.length < LIMIT) {
          setTotal((page - 1) * LIMIT + data.length);
        } else {
          setTotal(page * LIMIT + 1);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [token, filter, page, LIMIT]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when filter changes
  }, [filter]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const handleRegister = async (eventId: string) => {
    if (!token) return;
    setRegisteringId(eventId);
    try {
      await registerEvent(token, eventId);
      // Refresh events
      const data = await getAllEvents(token, { filter });
      setEvents(data);
    } catch (error: any) {
      alert(error.message || "Không thể đăng ký sự kiện");
    } finally {
      setRegisteringId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (event: EventItem) => {
    if (!event.time) return "upcoming";
    const now = new Date();
    const eventTime = new Date(event.time);
    const isUpcoming = eventTime > now;
    const isPast = eventTime < now;
    return isPast ? "past" : isUpcoming ? "upcoming" : "ongoing";
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Sự kiện</h1>
          <p className="mt-2 text-white/60">
            Khám phá và tham gia các sự kiện thú vị từ các câu lạc bộ
          </p>
        </div>

        {/* Filters & Search */}
        <div className={cn("rounded-3xl p-5 mb-6", glass)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                Tất cả
              </FilterButton>
              <FilterButton
                active={filter === "upcoming"}
                onClick={() => setFilter("upcoming")}
              >
                Sắp diễn ra
              </FilterButton>
              <FilterButton
                active={filter === "ongoing"}
                onClick={() => setFilter("ongoing")}
              >
                Đang diễn ra
              </FilterButton>
              <FilterButton
                active={filter === "past"}
                onClick={() => setFilter("past")}
              >
                Đã kết thúc
              </FilterButton>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40 sm:w-[280px]"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className={cn("rounded-3xl p-12 text-center", glass)}>
            <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Đang tải sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className={cn("rounded-3xl p-12 text-center", glass)}>
            <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Không có sự kiện nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              const isFull =
                event.maxParticipants &&
                (event.participantCount || 0) >= event.maxParticipants;

              return (
                <article
                  key={event._id}
                  className={cn(
                    "relative overflow-hidden rounded-3xl p-6 group",
                    glass
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    {/* Event Image */}
                    {event.images && event.images.length > 0 && (
                      <div className="mb-4 -mx-6 -mt-6 h-48 overflow-hidden">
                        <img
                          src={event.images[0]}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      {status === "upcoming" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
                          <Clock className="h-3 w-3" />
                          Sắp diễn ra
                        </span>
                      )}
                      {status === "ongoing" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-400/30 px-3 py-1 text-xs font-semibold text-green-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Đang diễn ra
                        </span>
                      )}
                      {status === "past" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/20 border border-gray-400/30 px-3 py-1 text-xs font-semibold text-gray-300">
                          <XCircle className="h-3 w-3" />
                          Đã kết thúc
                        </span>
                      )}
                      {isFull && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/30 px-3 py-1 text-xs font-semibold text-red-200">
                          Đã đủ người
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Meta info */}
                    <div className="space-y-2 mb-4">
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
                        {event.participantCount || 0}
                        {event.maxParticipants
                          ? ` / ${event.maxParticipants}`
                          : ""}{" "}
                        người tham gia
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/events/${event._id}`)}
                        className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                      >
                        Xem chi tiết
                      </button>
                      {status === "upcoming" && !isFull && (
                        <button
                          onClick={() => handleRegister(event._id)}
                          disabled={registeringId === event._id}
                          className="flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-900 hover:brightness-110 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                          {registeringId === event._id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Đăng ký"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className={cn("rounded-3xl p-6 mt-6", glass)}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Trang {page} {total > 0 && `• Tổng: ${total} sự kiện`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={filteredEvents.length < LIMIT}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
