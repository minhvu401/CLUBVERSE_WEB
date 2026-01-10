/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

import { getEvents, EventFilter } from "@/app/services/api/events";

import {
  Search,
  CalendarDays,
  MapPin,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pin,
  Sparkles,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* =========================
   UI TYPE
========================= */
type UIEvent = {
  id: string;
  title: string;
  description: string;
  type: "workshop" | "activity" | "competition";
  date: string;
  location: string;
  organizer: string;
  participants: number;
  cover: string;
  pinned?: boolean;
  hot?: boolean;
};

/* =========================
   MAP API → UI
========================= */
function toUIEvent(item: any): UIEvent {
  return {
    id: String(item?._id ?? item?.id),
    title: item?.title ?? "Không có tiêu đề",
    description: item?.description ?? item?.content ?? "",
    type: "activity", // backend chưa có type → default
    date: item?.startDate
      ? new Date(item.startDate).toLocaleDateString("vi-VN")
      : "Chưa cập nhật",
    location: item?.location ?? "Chưa cập nhật",
    organizer: item?.club?.name ?? "Câu lạc bộ",
    participants: Number(item?.joinedCount ?? item?.participants ?? 0),
    cover:
      item?.cover ??
      item?.image ??
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    pinned: Boolean(item?.pinned),
    hot: Boolean(item?.hot),
  };
}

export default function EventPage() {
  const router = useRouter();
  const { token, loading } = useAuth() as any;

  const [events, setEvents] = useState<UIEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<EventFilter>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const limit = 6;

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
  }, [loading, token, router]);

  /* =========================
     FETCH EVENTS
  ========================= */
  const fetchEvents = async () => {
    if (!token) return;
    try {
      setLoadingEvents(true);
      setError(null);

      const data = await getEvents(token, {
        filter,
        limit,
        skip: (page - 1) * limit,
      });

      setEvents((data || []).map(toUIEvent));
    } catch (e: any) {
      setError(e?.message || "Không tải được sự kiện");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter, page]);

  /* =========================
     SEARCH FILTER (CLIENT)
  ========================= */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return events;

    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.organizer.toLowerCase().includes(query)
    );
  }, [events, q]);

  const filters: { key: EventFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "upcoming", label: "Sắp diễn ra" },
    { key: "ongoing", label: "Đang diễn ra" },
    { key: "past", label: "Đã kết thúc" },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-10">
        {/* Title */}
        <div className="mb-6">
          <div className="text-sm text-white/60">Events</div>
          <h1 className="text-2xl font-bold text-white">
            Sự kiện & Hoạt động nổi bật
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Workshop, hoạt động và cuộc thi dành cho sinh viên
          </p>
        </div>

        {/* Filter */}
        <div className={cn("rounded-3xl p-4 md:p-5", glass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setPage(1);
                    setFilter(f.key);
                  }}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.78rem] font-semibold border border-white/10",
                    filter === f.key
                      ? "bg-white/[0.10] text-white"
                      : "bg-white/[0.05] text-white/70 hover:bg-white/[0.08]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="bg-transparent text-sm text-white outline-none placeholder:text-white/45 w-[260px]"
              />
              <Filter className="h-4 w-4 text-white/60" />
            </div>
          </div>
        </div>

        {/* EVENT GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingEvents && (
            <div className={cn("rounded-3xl p-6", glass)}>
              Đang tải sự kiện...
            </div>
          )}

          {!loadingEvents &&
            filtered.map((e) => (
              <article
                key={e.id}
                className={cn(
                  "group overflow-hidden rounded-3xl transition hover:-translate-y-1",
                  glass
                )}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={e.cover}
                    alt={e.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2">
                    {e.pinned && (
                      <span className="rounded-full bg-violet-500/80 px-3 py-1 text-[0.7rem] font-bold">
                        <Pin className="inline h-3 w-3 mr-1" />
                        Featured
                      </span>
                    )}
                    {e.hot && (
                      <span className="rounded-full bg-amber-500/80 px-3 py-1 text-[0.7rem] font-bold">
                        <Flame className="inline h-3 w-3 mr-1" />
                        Hot
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-[0.7rem] text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sự kiện
                  </div>

                  <h3 className="mt-2 text-base font-semibold line-clamp-2">
                    {e.title}
                  </h3>

                  <p className="mt-2 text-sm text-white/65 line-clamp-2">
                    {e.description}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-white/55">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {e.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {e.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {e.participants} người tham gia
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/events/${e.id}`)}
                    className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </article>
            ))}
        </section>

        {/* Pagination */}
        <div className={cn("mt-8 rounded-3xl p-4", glass)}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/55">Trang {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.06]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.06]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
