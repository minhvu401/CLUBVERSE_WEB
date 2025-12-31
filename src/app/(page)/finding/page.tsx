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
  Users,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Plus,
  Palette,
  Cpu,
  Trophy,
  Music2,
  BookOpen,
  Gamepad2,
  Shapes,
  Activity,
  CalendarDays,
  UserRound,
  Crown,
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

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 pr-10 text-[0.75rem] text-white/85 outline-none hover:bg-white/[0.10]"
      >
        <option value="" disabled className="bg-slate-950">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-950">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
      />
    </div>
  );
}

function TagIcon({ tag }: { tag: string }) {
  const cls = "h-4 w-4";
  switch (tag) {
    case "Nghệ thuật":
      return <Palette className={cls} />;
    case "Công nghệ":
      return <Cpu className={cls} />;
    case "Thể thao":
      return <Trophy className={cls} />;
    case "Âm nhạc":
      return <Music2 className={cls} />;
    case "Học tập":
      return <BookOpen className={cls} />;
    case "Game":
      return <Gamepad2 className={cls} />;
    default:
      return <Shapes className={cls} />;
  }
}

type Tone = "violet" | "sky" | "emerald" | "amber" | "fuchsia";

function toneFromCategory(category: string): Tone {
  const c = (category || "").toLowerCase();

  if (c.includes("công nghệ") || c.includes("tech") || c.includes("it")) return "sky";
  if (c.includes("thể thao") || c.includes("sport")) return "emerald";
  if (c.includes("âm nhạc") || c.includes("music")) return "fuchsia";
  if (c.includes("học") || c.includes("study") || c.includes("đọc")) return "amber";
  if (c.includes("nghệ thuật") || c.includes("art") || c.includes("thiết kế")) return "violet";
  if (c.includes("game") || c.includes("esport")) return "violet";

  return "violet";
}

type ClubVM = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  membersCount: number;
  membersText: string;
  rating: number; // nếu backend có thì hiện, không thì = 0
  tone: Tone;
};

