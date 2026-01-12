/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  getEventById,
  registerEvent,
  cancelEventRegistration,
  type EventItem,
} from "@/app/services/api/events";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { user, token, loading } = useAuth() as any;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !eventId) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const data = await getEventById(token, eventId);
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin sự kiện");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [token, eventId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = () => {
    if (!event?.time) return "upcoming";
    const now = new Date();
    const eventTime = new Date(event.time);
    if (eventTime < now) return "past";
    if (eventTime > now) return "upcoming";
    return "ongoing";
  };

  const handleRegister = async () => {
    if (!token || !event) return;
    setIsActioning(true);
    try {
      await registerEvent(token, event._id);
      // Refresh event data
      const data = await getEventById(token, event._id);
      setEvent(data);
    } catch (err: any) {
      alert(err.message || "Không thể đăng ký sự kiện");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancel = async () => {
    if (!token || !event) return;
    const reason = prompt("Lý do hủy đăng ký (tùy chọn):");
    if (reason === null) return;

    setIsActioning(true);
    try {
      await cancelEventRegistration(token, event._id, reason);
      // Refresh event data
      const data = await getEventById(token, event._id);
      setEvent(data);
    } catch (err: any) {
      alert(err.message || "Không thể hủy đăng ký");
    } finally {
      setIsActioning(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
            <div className="text-white/60">Đang tải...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <div className="text-red-200 mb-4">
              {error || "Không tìm thấy sự kiện"}
            </div>
            <button
              onClick={() => router.push("/events")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = getEventStatus();
  const isFull =
    event.maxParticipants &&
    (event.participantCount || 0) >= event.maxParticipants;
  const isRegistered = event.participants?.some((p) => p.userId === user?._id);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10 pb-20">
        {/* Back button */}
        <button
          onClick={() => router.push("/events")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {/* Event content */}
        <article className={cn("rounded-3xl overflow-hidden", glass)}>
          {/* Hero Image */}
          {event.images && event.images.length > 0 && (
            <div className="h-80 overflow-hidden">
              <img
                src={event.images[0]}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {status === "upcoming" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-sm font-semibold text-blue-200">
                  <Clock className="h-4 w-4" />
                  Sắp diễn ra
                </span>
              )}
              {status === "ongoing" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-400/30 px-3 py-1 text-sm font-semibold text-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Đang diễn ra
                </span>
              )}
              {status === "past" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/20 border border-gray-400/30 px-3 py-1 text-sm font-semibold text-gray-300">
                  <XCircle className="h-4 w-4" />
                  Đã kết thúc
                </span>
              )}
              {isFull && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/30 px-3 py-1 text-sm font-semibold text-red-200">
                  Đã đủ người
                </span>
              )}
              {isRegistered && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-sm font-semibold text-emerald-200">
                  <UserCheck className="h-4 w-4" />
                  Đã đăng ký
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {event.title}
            </h1>

            {/* Meta info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-white/50 mb-1">Thời gian</div>
                  <div className="text-sm text-white/90">
                    {formatDate(event.time)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-white/50 mb-1">Địa điểm</div>
                  <div className="text-sm text-white/90">{event.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-white/50 mb-1">
                    Người tham gia
                  </div>
                  <div className="text-sm text-white/90">
                    {event.participantCount || 0}
                    {event.maxParticipants
                      ? ` / ${event.maxParticipants}`
                      : ""}{" "}
                    người
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">
                Về sự kiện này
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
              {status === "upcoming" && !isRegistered && !isFull && (
                <button
                  onClick={handleRegister}
                  disabled={isActioning}
                  className="flex-1 md:flex-none rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 text-sm font-bold text-slate-900 hover:brightness-110 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isActioning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng ký tham gia"
                  )}
                </button>
              )}

              {isRegistered && status === "upcoming" && (
                <button
                  onClick={handleCancel}
                  disabled={isActioning}
                  className="flex-1 md:flex-none rounded-full border border-red-400/30 bg-red-500/10 px-8 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isActioning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Hủy đăng ký"
                  )}
                </button>
              )}
            </div>
          </div>
        </article>

        {/* Club info (if available) */}
        {event.clubName && (
          <div className={cn("rounded-3xl p-6 mt-6", glass)}>
            <h3 className="text-lg font-bold text-white mb-2">Tổ chức bởi</h3>
            <p className="text-white/70">{event.clubName}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
