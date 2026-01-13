/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import {
  getEventById,
  registerEvent,
  cancelEventRegistration,
} from "@/app/services/api/events";

import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Flame,
  Pin,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type UIEventDetail = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  participants: number;
  cover: string;
  pinned?: boolean;
  hot?: boolean;
};

function toUIEvent(item: any): UIEventDetail {
  return {
    id: String(item?._id ?? item?.id),
    title: item?.title ?? "Không có tiêu đề",
    description: item?.description ?? item?.content ?? "",
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

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token, loading } = useAuth() as any;

  const [event, setEvent] = useState<UIEventDetail | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openCancel, setOpenCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
  }, [loading, token, router]);

  const fetchEvent = async () => {
    if (!token || !id) return;
    try {
      setLoadingEvent(true);
      setError(null);
      const data = await getEventById(token, id);
      setEvent(toUIEvent(data));
    } catch (e: any) {
      setError(e?.message || "Không tải được chi tiết sự kiện");
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  /* ===== ĐĂNG KÝ ===== */
  const handleRegister = async () => {
    if (!token || !event) return;

    try {
      setSubmitting(true);
      await registerEvent(token, event.id);

      setJoined(true);
      setEvent((prev) =>
        prev ? { ...prev, participants: prev.participants + 1 } : prev
      );
    } catch (e: any) {
      alert(e?.message || "Bạn đã đăng ký hoặc sự kiện đã đủ người");
    } finally {
      setSubmitting(false);
    }
  };

  /* ===== HUỶ ĐĂNG KÝ ===== */
  const validateCancelReason = (v: string) => {
    const t = v.trim();
    if (!t) return "Lý do không được để trống";
    if (t.length < 10) return "Lý do phải có ít nhất 10 ký tự";
    if (t.length > 500) return "Lý do không được vượt quá 500 ký tự";
    return null;
  };

  const handleCancelSubmit = async () => {
    if (!token || !event) return;

    const err = validateCancelReason(cancelReason);
    if (err) {
      setCancelError(err);
      return;
    }

    try {
      setSubmitting(true);
      await cancelEventRegistration(token, event.id, cancelReason.trim());

      setJoined(false);
      setOpenCancel(false);
      setCancelReason("");
      setCancelError(null);

      setEvent((prev) =>
        prev
          ? { ...prev, participants: Math.max(0, prev.participants - 1) }
          : prev
      );
    } catch (e: any) {
      setCancelError(e?.message || "Huỷ đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-14 pt-10">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {event && (
          <article className={cn("overflow-hidden rounded-3xl", glass)}>
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={event.cover}
                alt={event.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold">{event.title}</h1>

              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {event.participants} người tham gia
                </div>
              </div>

              {/* ===== NÚT ĐĂNG KÝ / ĐÃ THAM GIA / HUỶ ===== */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!joined ? (
                  <button
                    disabled={submitting}
                    onClick={handleRegister}
                    className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-900 disabled:opacity-60"
                  >
                    {submitting ? "Đang đăng ký..." : "Đăng ký tham gia"}
                  </button>
                ) : (
                  <>
                    <button
                      disabled
                      className="cursor-not-allowed rounded-full bg-gray-500/40 px-6 py-3 text-sm font-bold text-white/80"
                    >
                      ✔ Đã tham gia
                    </button>

                    <button
                      onClick={() => setOpenCancel(true)}
                      className="rounded-full border border-red-400/40 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      Huỷ đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        )}

        {/* ===== MODAL HUỶ ===== */}
        {openCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-950/90 p-6">
              <h3 className="text-lg font-semibold">Huỷ đăng ký sự kiện</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={5}
                className="mt-4 w-full rounded-xl bg-white/[0.06] p-3"
              />
              {cancelError && (
                <div className="mt-2 text-sm text-red-300">{cancelError}</div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setOpenCancel(false)}>Đóng</button>
                <button
                  disabled={submitting}
                  onClick={handleCancelSubmit}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm disabled:opacity-60"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận huỷ"}
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