export default function FindingClubsPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  // ✅ giống Home: redirect nếu chưa login
  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  // ✅ state fetch clubs (y chang Home)
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setClubsLoading(true);
        setClubsError(null);

        const res = await getAllClubs(token);
        if (!cancelled) setClubs(res);
      } catch (e: any) {
        if (!cancelled)
          setClubsError(e?.message ?? "Không tải được danh sách câu lạc bộ");
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ===== filters UI =====
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("Tất cả");
  const [time, setTime] = useState(""); // backend chưa có field => giữ UI, chưa lọc
  const [sort, setSort] = useState("");

  // ✅ tagOptions: gộp mặc định + category từ API
  const tagOptions = useMemo(() => {
    const defaults = ["Tất cả", "Nghệ thuật", "Công nghệ", "Thể thao", "Âm nhạc", "Học tập", "Game", "Khác"];
    const set = new Set<string>();
    clubs.forEach((c) => {
      if (c?.category) set.add(String(c.category));
    });
    const dynamic = Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, "vi"));
    const merged = [...defaults];
    dynamic.forEach((d) => {
      if (!merged.includes(d)) merged.push(d);
    });
    return merged;
  }, [clubs]);

  // ✅ map ClubItem -> ClubVM
  const clubCards: ClubVM[] = useMemo(() => {
    return clubs.map((c) => {
      const membersCount = Array.isArray(c.clubJoined) ? c.clubJoined.length : 0;
      const cat = c.category ?? "Khác";
      const rating = Number((c as any)?.rating ?? 0);

      return {
        id: c._id,
        name: c.fullName ?? "Câu lạc bộ",
        tag: cat,
        desc: c.description ?? "Chưa có mô tả.",
        membersCount,
        membersText: `${membersCount.toLocaleString("vi-VN")} thành viên`,
        rating,
        tone: toneFromCategory(cat),
      };
    });
  }, [clubs]);

  // ✅ filter + sort
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    let arr = clubCards.filter((c) => {
      const okTag = tag === "Tất cả" ? true : c.tag === tag;
      const okQ =
        !qq ||
        c.name.toLowerCase().includes(qq) ||
        c.desc.toLowerCase().includes(qq) ||
        c.tag.toLowerCase().includes(qq);

      // time: chưa có dữ liệu từ backend nên tạm không lọc
      const okTime = time ? true : true;

      return okTag && okQ && okTime;
    });

    if (sort === "Rating cao") {
      arr = [...arr].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "Nhiều thành viên") {
      arr = [...arr].sort((a, b) => b.membersCount - a.membersCount);
    } else if (sort === "Mới nhất") {
      // nếu backend có createdAt thì sort theo createdAt. Chưa có thì giữ nguyên.
      arr = [...arr];
    } else if (sort === "Phổ biến") {
      // tạm coi phổ biến = nhiều member
      arr = [...arr].sort((a, b) => b.membersCount - a.membersCount);
    }

    return arr;
  }, [clubCards, q, tag, sort, time]);

  const goClubDetail = (id: string) => {
    router.push(`/clubs/${id}`);
  };

  // ✅ stats (tính theo data thật)
  const totalClubs = clubs.length;
  const totalMembers = clubCards.reduce((sum, c) => sum + (c.membersCount || 0), 0);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {loading ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>
            Đang tải...
          </div>
        </main>
      ) : !token ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>
            Đang chuyển hướng...
          </div>
        </main>
      ) : (
        <main className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-20 pt-28">
          {/* TOP BAR */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-semibold">Khám phá các CLB</h1>
                <p className="mt-1 text-[0.75rem] text-white/55">
                  Tìm kiếm và tham gia các câu lạc bộ phù hợp với sở thích của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                  <Search size={16} className="text-white/55" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-64 bg-transparent text-[0.78rem] text-white/85 placeholder:text-white/35 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-white/70">
                    <SlidersHorizontal size={16} />
                    Bộ lọc:
                  </span>

                  {tagOptions.map((t) => {
                    const active = t === tag;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold transition",
                          active
                            ? "border-white/15 bg-white/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                        )}
                      >
                        {t === "Tất cả" ? <Sparkles className="h-4 w-4" /> : <TagIcon tag={t} />}
                        {t}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 md:w-[380px]">
                  <Select
                    value={time}
                    onChange={setTime}
                    placeholder="Thời gian hoạt động"
                    options={["Buổi sáng", "Buổi chiều", "Buổi tối", "Cuối tuần"]}
                  />
                  <Select
                    value={sort}
                    onChange={setSort}
                    placeholder="Sắp xếp theo"
                    options={["Phổ biến", "Mới nhất", "Rating cao", "Nhiều thành viên"]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Tổng CLB", value: totalClubs.toLocaleString("vi-VN"), icon: <Sparkles className="h-5 w-5 text-violet-200" /> },
              { label: "Hoạt động", value: totalClubs.toLocaleString("vi-VN"), icon: <Activity className="h-5 w-5 text-emerald-200" /> },
              { label: "Thành viên", value: totalMembers.toLocaleString("vi-VN"), icon: <UserRound className="h-5 w-5 text-sky-200" /> },
              { label: "Sự kiện", value: "0", icon: <CalendarDays className="h-5 w-5 text-amber-200" /> },
            ].map((s) => (
              <div key={s.label} className={cn("relative overflow-hidden rounded-2xl p-4", glass)}>
                <CornerGlow tone="violet" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-[0.7rem] text-white/60">{s.label}</div>
                    <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* GRID CLUBS */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <SectionHeader
              icon={<Sparkles size={18} className="text-violet-200" />}
              title="Gợi ý cho bạn"
              subtitle="Danh sách CLB từ hệ thống"
              actionHref="/clubs"
              actionText="Xem tất cả"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {clubsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-4",
                      "border border-white/10 bg-white/[0.05]"
                    )}
                  >
                    <div className="h-20 rounded-2xl border border-white/10 bg-white/10" />
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
              ) : filtered.length === 0 ? (
                <div
                  className={cn(
                    "rounded-2xl p-4 text-sm text-white/70",
                    "border border-white/10 bg-white/[0.05]"
                  )}
                >
                  Không có CLB phù hợp.
                </div>
              ) : (
                filtered.map((club) => (
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
                      if (e.key === "Enter" || e.key === " ") goClubDetail(club.id);
                    }}
                  >
                    <CornerGlow tone={club.tone} />

                    <div className="relative">
                      {/* banner */}
                      <div className="relative h-20 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                          <TagIcon tag={club.tag} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.65rem] text-white/70">
                          <TagIcon tag={club.tag} />
                          {club.tag}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-white/75">
                          <Star size={14} className="text-amber-200" />
                          {(club.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-semibold leading-snug">
                        {club.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-3 text-[0.72rem] leading-relaxed text-white/60">
                        {club.desc}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[0.68rem] text-white/55">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {club.membersText}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Crown size={14} />
                          Top
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goClubDetail(club.id);
                        }}
                        className="mt-3 w-full rounded-full bg-violet-500/90 py-2 text-[0.72rem] font-semibold text-white hover:bg-violet-500"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </motion.article>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-6 py-2 text-[0.75rem] font-semibold text-white/85 hover:bg-white/[0.10]">
                <Plus className="h-4 w-4" />
                Xem thêm CLB
              </button>
            </div>
          </section>

          {/* FAB */}
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
