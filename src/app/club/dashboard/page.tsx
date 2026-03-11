/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import {
  Users,
  FileText,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  MoreHorizontal,
  BarChart3,
  Clock,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  ChevronRight,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl", glass, className)}>{children}</div>
  );
}

function StatCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
}) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_15%,rgba(59,130,246,0.14),transparent_55%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
            {icon}
          </div>
          <div>
            <div className="text-[0.72rem] text-white/60">{title}</div>
            <div className="mt-1 text-lg font-semibold text-white">{value}</div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[0.68rem] font-semibold text-emerald-200">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
      </div>
    </Card>
  );
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-[0.72rem] text-white/55">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.72rem] text-white/75">
      {children}
    </span>
  );
}

export default function ClubDashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isClubRole) return router.replace("/");
  }, [loading, token, isClubRole, router]);

  // ===== Mock data =====
  const stats = [
    {
      title: "Thành viên",
      value: "500+",
      trend: "+12%",
      icon: <Users className="h-5 w-5 text-sky-200" />,
    },
    {
      title: "Bài đăng",
      value: "2,400+",
      trend: "+8%",
      icon: <FileText className="h-5 w-5 text-violet-200" />,
    },
    {
      title: "Sự kiện",
      value: "300+",
      trend: "+15%",
      icon: <CalendarDays className="h-5 w-5 text-fuchsia-200" />,
    },
    {
      title: "Lượt tương tác",
      value: "30K+",
      trend: "+21%",
      icon: <MessageSquare className="h-5 w-5 text-emerald-200" />,
    },
  ];

  const week = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const points = [10, 12, 9, 15, 14, 18, 16]; // fake

  const events = [
    {
      title: "Họp CLB hằng tuần",
      time: "19:30 - 21:00",
      place: "Phòng A101",
      tone: "violet",
    },
    {
      title: "Workshop Coding",
      time: "14:00 - 16:30",
      place: "Online",
      tone: "fuchsia",
    },
    {
      title: "Team Building",
      time: "09:00 - 12:00",
      place: "Khu thể thao",
      tone: "sky",
    },
  ] as const;

  const posts = [
    {
      name: "Nguyễn Văn A",
      time: "1 ngày trước",
      content:
        "Bài workshop hôm nay rất hay và bổ ích! Cảm ơn mọi người đã tham gia nhiệt tình.",
      likes: 12,
      comments: 8,
      shares: 2,
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Trần Thị B",
      time: "2 ngày trước",
      content:
        "Đăng ký tham gia sự kiện Team Building ngày 22/11 nhé các bạn!",
      likes: 30,
      comments: 15,
      shares: 7,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Lê Văn C",
      time: "3 ngày trước",
      content:
        "Chia sẻ tài liệu học tập cho các thành viên mới. Link trong comment.",
      likes: 19,
      comments: 6,
      shares: 4,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    },
  ];

  const members = [
    { name: "Nguyễn Văn A", role: "Chủ nhiệm", tone: "violet", avatar: posts[0].avatar },
    { name: "Trần Thị B", role: "Phó chủ nhiệm", tone: "fuchsia", avatar: posts[1].avatar },
    { name: "Lê Văn C", role: "Thành viên", tone: "sky", avatar: posts[2].avatar },
    {
      name: "Phạm Thị D",
      role: "Thành viên",
      tone: "emerald",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Hoàng Văn E",
      role: "Thành viên",
      tone: "amber",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80",
    },
  ] as const;

  const toneBadge: Record<string, string> = {
    violet: "bg-violet-400/12 text-violet-200 border-violet-400/25",
    fuchsia: "bg-fuchsia-400/12 text-fuchsia-200 border-fuchsia-400/25",
    sky: "bg-sky-400/12 text-sky-200 border-sky-400/25",
    emerald: "bg-emerald-400/12 text-emerald-200 border-emerald-400/25",
    amber: "bg-amber-400/12 text-amber-200 border-amber-400/25",
  };

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        {/* ✅ BG giống /club/home */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

        <Header />
        <main className="mx-auto max-w-6xl px-4 pt-10">
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Đang tải...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BG giống /club/home */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* Page title */}
        <div className="mb-5">
          <div className="text-sm text-white/60">Club Dashboard</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              trend={s.trend}
              icon={s.icon}
            />
          ))}
        </div>

        {/* Middle row */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Activity chart */}
          <Card className="relative overflow-hidden p-5 lg:col-span-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_10%,rgba(168,85,247,0.14),transparent_55%)]" />
            <div className="relative">
              <SectionTitle
                title="Hoạt động trong tuần"
                subtitle="Thống kê tương tác của thành viên"
                right={
                  <Pill>
                    <BarChart3 className="h-4 w-4 text-white/70" />
                    Tuần này
                  </Pill>
                }
              />

              {/* chart area */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-[0.68rem] text-white/55">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                </div>

                <div className="mt-3 h-[170px] w-full">
                  {/* simple SVG line chart */}
                  <svg viewBox="0 0 700 220" className="h-full w-full">
                    {/* grid */}
                    {[0, 1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={20 + i * 50}
                        x2="700"
                        y2={20 + i * 50}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* area */}
                    {(() => {
                      const max = Math.max(...points) || 1;
                      const min = Math.min(...points) || 0;
                      const norm = (v: number) =>
                        180 - ((v - min) / (max - min || 1)) * 140;

                      const xs = points.map((_, i) => 30 + i * 90);
                      const ys = points.map((v) => 20 + norm(v));

                      const d = xs
                        .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
                        .join(" ");

                      const area =
                        `${d} L ${xs[xs.length - 1]} 200 L ${xs[0]} 200 Z`;

                      return (
                        <>
                          <path
                            d={area}
                            fill="rgba(168,85,247,0.14)"
                          />
                          <path
                            d={d}
                            fill="none"
                            stroke="rgba(168,85,247,0.9)"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          {xs.map((x, i) => (
                            <circle
                              key={i}
                              cx={x}
                              cy={ys[i]}
                              r={hoverIndex === i ? 6 : 4}
                              fill="rgba(255,255,255,0.95)"
                              opacity={0.9}
                              onMouseEnter={() => setHoverIndex(i)}
                              onMouseLeave={() => setHoverIndex(null)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between text-[0.72rem] text-white/60">
                  {week.map((d) => (
                    <span key={d} className="w-full text-center">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming events */}
          <Card className="relative overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_60%)]" />
            <div className="relative">
              <SectionTitle
                title="Sự kiện sắp tới"
                subtitle="Lịch hoạt động"
                right={
                  <button
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                    title="Tùy chọn"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />

              <div className="mt-4 space-y-3">
                {events.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {e.title}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.72rem] text-white/70">
                            <Clock className="h-4 w-4 text-white/60" />
                            {e.time}
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.72rem] text-white/70">
                            <MapPin className="h-4 w-4 text-white/60" />
                            {e.place}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
                          toneBadge[e.tone]
                        )}
                      >
                        Sắp diễn ra
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.75rem] font-semibold text-white/80 hover:bg-white/[0.10]"
              >
                Xem lịch đầy đủ <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Recent posts */}
          <Card className="relative overflow-hidden p-5 lg:col-span-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
            <div className="relative">
              <SectionTitle
                title="Bài đăng gần đây"
                subtitle="Cập nhật hoạt động mới nhất"
                right={
                  <button
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                    title="Tùy chọn"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />

              <div className="mt-4 space-y-3">
                {posts.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                          <img
                            src={p.avatar}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="text-sm font-semibold text-white">
                              {p.name}
                            </div>
                            <div className="text-xs text-white/50">
                              • {p.time}
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-white/70 leading-relaxed">
                            {p.content}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
                            <span className="inline-flex items-center gap-1.5">
                              <Heart className="h-4 w-4" />
                              {p.likes}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4" />
                              {p.comments}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Share2 className="h-4 w-4" />
                              {p.shares}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                        title="Khác"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Members */}
          <Card className="relative overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(59,130,246,0.12),transparent_60%)]" />
            <div className="relative">
              <SectionTitle
                title="Thành viên"
                subtitle="Danh sách nổi bật"
                right={
                  <button
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                    title="Tùy chọn"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />

              <div className="mt-4 space-y-3">
                {members.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        <img
                          src={m.avatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {m.name}
                        </div>
                        <div className="mt-1 text-xs text-white/55">{m.role}</div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1 text-[0.7rem] font-semibold",
                        toneBadge[m.tone]
                      )}
                    >
                      Active
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push("/club/members")}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
              >
                Xem tất cả thành viên
              </button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
