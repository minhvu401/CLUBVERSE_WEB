/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders/page";
import { toast } from "sonner";
import {
  getMyEvents,
  type MyEvent,
  type EventFilter,
} from "@/app/services/api/events";
import { CalendarDays, MapPin, FileText, X } from "lucide-react";

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
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */

export default function MyEventsPage() {
  const { token, loading } = useAuth();

  const [filter, setFilter] = useState<EventFilter>("all");
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [fetching, setFetching] = useState(false);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<MyEvent | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setFetching(true);
        const data = await getMyEvents({
          accessToken: token,
          filter,
        });

        // 🔒 đảm bảo luôn là array
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
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        {/* SIDEBAR */}
        <AppSidebar activeKey="events" />

        <main className="flex-1 space-y-4">
          {/* title */}
          <div className={cn("rounded-3xl p-5", glass)}>
            <h1 className="text-lg font-semibold">Sự kiện của tôi</h1>
            <p className="mt-1 text-xs text-white/55">
              Danh sách sự kiện bạn đã đăng ký hoặc tham gia
            </p>
          </div>

          {/* filter buttons */}
          <div className="flex gap-2">
            {(
              [
                { key: "all", label: "Tất cả" },
                { key: "upcoming", label: "Sắp diễn ra" },
                { key: "past", label: "Đã diễn ra" },
              ] as { key:EventFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition",
                  filter === f.key
                    ? "bg-sky-500 text-slate-950"
                    : "border border-white/10 bg-white/10 text-white/70 hover:bg-white/20"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* list */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="space-y-3 p-5">
              {fetching && (
                <div className="text-sm text-white/60">Đang tải...</div>
              )}

              {!fetching && events.length === 0 && (
                <div className="text-sm text-white/60">
                  Không có sự kiện nào
                </div>
              )}

              {events.map((e) => (
                <div
                  key={e._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="font-semibold">{e.title}</div>

                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {fmtDate(e.startTime)}
                    </span>

                    {e.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {e.location}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setPicked(e);
                        setOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs"
                    >
                      <FileText size={14} />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* modal */}
      <Modal
        open={open}
        title="Chi tiết sự kiện"
        onClose={() => setOpen(false)}
      >
        {!picked ? null : (
          <div className="space-y-2 text-sm text-white/80">
            <div className="font-semibold text-white">{picked.title}</div>
            <div>⏰ {fmtDate(picked.startTime)}</div>
            {picked.location && <div>📍 {picked.location}</div>}
            {picked.description && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                {picked.description}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
