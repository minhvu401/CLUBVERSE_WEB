/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders";
import { toast } from "sonner";
import {
  getMyEvents,
  type EventItem,
  type MyEventFilter,
} from "@/app/services/api/events";
import {
  CalendarDays,
  MapPin,
  FileText,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

function fmtDateShort(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getEventStatus(time?: string): "upcoming" | "past" {
  if (!time) return "upcoming";
  return new Date(time) > new Date() ? "upcoming" : "past";
}

/* ================= modal ================= */

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-slideUp">
        <div className={cn("rounded-3xl p-6 md:p-8", glass)}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/5 hover:bg-white/15 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= event card ================= */

function EventCard({
  event,
  onViewDetails,
}: {
  event: EventItem;
  onViewDetails: () => void;
}) {
  const status = getEventStatus(event.time);
  const isUpcoming = status === "upcoming";

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10",
        "border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/20 hover:from-white/[0.12] to-white/[0.05]"
      )}
    >
      <div className="p-5 md:p-6">
        {/* Header with status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {event.title}
            </h3>
          </div>
          <div className="shrink-0">
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Clock size={12} />
                Sắp diễn ra
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-500/30">
                <CheckCircle2 size={12} />
                Đã kết thúc
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2.5 text-sm text-white/70">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={16} className="text-cyan-400/70 shrink-0" />
            <span>{fmtDate(event.time)}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-rose-400/70 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Description preview */}
        {event.description && (
          <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-white/60 line-clamp-2 border border-white/5">
            {event.description}
          </div>
        )}

        {/* Action button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <FileText size={14} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */

export default function MyEventsPage() {
  const { token, loading } = useAuth();

  const [filter, setFilter] = useState<MyEventFilter>("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fetching, setFetching] = useState(false);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<EventItem | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setFetching(true);
        const data = await getMyEvents(token, {
          filter,
        });

        setEvents(Array.isArray(data) ? data : []);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được danh sách sự kiện");
        setEvents([]);
      } finally {
        setFetching(false);
      }
    })();
  }, [token, filter]);

  if (loading) return null;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute top-0 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        {/* SIDEBAR */}
        <AppSidebar activeKey="events" />

        <main className="flex-1 space-y-6">
          {/* Header */}
          <div className={cn("rounded-3xl p-6 md:p-8", glass)}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-cyan-400" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Sự kiện của tôi
              </h1>
            </div>
            <p className="mt-2 text-sm text-white/60">
              Danh sách sự kiện bạn đã đăng ký hoặc tham gia
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { key: "all", label: "Tất cả" },
                { key: "upcoming", label: "Sắp diễn ra" },
                { key: "past", label: "Đã diễn ra" },
              ] as { key: MyEventFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                  filter === f.key
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30"
                    : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Events grid */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="p-6 md:p-8">
              {fetching && (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-white/70">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    Đang tải...
                  </div>
                </div>
              )}

              {!fetching && events.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-white/40 text-sm mb-2">
                    <CalendarDays
                      size={32}
                      className="mx-auto mb-3 opacity-40"
                    />
                  </div>
                  <p className="text-white/70 font-medium">
                    Không có sự kiện nào
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Hãy tham gia hoặc đăng ký một sự kiện để xem tại đây
                  </p>
                </div>
              )}

              {events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((e) => (
                    <EventCard
                      key={e._id}
                      event={e}
                      onViewDetails={() => {
                        setPicked(e);
                        setOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        title="Chi tiết sự kiện"
        onClose={() => setOpen(false)}
      >
        {!picked ? null : (
          <div className="space-y-4 text-white">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {picked.title}
              </h3>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs text-white/60">Thời gian</p>
                  <p className="text-sm font-semibold">{fmtDate(picked.time)}</p>
                </div>
              </div>

              {picked.location && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs text-white/60">Địa điểm</p>
                    <p className="text-sm font-semibold">{picked.location}</p>
                  </div>
                </div>
              )}
            </div>

            {picked.description && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/60 mb-2">Mô tả</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 leading-relaxed">
                  {picked.description}
                </div>
              </div>
            )}

            {picked.participantCount !== undefined && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/60 mb-1">Số người tham gia</p>
                <p className="text-lg font-bold text-cyan-400">
                  {picked.participantCount}/{picked.maxParticipants || "∞"}{" "}
                  người
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
