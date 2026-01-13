"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import { motion } from "framer-motion";
import {
  Users,
  Search,
  Compass,
  Sparkles,
  Filter,
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
  tone?: "violet" | "emerald" | "fuchsia" | "amber" | "sky";
}) {
  const map: Record<string, string> = {
    violet: "from-violet-500/65 to-indigo-500/0",
    emerald: "from-emerald-400/65 to-teal-500/0",
    fuchsia: "from-fuchsia-500/65 to-violet-500/0",
    amber: "from-amber-400/70 to-orange-500/0",
    sky: "from-sky-400/65 to-indigo-500/0",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45",
        "bg-gradient-to-br",
        map[tone],
        "blur-[0.3px]"
      )}
    />
  );
}

export default function ClubsPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  /* =========================
     FETCH CLUBS
  ========================= */
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setClubsLoading(true);
        setError(null);

        const res = await getAllClubs(token);

        if (!cancelled) setClubs(res);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Không tải được danh sách câu lạc bộ"
          );
        }
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* =========================
     FILTER SEARCH
  ========================= */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return clubs;

    return clubs.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query)
    );
  }, [clubs, q]);

  const tones = ["violet", "emerald", "fuchsia", "amber", "sky"] as const;

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28">
        {/* TITLE */}
        <div className="mb-6">
          <div className="text-sm text-white/60">Clubs</div>
          <h1 className="text-2xl font-bold">Danh sách Câu lạc bộ</h1>
          <p className="mt-1 text-sm text-white/60">
            Khám phá và tham gia các câu lạc bộ phù hợp với bạn
          </p>
        </div>

        {/* SEARCH */}
        <div className={cn("mb-6 rounded-3xl p-4", glass)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm câu lạc bộ theo tên, lĩnh vực..."
                className="bg-transparent text-sm text-white outline-none placeholder:text-white/45 w-[260px]"
              />
            </div>

            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.10]">
              <Filter size={14} />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* LIST */}
        {clubsLoading ? (
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Đang tải câu lạc bộ...
          </div>
        ) : error ? (
          <div className={cn("rounded-3xl p-6 text-sm text-red-200", glass)}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Không có câu lạc bộ nào.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((club, idx) => (
              <motion.article
                key={club._id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={cn(
                  "relative overflow-hidden rounded-3xl p-5 cursor-pointer",
                  "border border-white/10 bg-white/[0.05]"
                )}
                onClick={() => router.push(`/clubs/${club._id}`)}
              >
                <CornerGlow tone={tones[idx % tones.length]} />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/20 text-base">
                      <Compass />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.65rem] text-white/70">
                      {club.category ?? "Khác"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold">
                    {club.fullName ?? "Câu lạc bộ"}
                  </h3>

                  <p className="mt-1.5 line-clamp-3 text-[0.72rem] text-white/60">
                    {club.description ?? "Chưa có mô tả."}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[0.68rem] text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} />
                      {(club.clubJoined?.length ?? 0).toLocaleString("vi-VN")}{" "}
                      thành viên
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/clubs/${club._id}`);
                    }}
                    className="mt-4 w-full rounded-full bg-violet-500/90 py-2 text-[0.72rem] font-semibold text-white hover:bg-violet-500"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
