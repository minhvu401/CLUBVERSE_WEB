/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
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

import { getCurrentProfile } from "@/app/services/api/users";
import { getMemberStatistics, getClubMembers, type ClubMember } from "@/app/services/api/clubMembers";
import { getAllEvents, type EventItem } from "@/app/services/api/events";
import { getClubPosts, type PostItem } from "@/app/services/api/post";
import { AUTH_BASE_URL } from "@/app/services/api/auth";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function Card({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div className={cn("rounded-2xl", glass, className)} {...props}>
      {children}
    </motion.div>
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
    <Card 
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden p-4 group cursor-pointer border border-white/5 hover:border-white/15 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.18),transparent_55%)] group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_15%,rgba(59,130,246,0.14),transparent_55%)] group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

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

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // States cho Dữ liệu thật
  const [statsData, setStatsData] = useState({
    members: 0,
    posts: 0,
    events: 0,
    interactions: 0
  });
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [weekPoints, setWeekPoints] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Derived arrays cho UI
  const week = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setCurrentTime(Date.now());
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const fetchAllData = async () => {
      try {
        const profileData = await getCurrentProfile(token);
        const clubId = profileData?._id || user?._id;
        
        if (!clubId) return;

        // Gọi APIs đồng thời
        const [memberStats, realPosts, allEvents, realMembers] = await Promise.all([
          getMemberStatistics(token, clubId).catch(() => ({ totalMembers: 0, activeMembers: 0, inactiveMembers: 0, admins: 0, moderators: 0, members: 0 })),
          getClubPosts(token, clubId, { sortBy: "newest", limit: 3 }).catch(() => []),
          getAllEvents(token, { limit: 3 }).catch(() => []),
          getClubMembers(token, clubId).then(res => ({ ...res, members: res.members?.slice(0, 4) || [] })).catch(() => ({ members: [], total: 0 })),
        ]);

        if (cancelled) return;

        // Fallback members array
        const memberList = Array.isArray(realMembers) ? realMembers : (realMembers?.members || []);

        // Tính tương tác (Tổng số Likes)
        const totalInteractions = realPosts.reduce((acc, p) => acc + (p.like || 0), 0);

        // Tính đồ thị 7 ngày qua từ các bài post
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        realPosts.forEach(post => {
          if (!post.createdAt) return;
          const pDate = new Date(post.createdAt).getTime();
          const diffDays = Math.floor((startOfDay - pDate) / (1000 * 60 * 60 * 24));
          // Nếu post nằm trong 7 ngày qua
          if (diffDays >= 0 && diffDays < 7) {
             const dayIndex = new Date(post.createdAt).getDay(); // 0(CN) -> 6(T7)
             counts[dayIndex] += 1;
          }
        });

        // Bổ sung các event vào đồ thị
        allEvents.forEach(evt => {
           if (!evt.time) return;
           const eDate = new Date(evt.time).getTime();
           const diffDays = Math.floor((startOfDay - eDate) / (1000 * 60 * 60 * 24));
           if (diffDays >= 0 && diffDays < 7) {
             const dayIndex = new Date(evt.time).getDay();
             counts[dayIndex] += 1;
           }
        });
        
        setWeekPoints(counts);

        setStatsData({
          members: memberStats.totalMembers || memberList.length,
          posts: realPosts.length,
          events: allEvents.length,
          interactions: totalInteractions
        });

        setEvents(allEvents);
        setPosts(realPosts);
        setMembers(memberList);

      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    };

    fetchAllData();
    return () => { cancelled = true; };
  }, [token, user?._id]);

  // Cấu hình stats
  const statsConfig = [
    {
      title: "Thành viên",
      value: statsData.members.toString(),
      trend: "+Mới",
      icon: <Users className="h-5 w-5 text-sky-200" />,
    },
    {
      title: "Bài đăng",
      value: statsData.posts.toString(),
      trend: "Hoạt động",
      icon: <FileText className="h-5 w-5 text-violet-200" />,
    },
    {
      title: "Sự kiện",
      value: statsData.events.toString(),
      trend: "Sắp tới",
      icon: <CalendarDays className="h-5 w-5 text-fuchsia-200" />,
    },
    {
      title: "Lượt tương tác",
      value: statsData.interactions.toString(),
      trend: "+Real",
      icon: <MessageSquare className="h-5 w-5 text-emerald-200" />,
    },
  ];

  const toneBadge: Record<string, string> = {
    violet: "bg-violet-400/12 text-violet-200 border-violet-400/25",
    fuchsia: "bg-fuchsia-400/12 text-fuchsia-200 border-fuchsia-400/25",
    sky: "bg-sky-400/12 text-sky-200 border-sky-400/25",
    emerald: "bg-emerald-400/12 text-emerald-200 border-emerald-400/25",
    amber: "bg-amber-400/12 text-amber-200 border-amber-400/25",
  };

  const getAvatarUrl = (url?: string, fallbackName?: string) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackName || "user")}`;
    if (url.startsWith("http")) return url;
    return `${AUTH_BASE_URL}${url}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 1000 * 60 * 60 * 24) return "Hôm nay";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

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

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl px-4 pb-14 pt-10"
      >
        {/* Page title */}
        <motion.div variants={itemVariants} className="mb-5">
          <div className="text-sm font-medium tracking-wider text-white/50 uppercase">Bảng điều khiển CLB</div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mt-1">
            Tổng quan hoạt động
          </h1>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {statsConfig.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              trend={s.trend}
              icon={s.icon}
            />
          ))}
        </motion.div>

        {/* Middle row */}
        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Activity chart */}
          <Card className="relative overflow-hidden p-5 lg:col-span-2 shadow-lg hover:shadow-purple-500/10 transition-shadow">
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
                      const max = Math.max(...weekPoints) || 1;
                      const min = Math.min(...weekPoints) || 0;
                      const norm = (v: number) =>
                        180 - ((v - min) / (max - min || 1)) * 140;

                      const xs = weekPoints.map((_, i) => 30 + i * 90);
                      const ys = weekPoints.map((v) => 20 + norm(v));

                      const d = xs
                        .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
                        .join(" ");

                      const area =
                        `${d} L ${xs[xs.length - 1]} 200 L ${xs[0]} 200 Z`;

                      return (
                        <>
                          <motion.path
                            d={area}
                            fill="url(#gradient-area)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                          <defs>
                            <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(168,85,247,0.3)" />
                              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d={d}
                            fill="none"
                            stroke="rgba(168,85,247,0.9)"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                          {xs.map((x, i) => (
                            <motion.circle
                              key={i}
                              cx={x}
                              cy={ys[i]}
                              r={hoverIndex === i ? 6 : 4}
                              fill="rgba(255,255,255,0.95)"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.9 }}
                              transition={{ delay: 1 + i * 0.1, type: "spring" }}
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
                {events.length === 0 && <div className="text-white/60 text-sm">Chưa có sự kiện nào</div>}
                {events.map((e, index) => {
                  // Fallback deterministically to match aesthetic if mapping real places
                  const tones = ["violet", "fuchsia", "sky", "emerald", "amber"];
                  const evtTone = tones[index % tones.length];
                  
                  return (
                  <div
                    key={e._id}
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
                            {formatDate(e.time)}
                          </span>

                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.72rem] text-white/70">
                            <MapPin className="h-4 w-4 text-white/60" />
                            {e.location || "Trực tuyến"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
                          new Date(e.time).getTime() > currentTime ? toneBadge[evtTone] : "border-gray-400/25 bg-gray-400/12 text-gray-200"
                        )}
                      >
                        {new Date(e.time).getTime() > currentTime ? "Sắp diễn ra" : "Đã kết thúc"}
                      </span>
                    </div>
                  </div>
                )})}
              </div>

              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.75rem] font-semibold text-white/80 hover:bg-white/[0.10]"
              >
                Xem lịch đầy đủ <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Bottom row */}
        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Recent posts */}
          <Card className="relative overflow-hidden p-5 lg:col-span-2 shadow-lg hover:shadow-violet-500/10 transition-shadow">
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
                {posts.length === 0 && <div className="text-white/60 text-sm">Chưa có bài đăng nào</div>}
                {posts.map((p) => {
                  const authorAvatar = getAvatarUrl(undefined, typeof p.clubId === "object" ? p.clubId.fullName : "Thành viên");
                  const authorName = typeof p.clubId === "object" ? p.clubId.fullName : "Quản trị CLB";
                  
                  return (
                  <div
                    key={p._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                          <img
                            src={authorAvatar}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="text-sm font-semibold text-white">
                              {authorName}
                            </div>
                            <div className="text-xs text-white/50">
                              • {formatDate(p.createdAt)}
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-sm line-clamp-2">
                            {p.content}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
                            <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-red-400">
                              <Heart className="h-4 w-4" />
                              {p.like || 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white/90">
                              <MessageCircle className="h-4 w-4" />
                              0
                            </span>
                            <span className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white/90">
                              <Share2 className="h-4 w-4" />
                              0
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                        title="Khác"
                        onClick={() => router.push(`/club/forum/${p._id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )})}
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
                {members.length === 0 && <div className="text-white/60 text-sm">Chưa có thành viên nào</div>}
                {members.map((m) => {
                  const roleColors = { admin: "violet", moderator: "fuchsia", member: "sky" };
                  const mTone = roleColors[m.role as keyof typeof roleColors] || "emerald";

                  return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        <img
                          src={getAvatarUrl(m.avatarUrl, m.fullName)}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {m.fullName}
                        </div>
                        <div className="mt-1 text-xs text-white/55 capitalize">{m.role}</div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1 text-[0.7rem] font-semibold",
                        m.isActive ? toneBadge[mTone] : "border-gray-400/25 bg-gray-400/12 text-gray-200"
                      )}
                    >
                      {m.isActive ? "Hoạt động" : "Ngừng HĐ"}
                    </span>
                  </div>
                )})}
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
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
}
