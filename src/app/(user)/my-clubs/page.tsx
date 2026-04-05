/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  Users,
  CalendarDays,
  FileText,
  X,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyClubs } from "@/app/services/api/users";

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
  return d.toLocaleDateString("vi-VN");
}

/* ================= types ================= */

interface MyClub {
  clubId: string;
  clubInfo: {
    _id: string;
    fullName: string;
    category: string;
    description?: string;
    rating?: number;
  };
  joinedAt: string;
  isActive?: boolean;
  members?: any[];
}

/* ================= page ================= */

export default function MyClubsPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [clubs, setClubs] = useState<MyClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active">("active");

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!token) {
          setError("No token found");
          return;
        }
        const data = await getMyClubs(token, filterStatus === "all" ? "" : "active");
        setClubs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch clubs"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      setIsLoading(true);
      fetchClubs();
    }
  }, [loading, filterStatus]);

  if (loading || isLoading) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
          <AppSidebar activeKey="clubs" />

          <main className="flex-1 space-y-4">
            {/* title */}
            <div className={cn("rounded-3xl p-5", glass)}>
              <h1 className="text-lg font-semibold">Câu lạc bộ của tôi</h1>
              <p className="mt-1 text-xs text-white/55">
                Các câu lạc bộ bạn đang tham gia
              </p>
            </div>

            {/* loading skeleton */}
            <section className={cn("rounded-3xl", glass)}>
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 animate-pulse"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-white/10" />
                        <div className="h-3 w-48 rounded bg-white/10" />
                        <div className="h-3 w-24 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <AppSidebar activeKey="clubs" />

        <main className="flex-1 space-y-4">
          {/* title */}
          <div className={cn("rounded-3xl p-5", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Câu lạc bộ của tôi</h1>
                <p className="mt-1 text-xs text-white/55">
                  Các câu lạc bộ bạn đang tham gia
                </p>
              </div>
            </div>
          </div>

          {/* filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("active")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                filterStatus === "active"
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                  : "border border-white/15 bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                filterStatus === "all"
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                  : "border border-white/15 bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              Tất cả
            </button>
          </div>

          {/* list */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="space-y-3 p-5">
              {clubs.map((c) => (
                <div
                  key={c.clubId}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 transition hover:border-emerald-500/30 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-sky-500/10"
                >
                  <div className="flex items-start gap-4">
                    {/* Club Avatar */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-sky-500/30 text-lg font-bold">
                      {c.clubInfo.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Club Name & Category */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold truncate">
                          {c.clubInfo.fullName}
                        </h3>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-200">
                          {c.clubInfo.category}
                        </span>
                      </div>

                      {/* Description */}
                      {c.clubInfo.description && (
                        <p className="text-xs text-white/60 line-clamp-2 mb-3">
                          {c.clubInfo.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-xs text-white/70">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays
                            size={13}
                            className="text-emerald-400/70"
                          />
                          {fmtDate(c.joinedAt)}
                        </span>

                        {c.clubInfo.rating !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-yellow-400/70">⭐</span>
                            {c.clubInfo.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/my-messages?clubId=${c.clubId}&clubName=${encodeURIComponent(c.clubInfo.fullName)}`)}
                        className="rounded-lg bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/30 px-3 py-2 text-xs font-medium text-white transition hover:from-sky-500/30 hover:to-emerald-500/30 hover:border-sky-500/50 flex items-center gap-1"
                        title="Nhắn tin cho câu lạc bộ"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <Link
                        href={`/clubs/${c.clubId}`}
                        className="rounded-lg bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-medium text-white transition hover:from-emerald-500/30 hover:to-sky-500/30 hover:border-emerald-500/50 flex items-center gap-1"
                      >
                        <FileText size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
