"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import { motion } from "framer-motion";
import { Users, Search, Compass, Sparkles } from "lucide-react";

import { getAllClubs, type ClubItem } from "@/app/services/api/auth";

/* =========================
   UTILS
========================= */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* =========================
   CORNER GLOW
========================= */
function CornerGlow({
  tone = "violet",
}: {
  tone?: "violet" | "emerald" | "fuchsia" | "amber" | "sky";
}) {
  const map: Record<string, string> = {
    violet: "from-violet-500/70 to-indigo-500/0",
    emerald: "from-emerald-400/70 to-teal-500/0",
    fuchsia: "from-fuchsia-500/70 to-violet-500/0",
    amber: "from-amber-400/80 to-orange-500/0",
    sky: "from-sky-400/70 to-indigo-500/0",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45",
        "bg-gradient-to-br",
        map[tone],
        "blur-sm"
      )}
    />
  );
}

/* =========================
   PAGE
========================= */
export default function ClubsPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [q, setQ] = useState("");

  /* AUTH */
  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  /* FETCH */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      setClubsLoading(true);
      const res = await getAllClubs(token);
      if (!cancelled) setClubs(res);
      setClubsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* FILTER */
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

  const totalMembers = useMemo(
    () => clubs.reduce((s, c) => s + (c.clubJoined?.length ?? 0), 0),
    [clubs]
  );

  return (
    <div className="relative isolate min-h-screen text-white font-sans">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />

      <Header />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-32 pb-16 text-center">
        <motion.h1
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="
    font-display
    text-[2.1rem] md:text-[2.6rem]
    font-semibold
    tracking-[-0.01em]
    text-white
  "
>
  KHÁM PHÁ{" "}
  <span
    className="
      bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400
      bg-clip-text text-transparent
      font-bold
      tracking-tight
    "
  >
CÂU LẠC BỘ
  </span>
</motion.h1>


<p className="
  mt-3
  text-sm
  font-sans
  text-white/70
  max-w-xl
  mx-auto
">
  Nơi kết nối sinh viên – đam mê – kỹ năng – cộng đồng
</p>


        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 w-full max-w-lg">
            <Search className="text-white/60" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder=" bộ bạn quan tâm..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/45"
            />
          </div>
        </div>
      </section>

  

      {/* LIST */}
      <main className="mx-auto max-w-6xl px-4 pb-24">
        {clubsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[190px] rounded-3xl animate-pulse bg-white/[0.05] border border-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((club, _id) => (
              <motion.article
                key={club._id}
                whileHover={{ scale: 1.03 }}
                onClick={() => router.push(`/clubs/${club._id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5"
              >
                <CornerGlow tone={tones[_id % tones.length]} />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                      <Compass className="text-violet-300" />
                    </div>
                    <span className="text-[0.65rem] text-white/70">
                      {club.category ?? "Khác"}
                    </span>
                  </div>

                  

                  <h3 className="mt-3 font-display text-sm font-semibold tracking-tight">
                    {club.fullName}
                  </h3>

                  <p className="mt-1.5 font-sans line-clamp-3 text-[0.72rem] text-white/60">
                    {club.description}
                  </p>

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
