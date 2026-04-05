/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getEventById,
  registerEvent,
  cancelEventRegistration,
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
  Mail,
  Star,
} from "lucide-react";
import { toast } from "sonner";

/* ================= UTILS ================= */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* ================= PAGE ================= */
export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { user, token, loading } = useAuth() as any;

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !eventId) return;
    (async () => {
      const data = await getEventById(token, eventId);
      setEvent(data);
      setIsLoading(false);
    })();
  }, [token, eventId]);

  if (loading || isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ===== LOGIC THEO API ===== */
  const joinedUsers = event.joinedUsers || [];
  const participantCount = joinedUsers.length;
  const availableSlots = event.availableSlots;
  const isFull = event.isFull;
  const isRegistered = joinedUsers.some(
    (u: any) => u.userId === user?._id
  );
  const status = event.status;

  const progress =
    event.maxParticipants > 0
      ? Math.min((participantCount / event.maxParticipants) * 100, 100)
      : 0;

  /* ===== ACTIONS ===== */
  const handleRegister = async () => {
    if (!token || isRegistered || isFull) return;
    try {
      setIsActioning(true);
      await registerEvent(token, event._id);
      setEvent(await getEventById(token, event._id));
      toast.success("Đăng ký tham gia thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Lý do hủy (bắt buộc, ít nhất 10 ký tự):");
    if (reason === null) return;
    if (reason.trim().length < 10) {
      toast.error("Lý do hủy phải có ít nhất 10 ký tự!");
      return;
    }
    try {
      setIsActioning(true);
      await cancelEventRegistration(token, event._id, reason);
      setEvent(await getEventById(token, event._id));
      toast.success("Hủy đăng ký thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy đăng ký");
    } finally {
      setIsActioning(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <Header />

      {/* HERO / POSTER SECTION */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* POSTER */}
          <div className="mx-auto w-full max-w-[340px]">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 shadow-2xl">
              <img
                src={event.images?.[0] || "/placeholder-event.jpg"}
                alt={event.title}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* INFO */}
          <div>
            <button
              onClick={() => router.push("/events")}
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-4">
              {status === "upcoming" && (
                <Badge color="blue" icon={<Clock size={14} />} text="Sắp diễn ra" />
              )}
              {status === "ongoing" && (
                <Badge
                  color="green"
                  icon={<CheckCircle2 size={14} />}
                  text="Đang diễn ra"
                />
              )}
              {status === "past" && (
                <Badge color="gray" icon={<XCircle size={14} />} text="Đã kết thúc" />
              )}
              {isRegistered && (
                <Badge
                  color="emerald"
                  icon={<UserCheck size={14} />}
                  text="Đã đăng ký"
                />
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {event.title}
            </h1>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-6">
              {!isRegistered && status === "upcoming" && !isFull && new Date(event.time) >= new Date() && (
                <button
                  onClick={handleRegister}
                  disabled={isActioning}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 text-sm font-bold text-slate-900"
                >
                  {isActioning ? "Đang xử lý..." : "Đăng ký tham gia"}
                </button>
              )}

              {isRegistered && status === "upcoming" && new Date(event.time) >= new Date() && (
                <button
                  onClick={handleCancel}
                  disabled={isActioning}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-8 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                >
                  Hủy đăng ký
                </button>
              )}

              {isFull && (
                <div className="rounded-full bg-red-500/15 border border-red-400/30 px-6 py-3 text-sm font-semibold text-red-200">
                  Đã đủ người
                </div>
              )}
            </div>

            {/* QUICK INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<Calendar />}>
                {new Date(event.time).toLocaleString("vi-VN")}
              </InfoRow>
              <InfoRow icon={<MapPin />}>{event.location}</InfoRow>
              <InfoRow icon={<Users />}>
                {participantCount}/{event.maxParticipants} người
              </InfoRow>
            </div>

            {/* PROGRESS */}
            <div className="mt-4">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/50">
                Còn {availableSlots} slot
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* DESCRIPTION */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">Về sự kiện</h2>
            <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </section>
        </div>

        {/* CLUB INFO */}
        {event.clubId && (
          <aside className={cn("rounded-3xl p-6 space-y-4", glass)}>
            <h3 className="text-lg font-bold mb-2">Đơn vị tổ chức</h3>

            <div className="text-white/90 font-semibold">
              {event.clubId.fullName}
            </div>

            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail size={14} /> {event.clubId.email}
            </div>

            <div className="flex items-center gap-2 text-sm text-white/70">
              <Star size={14} className="text-yellow-400" />
              Rating: {event.clubId.rating ?? 0}
            </div>
          </aside>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */
function Badge({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: "blue" | "green" | "gray" | "emerald";
}) {
  const map: any = {
    blue: "bg-blue-500/20 text-blue-200",
    green: "bg-green-500/20 text-green-200",
    gray: "bg-gray-500/20 text-gray-300",
    emerald: "bg-emerald-500/20 text-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${map[color]}`}
    >
      {icon}
      {text}
    </span>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      {icon}
      <span>{children}</span>
    </div>
  );
}
