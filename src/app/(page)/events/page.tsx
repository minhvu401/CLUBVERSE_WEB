/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getAllEvents,
  registerEvent,
  type EventItem,
} from "@/app/services/api/events";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getBanners,
  type BannerItem,
} from "@/app/services/api/banners";

/* ================= UTILS ================= */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* ================= DATE HELPERS ================= */
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

type FilterType = "all" | "upcoming" | "ongoing" | "past";

/* ================= PAGE ================= */
export default function EventsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  /* BANNERS */
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);

  /* AUTH */
  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  /* FETCH EVENTS */
  useEffect(() => {
    if (!token) return;
    (async () => {
      const data = await getAllEvents(token, {});
      setEvents(data);
    })();
  }, [token]);

  /* FETCH BANNERS */
  useEffect(() => {
    (async () => {
      const data = await getBanners();
      setBanners(data);
    })();
  }, []);

  /* AUTO SLIDE BANNER */
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveBanner((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  /* CURRENT MONTH */
  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  /* CALENDAR DAYS */
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const startDay = (start.getDay() || 7) - 1;
    const total = startDay + end.getDate();
    const rows = Math.ceil(total / 7) * 7;

    return Array.from({ length: rows }, (_, i) => {
      const day = i - startDay + 1;
      if (day <= 0 || day > end.getDate()) return null;
      return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    });
  }, [currentMonth]);

  /* FILTER EVENTS BY DATE + STATUS */
  const eventsOfDay = useMemo(() => {
    const now = new Date();

    return events.filter((e) => {
      if (!e.time) return false;
      const time = new Date(e.time);
      if (!sameDay(time, selectedDate)) return false;

      if (filter === "all") return true;
      if (filter === "upcoming") return time > now;
      if (filter === "past") return time < now;
      if (filter === "ongoing") {
        // giả định event kéo dài 2 tiếng
        const end = new Date(time);
        end.setHours(end.getHours() + 2);
        return time <= now && now <= end;
      }
      return true;
    });
  }, [events, selectedDate, filter]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-7xl px-4 pt-20 pb-24">
        {/* TITLE */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">
            📆 Lịch sự kiện câu lạc bộ
          </h1>
          <p className="mt-1 text-white/65">
            Lịch tháng • Banner • Sự kiện nổi bật
          </p>
        </div>

        {/* FILTER (SEGMENTED) */}
        <div className="mb-8 flex justify-end">
          <div className="flex rounded-full bg-white/5 p-1 border border-white/10">
            {[
              { key: "all", label: "Tất cả" },
              { key: "upcoming", label: "Sắp diễn ra" },
              { key: "ongoing", label: "Đang diễn ra" },
              { key: "past", label: "Đã kết thúc" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as FilterType)}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition",
                  filter === f.key
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
          {/* MINI CALENDAR */}
          <div className={cn("rounded-3xl p-4", glass)}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonthOffset((m) => m - 1)}>
                <ChevronLeft />
              </button>
              <span className="text-sm font-semibold">
                {currentMonth.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button onClick={() => setMonthOffset((m) => m + 1)}>
                <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 text-[11px] text-white/40 mb-1 text-center">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) =>
                day ? (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "h-9 rounded-lg text-xs flex flex-col items-center justify-center",
                      sameDay(day, selectedDate) &&
                        "bg-violet-500/30 text-violet-200",
                      sameDay(day, new Date()) &&
                        "ring-1 ring-violet-400/40",
                      "hover:bg-white/10 transition"
                    )}
                  >
                    {day.getDate()}
                    {events.some(
                      (e) => e.time && sameDay(new Date(e.time), day)
                    ) && (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-violet-400" />
                    )}
                  </button>
                ) : (
                  <div key={i} />
                )
              )}
            </div>
          </div>

          {/* BANNER */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-white/10">
            <AnimatePresence mode="wait">
              {banners[activeBanner] && (
                <motion.div
                  key={banners[activeBanner]._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-[260px]"
                >
                  <img
                    src={banners[activeBanner].image}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                  <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-xl">
                    <h3 className="font-display text-2xl font-bold">
                      {banners[activeBanner].title}
                    </h3>
                    {banners[activeBanner].description && (
                      <p className="mt-2 text-white/80">
                        {banners[activeBanner].description}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-8 flex gap-2 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i === activeBanner ? "bg-white" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* EVENT LIST */}
        <div className="space-y-4">
          {eventsOfDay.length === 0 ? (
            <div className={cn("rounded-3xl p-10 text-center", glass)}>
              <Calendar className="mx-auto mb-2 opacity-40" />
              Không có sự kiện phù hợp
            </div>
          ) : (
            eventsOfDay.map((event) => (
              <div
                key={event._id}
                className={cn(
                  "rounded-3xl p-4 flex items-center gap-4",
                  glass
                )}
              >
                <img
                  src={event.images?.[0] || "/placeholder-event.jpg"}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-display font-semibold">
                    {event.title}
                  </h3>
                  <div className="mt-1 text-sm text-white/65 flex gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(event.time!).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.joinedUsers?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => registerEvent(token, event._id)}
                    className="rounded-full bg-violet-500 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Đăng ký
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
