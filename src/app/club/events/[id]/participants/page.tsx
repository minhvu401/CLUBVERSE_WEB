/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getEventById,
  getEventParticipants,
  checkInParticipant,
  undoCheckIn,
  type EventItem,
  type JoinedUser,
} from "@/app/services/api/events";
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCheck,
  Calendar,
  Mail,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function EventParticipantsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { token, loading } = useAuth() as any;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<JoinedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
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

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventData, participantsData] = await Promise.all([
          getEventById(token, eventId),
          getEventParticipants(token, eventId),
        ]);
        setEvent(eventData);
        setParticipants(participantsData);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, eventId]);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const query = searchQuery.toLowerCase();
    return participants.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.userId.toLowerCase().includes(query),
    );
  }, [participants, searchQuery]);

  const stats = useMemo(() => {
    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checkedIn).length;
    const cancelled = 0;
    return { total, checkedIn, cancelled };
  }, [participants]);

  const handleCheckIn = async (participant: JoinedUser) => {
    if (!token) return;
    setActioningId(participant._id);
    try {
      if (participant.checkedIn) {
        await undoCheckIn(token, eventId, participant.userId);
      } else {
        await checkInParticipant(token, eventId, participant.userId);
      }
      // Refresh participants
      const data = await getEventParticipants(token, eventId);
      setParticipants(data);
    } catch (err: any) {
      alert(err.message || "Không thể thực hiện thao tác");
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-20">
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
        <main className="mx-auto max-w-7xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <div className="text-red-200 mb-4">
              {error || "Không tìm thấy sự kiện"}
            </div>
            <button
              onClick={() => router.push(`/club/events/${eventId}`)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 pb-20">
        {/* Back button */}
        <button
          onClick={() => router.push(`/club/events/${eventId}`)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          <p className="text-white/60">Quản lý người tham gia sự kiện</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={cn("rounded-2xl p-5", glass)}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/20 border border-blue-400/30">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-white/60">Tổng đăng ký</div>
              </div>
            </div>
          </div>

          <div className={cn("rounded-2xl p-5", glass)}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-500/20 border border-green-400/30">
                <CheckCircle2 className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.checkedIn}
                </div>
                <div className="text-sm text-white/60">Đã check-in</div>
              </div>
            </div>
          </div>

          <div className={cn("rounded-2xl p-5", glass)}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/20 border border-red-400/30">
                <XCircle className="h-6 w-6 text-red-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.cancelled}
                </div>
                <div className="text-sm text-white/60">Đã hủy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={cn("rounded-3xl p-4 mb-6", glass)}>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, email, ID..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Participants List */}
        {filteredParticipants.length === 0 ? (
          <div className={cn("rounded-3xl p-12 text-center", glass)}>
            <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">
              {searchQuery.trim()
                ? "Không tìm thấy người tham gia"
                : "Chưa có người đăng ký"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredParticipants.map((participant) => (
              <article
                key={participant._id}
                className={cn(
                  "rounded-3xl p-5 transition",
                  glass,
                  participant.checkedIn && "opacity-60",
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-900 font-bold">
                        {participant.fullName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">
                            {participant.fullName || "Không có tên"}
                          </h3>
                          {participant.checkedIn && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 border border-green-400/30 px-2 py-0.5 text-xs font-semibold text-green-200">
                              <UserCheck className="h-3 w-3" />
                              Đã check-in
                            </span>
                          )}
                          {false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-400/30 px-2 py-0.5 text-xs font-semibold text-red-200">
                              <XCircle className="h-3 w-3" />
                              Đã hủy
                            </span>
                          )}
                        </div>
                        {participant.email && (
                          <div className="flex items-center gap-1.5 text-sm text-white/60 mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            {participant.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Đăng ký: {formatDate(participant.registeredAt)}
                      </div>
                      {participant.checkedIn && participant.checkedInAt && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          Check-in: {formatDate(participant.checkedInAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleCheckIn(participant)}
                    disabled={actioningId === participant._id}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-sm font-semibold transition inline-flex items-center justify-center gap-2 min-w-[140px]",
                      participant.checkedIn
                        ? "border border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                        : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 hover:brightness-110",
                    )}
                  >
                    {actioningId === participant._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý
                      </>
                    ) : participant.checkedIn ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Hủy check-in
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Check-in
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
