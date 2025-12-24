"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  CalendarDays,
  Plus,
  Users,
  Clock,
  MapPin,
} from "lucide-react";

import { getAllClubs, type ClubItem } from "@/app/services/api/auth";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function CornerGlow({
  tone = "violet",
}: {
  tone?: "violet" | "sky" | "emerald" | "amber" | "fuchsia";
}) {
  const toneMap: Record<string, string> = {
    violet: "from-violet-500/65 to-indigo-500/0",
    sky: "from-sky-400/65 to-indigo-500/0",
    emerald: "from-emerald-400/65 to-teal-500/0",
    amber: "from-amber-400/70 to-orange-500/0",
    fuchsia: "from-fuchsia-500/65 to-violet-500/0",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45",
        "bg-gradient-to-br",
        toneMap[tone] ?? toneMap.violet,
        "blur-[0.3px]"
      )}
    />
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  actionHref,
  actionText,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[0.72rem] text-white/55">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {actionHref ? (
        <Link
          href={actionHref}
          className="text-[0.72rem] font-semibold text-white/55 hover:text-white/80"
        >
          {actionText ?? "Xem tất cả"} →
        </Link>
      ) : null}
    </div>
  );
}

export default function HomeDashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setClubsLoading(true);
        setClubsError(null);

        const res = await getAllClubs(token);

        if (!cancelled) setClubs(res);
      } catch (error: unknown) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Không tải được danh sách câu lạc bộ";
          setClubsError(message);
        }
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const displayName = user?.fullName || "Minh";

  const clubCards = useMemo(() => {
    const tones = ["violet", "emerald", "fuchsia", "amber", "sky"] as const;

    return clubs.map((c, idx) => ({
      id: c._id,
      name: c.fullName ?? "Câu lạc bộ",
      tag: c.category ?? "Khác",
      desc: c.description ?? "Chưa có mô tả.",
      members: `${(c.clubJoined?.length ?? 0).toLocaleString(
        "vi-VN"
      )} thành viên`,
      tone: tones[idx % tones.length],
      icon: "🏷️",
      cta: "Tham Gia",
    }));
  }, [clubs]);

  // ✅ GO TO DETAIL
  const goClubDetail = (id: string) => {
    router.push(`/clubs/${id}`);
  };

  const events = [
    {
      id: 1,
      day: "15",
      month: "THG 11",
      title: "Workshop React.js Nâng Cao",
      desc: "Học cách kỹ thuật React.js nâng cao từ các chuyên gia hàng đầu.",
      time: "19:00 - 21:00",
      place: "Online",
      attendees: "+24 khác",
      tone: "violet" as const,
      cta: "Tham Gia",
      ctaTone: "violet" as const,
    },
    {
      id: 2,
      day: "18",
      month: "THG 11",
      title: "Cuộc Thi Thiết Kế Logo",
      desc: "Thể hiện tài năng thiết kế của bạn với giải thưởng hấp dẫn.",
      time: "Cả ngày",
      place: "Giải thưởng: 5M VND",
      attendees: "+67 khác",
      tone: "fuchsia" as const,
      cta: "Đăng Ký",
      ctaTone: "fuchsia" as const,
    },
    {
      id: 3,
      day: "22",
      month: "THG 11",
      title: "Meetup Nhiếp Ảnh Hà Nội",
      desc: "Gặp gỡ và chụp ảnh cùng các nhiếp ảnh gia tại Hà Nội.",
      time: "14:00 - 18:00",
      place: "Hồ Gươm, Hà Nội",
      attendees: "+15 khác",
      tone: "emerald" as const,
      cta: "Tham Gia",
      ctaTone: "emerald" as const,
    },
    {
      id: 4,
      day: "25",
      month: "THG 11",
      title: "Hội Thảo Khởi Nghiệp Công Nghệ",
      desc: "Chia sẻ kinh nghiệm khởi nghiệp từ các founder thành công.",
      time: "09:00 - 17:00",
      place: "TPHCM",
      attendees: "+89 khác",
      tone: "amber" as const,
      cta: "Đăng Ký",
      ctaTone: "amber" as const,
    },
  ];

  const stats = [
    { label: "Câu Lạc Bộ Tham Gia", value: "12" },
    { label: "Sự Kiện Sắp Tới", value: "8" },
    { label: "Điểm Hoạt Động", value: "156" },
    { label: "Bạn Bè Mới", value: "24" },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {loading ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div
            className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}
          >
            Đang tải...
          </div>
        </main>
      ) : !token ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div
            className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}
          >
            Đang chuyển hướng...
          </div>
        </main>
      ) : (
        <main className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-20 pt-28">
          {/* HERO */}
          <section
            className={cn(
              "relative overflow-hidden rounded-3xl p-6 md:p-8",
              glass
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
            <div className="relative">
              <h1 className="text-center text-2xl font-semibold md:text-3xl">
                Chào mừng, {displayName}{" "}
                <span className="inline-block">🌟</span>
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-center text-[0.78rem] text-white/60 md:text-sm">
                Khám phá thế giới câu lạc bộ với những gợi ý thông minh và sự
                kiện sắp tới dành riêng cho bạn.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.10]">
                  <Compass size={16} />
                  Khám Phá Câu Lạc Bộ
                </button>

                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.10]">
                  <CalendarDays size={16} />
                  Lịch Của Tôi
                </button>

                <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400">
                  <Plus size={16} />
                  Tạo Câu Lạc Bộ
                </button>
              </div>
            </div>
          </section>

          {/* CLUBS */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <SectionHeader
              icon={<Sparkles size={18} className="text-violet-200" />}
              title="Câu Lạc Bộ AI Gợi Ý"
              actionHref="/clubs"
              actionText="Xem Tất Cả"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {clubsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-4",
                      "border border-white/10 bg-white/[0.05]"
                    )}
                  >
                    <div className="h-9 w-9 rounded-xl bg-white/10" />
                    <div className="mt-3 h-4 w-4/5 rounded bg-white/10" />
                    <div className="mt-2 h-3 w-full rounded bg-white/10" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
                    <div className="mt-4 h-8 w-full rounded-full bg-white/10" />
                  </div>
                ))
              ) : clubsError ? (
                <div
                  className={cn(
                    "rounded-2xl p-4 text-sm text-white/70",
                    "border border-white/10 bg-white/[0.05]"
                  )}
                >
                  {clubsError}
                </div>
              ) : clubCards.length === 0 ? (
                <div
                  className={cn(
                    "rounded-2xl p-4 text-sm text-white/70",
                    "border border-white/10 bg-white/[0.05]"
                  )}
                >
                  Chưa có câu lạc bộ nào.
                </div>
              ) : (
                clubCards.map((club) => (
                  <motion.article
                    key={club.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={cn(
                      "relative cursor-pointer overflow-hidden rounded-2xl p-4",
                      "border border-white/10 bg-white/[0.05] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                    )}
                    onClick={() => goClubDetail(club.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        goClubDetail(club.id);
                    }}
                  >
                    <CornerGlow tone={club.tone} />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/20 text-base">
                          {club.icon}
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.65rem] text-white/70">
                          {club.tag}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-semibold leading-snug">
                        {club.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-3 text-[0.72rem] leading-relaxed text-white/60">
                        {club.desc}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[0.68rem] text-white/55">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {club.members}
                        </span>
                      </div>

                      {/* ✅ BUTTON GO DETAIL */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goClubDetail(club.id);
                        }}
                        className="mt-3 w-full rounded-full bg-violet-500/90 py-2 text-[0.72rem] font-semibold text-white hover:bg-violet-500"
                      >
                        {club.cta}
                      </button>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </section>

          {/* EVENTS */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <SectionHeader
              icon={<CalendarDays size={18} className="text-violet-200" />}
              title="Sự Kiện Sắp Tới"
              actionHref="/events"
              actionText="Xem Lịch Đầy Đủ"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {events.map((ev) => (
                <motion.article
                  key={ev.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-4",
                    "border border-white/10 bg-white/[0.05]"
                  )}
                >
                  <CornerGlow tone={ev.tone} />
                  <div className="relative flex gap-4">
                    <div className="w-14 shrink-0 rounded-2xl border border-white/10 bg-black/20 px-2 py-2 text-center">
                      <div className="text-lg font-semibold">{ev.day}</div>
                      <div className="text-[0.6rem] text-white/55">
                        {ev.month}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {ev.title}
                        </h3>
                      </div>

                      <p className="mt-1.5 line-clamp-2 text-[0.72rem] text-white/60">
                        {ev.desc}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-white/55">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} />
                          {ev.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />
                          {ev.place}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded-full border border-white/10 bg-white/10"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <span className="text-[0.68rem] text-white/55">
                            {ev.attendees}
                          </span>
                        </div>

                        <button
                          className={cn(
                            "rounded-full px-4 py-1.5 text-[0.72rem] font-semibold text-white",
                            ev.ctaTone === "emerald" &&
                              "bg-emerald-500/80 hover:bg-emerald-500",
                            ev.ctaTone === "amber" &&
                              "bg-amber-400/80 hover:bg-amber-400 text-black",
                            ev.ctaTone === "fuchsia" &&
                              "bg-fuchsia-500/80 hover:bg-fuchsia-500",
                            ev.ctaTone === "violet" &&
                              "bg-violet-500/80 hover:bg-violet-500"
                          )}
                        >
                          {ev.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* STATS */}
          <section className="grid gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-4 text-center",
                  glass
                )}
              >
                <CornerGlow tone="violet" />
                <div className="relative">
                  <div className="text-2xl font-semibold">{s.value}</div>
                  <div className="mt-1 text-[0.7rem] text-white/60">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Floating Action Button */}
          <button
            className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500 text-white shadow-xl shadow-violet-500/30 hover:bg-violet-400"
            aria-label="Tạo nhanh"
            title="Tạo nhanh"
          >
            <Plus />
          </button>
        </main>
      )}

      <Footer />
    </div>
  );
}
