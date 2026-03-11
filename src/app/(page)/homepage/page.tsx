"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import { getAllEvents } from "@/app/services/api/events";
import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  CalendarDays,
  Plus,
  Users,
  Clock,
  MapPin,
  Brain,
  Stars,
  Zap,
} from "lucide-react";
import { getAllClubs, type ClubItem } from "@/app/services/api/auth";

/* ================= UTILS ================= */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* ================= DECOR ================= */
function CornerGlow({ tone = "violet" }: { tone?: string }) {
  const map: Record<string, string> = {
    violet: "from-violet-500/60 to-indigo-500/0",
    emerald: "from-emerald-400/60 to-teal-500/0",
    fuchsia: "from-fuchsia-500/60 to-violet-500/0",
    amber: "from-amber-400/60 to-orange-500/0",
    sky: "from-sky-400/60 to-indigo-500/0",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rotate-45",
        "bg-gradient-to-br",
        map[tone],
        "blur"
      )}
    />
  );
}

/* ================= PAGE ================= */
export default function HomeDashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const isPremiumUser = Boolean((user as any)?.isPremium);
  const displayName = user?.fullName || "Bạn";

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    getAllClubs(token).then(setClubs);
    setEventsLoading(true);
    getAllEvents(token, { filter: "upcoming", limit: 4 })
      .then(setEvents)
      .finally(() => setEventsLoading(false));
  }, [token]);

  const clubCards = useMemo(() => {
    const tones = ["violet", "emerald", "fuchsia", "amber", "sky"];
    return clubs.map((c, i) => ({ ...c, tone: tones[i % tones.length] }));
  }, [clubs]);

  return (
    <div className="relative isolate min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-24 space-y-12">
        {/* HERO */}
        <section className={cn("relative rounded-3xl p-8", glass)}>
          <CornerGlow />
          <h1 className="text-2xl md:text-3xl font-semibold">
            👋 Chào mừng, {displayName}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            <span className="font-semibold text-white">ClubVerse</span> – Kết nối
            đam mê, mở rộng thế giới sinh viên
          </p>

          <p className="mt-3 max-w-xl text-sm text-white/60">
            Khám phá câu lạc bộ, sự kiện và cộng đồng phù hợp nhất với bạn – được
            gợi ý thông minh bởi AI.
          </p>

          {/* QUICK ACTIONS */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              icon={<Compass size={18} />}
              label="Khám phá CLB"
              onClick={() => router.push("/clubs")}
            />
            <QuickAction
              icon={<CalendarDays size={18} />}
              label="Lịch sự kiện"
              onClick={() => router.push("/events")}
            />
            <QuickAction
              icon={<Zap size={18} />}
              label="Hoạt động hôm nay"
              onClick={() => router.push("/events")}
            />
          </div>
        </section>

        {/* AI CLUBS */}
        <section
          className={cn(
            "relative rounded-3xl p-6",
            glass,
            !isPremiumUser && "overflow-hidden"
          )}
        >
          <p className="text-[0.72rem] text-white/55 mb-4">
            Dựa trên hoạt động, sự kiện đã tham gia và sở thích của bạn
          </p>

          {!isPremiumUser && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur">
              <div className="text-center max-w-xs">
                <Stars className="mx-auto mb-3 text-violet-300" />
                <p className="text-sm font-semibold">Tính năng Premium</p>
                <p className="mt-1 text-xs text-white/60">
                  Mở khóa AI gợi ý CLB dành riêng cho bạn
                </p>
                <button
                  onClick={() => router.push("/pricing")}
                  className="mt-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-xs font-semibold"
                >
                  Nâng cấp ngay
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            {clubCards.map((club) => (
              <motion.article
                key={club._id}
                whileHover={{ y: -6 }}
                className={cn(
                  "relative rounded-2xl p-4 bg-white/5 border border-white/10",
                  !isPremiumUser &&
                    "opacity-30 grayscale pointer-events-none"
                )}
              >
                <CornerGlow tone={club.tone} />
                <h3 className="text-sm font-semibold">{club.fullName}</h3>
                <p className="mt-1.5 line-clamp-3 text-[0.72rem] text-white/60">
                  {club.description}
                </p>
                <div className="mt-3 text-[0.68rem] text-white/55">
                  <Users size={14} className="inline mr-1" />
                  {club.clubJoined?.length ?? 0} thành viên
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section className={cn("rounded-3xl p-6", glass)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Sự kiện sắp tới</h2>
            <Link
              href="/events"
              className="text-xs font-semibold text-violet-300"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {eventsLoading ? (
              <div className="text-sm text-white/60">Đang tải sự kiện...</div>
            ) : (
              events.map((e: any) => (
                <motion.article
                  key={e._id}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/events/${e._id}`)}
                  className="cursor-pointer rounded-2xl p-4 border border-white/10 bg-white/5"
                >
                  <h3 className="text-sm font-semibold">{e.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[0.72rem] text-white/60">
                    {e.description}
                  </p>
                  <div className="mt-3 flex gap-4 text-[0.68rem] text-white/55">
                    <span>
                      <Clock size={14} className="inline mr-1" />
                      {new Date(e.time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      <MapPin size={14} className="inline mr-1" />
                      {e.location}
                    </span>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="text-center py-10">
          <h3 className="text-lg font-semibold">
            Sẵn sàng tham gia cộng đồng ClubVerse?
          </h3>
          <p className="mt-1 text-sm text-white/60">
            Hơn 100+ câu lạc bộ và sự kiện đang chờ bạn khám phá
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => router.push("/clubs")}
              className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-semibold"
            >
              Tham gia CLB
            </button>
            <button
              onClick={() => router.push("/events")}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm"
            >
              Xem sự kiện
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* FAB */}
      <button className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500 shadow-xl">
        <Plus />
      </button>
    </div>
  );
}

/* ================= SUB ================= */
function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs hover:bg-white/10"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
