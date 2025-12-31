"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders/page";

import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";

import { getProfile, type ProfileResponse } from "@/app/services/api/auth";

import {
  Users,
  TrendingUp,
  Star,
  MapPin,
  Mail,
  Phone,
  FileText,
  GraduationCap,
  Rocket,
  Network,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              filled ? "text-yellow-300 fill-yellow-300" : "text-white/25"
            )}
          />
        );
      })}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="min-w-[120px] text-xs text-white/55">{label}</div>
      <div className="text-sm text-white/90">{value}</div>
    </div>
  );
}

type ClubHomeVM = {
  name: string;
  tagline: string;
  avatarUrl: string;
  info: {
    tenClb: string;
    thanhLap: string;
    soThanhVien: string;
    diaChi: string;
    chuTich: string;
    email: string;
    hotline: string;
  };
  quickStats: {
    totalPosts: number;
    activeMembers: number;
    events: number;
  };
  rating: {
    score: number;
    count: number;
  };
  description: string;
  features: Array<{ title: string; desc: string; icon: any }>;
};

function buildTaglineFromProfile(p: any) {
  const cat = String(p?.category || "").trim();
  if (cat) return `Danh mục: ${cat}`;

  const desc = String(p?.description || "").trim();
  if (!desc) return "Nơi kết nối và phát triển cộng đồng câu lạc bộ.";
  const firstLine = desc.split("\n").find((x: string) => x.trim()) || desc;
  return firstLine.length > 90 ? firstLine.slice(0, 90) + "…" : firstLine;
}

function toNumberSafe(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function HomeClubPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isClubRole) router.replace("/");
  }, [loading, token, isClubRole, router]);

  const [pageLoading, setPageLoading] = useState(true);

  const [club, setClub] = useState<ClubHomeVM>(() => ({
    name: "Câu lạc bộ",
    tagline: "Nơi kết nối và phát triển cộng đồng câu lạc bộ.",
    // ✅ đổi fallback về local để không bị next/image chặn host
    avatarUrl: "/clubverse_logo_1.png",
    info: {
      tenClb: "—",
      thanhLap: "—",
      soThanhVien: "—",
      diaChi: "—",
      chuTich: "—",
      email: "—",
      hotline: "—",
    },
    quickStats: { totalPosts: 0, activeMembers: 0, events: 0 },
    rating: { score: 0, count: 0 },
    description: "—",
    features: [
      {
        title: "Workshop Công nghệ",
        desc: "Chuỗi workshop thực chiến về Web, AI, UI/UX, DevOps…",
        icon: GraduationCap,
      },
      {
        title: "Dự án Sáng tạo",
        desc: "Thực hiện dự án theo nhóm, có mentor hỗ trợ và demo định kỳ.",
        icon: Rocket,
      },
      {
        title: "Networking",
        desc: "Kết nối với diễn giả, doanh nghiệp, alumni và cộng đồng công nghệ.",
        icon: Network,
      },
    ],
  }));

  useEffect(() => {
    if (loading) return;
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setPageLoading(true);

        const raw = await getProfile(token);
        const p: ProfileResponse = (raw as any)?.user ?? (raw as any);

        const avatar = String((p as any)?.avatarUrl || "").trim();
        const fullName = String((p as any)?.fullName || "").trim();
        const desc = String((p as any)?.description || "").trim();

        const ratingScore = toNumberSafe((p as any)?.rating, 0);
        const postsLen = Array.isArray((p as any)?.posts) ? (p as any).posts.length : 0;

        const established =
          String((p as any)?.createdAt || (p as any)?.establishedAt || "").trim() || "—";

        const membersCount =
          (p as any)?.membersCount ?? (p as any)?.totalMembers ?? (p as any)?.memberCount ?? null;

        const eventsCount =
          (p as any)?.eventsCount ?? (p as any)?.totalEvents ?? (p as any)?.eventCount ?? null;

        const activeMembers =
          (p as any)?.activeMembers ?? (p as any)?.activeMemberCount ?? null;

        const address = String((p as any)?.address || (p as any)?.location || "").trim() || "—";
        const president =
          String((p as any)?.presidentName || (p as any)?.ownerName || "").trim() || "—";

        const email = String((p as any)?.email || "").trim() || "—";
        const phone = String((p as any)?.phoneNumber || "").trim() || "—";

        const next: ClubHomeVM = {
          ...club,
          name: fullName || club.name,
          tagline: buildTaglineFromProfile(p),
          avatarUrl: avatar || club.avatarUrl,
          info: {
            tenClb: fullName || "—",
            thanhLap: established,
            soThanhVien: membersCount != null ? String(membersCount) : "—",
            diaChi: address,
            chuTich: president,
            email,
            hotline: phone,
          },
          quickStats: {
            totalPosts: postsLen,
            activeMembers: activeMembers != null ? toNumberSafe(activeMembers, 0) : 0,
            events: eventsCount != null ? toNumberSafe(eventsCount, 0) : 0,
          },
          rating: {
            score: ratingScore,
            count: toNumberSafe((p as any)?.ratingCount, 0),
          },
          description: desc || "—",
        };

        if (!cancelled) setClub(next);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading]);

  // ✅ avatar source safe (dù remote cũng ok vì dùng <img>)
  const avatarSrc = (club.avatarUrl || "").trim() || "/clubverse_logo_1.png";

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        <section className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8", glass)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              {/* ✅ FIX: dùng <img> để không bị next/image chặn host */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt="Club avatar"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-wide md:text-3xl">
              {club.name}
            </h1>

            <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-white/65 leading-relaxed">
              {club.tagline}
            </p>

            {pageLoading ? (
              <div className="mt-3 text-xs text-white/50">Đang tải thông tin CLB…</div>
            ) : null}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className={cn("rounded-3xl p-5 md:p-6 lg:col-span-2", glass)}>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-white/80" />
              </div>
              <h2 className="text-sm font-semibold">Thông tin cơ bản</h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <InfoLine label="Tên CLB" value={club.info.tenClb} />
                <InfoLine label="Thành lập" value={club.info.thanhLap} />
                <InfoLine label="Số thành viên" value={club.info.soThanhVien} />
                <InfoLine
                  label="Địa chỉ"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/65" />
                      {club.info.diaChi}
                    </span>
                  }
                />
              </div>

              <div className="space-y-3">
                <InfoLine label="Chủ tịch" value={club.info.chuTich} />
                <InfoLine
                  label="Email"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/65" />
                      {club.info.email}
                    </span>
                  }
                />
                <InfoLine
                  label="Hotline"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white/65" />
                      {club.info.hotline}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push("/club/profile/edit")}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
              >
                Cập nhật
              </button>
            </div>
          </section>

          <div className="space-y-5">
            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </div>
                <h2 className="text-sm font-semibold">Thống kê nhanh</h2>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { label: "Tổng bài viết", value: club.quickStats.totalPosts },
                  { label: "Sự kiện", value: club.quickStats.events },
                  { label: "Club members", value: club.quickStats.activeMembers },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/65">{s.label}</span>
                    <span className="font-semibold text-violet-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-white/80" />
                </div>
                <h2 className="text-sm font-semibold">Đánh giá</h2>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <div className="text-3xl font-semibold text-yellow-200">
                  {Number(club.rating.score || 0).toFixed(1)}
                </div>
                <Stars value={club.rating.score || 0} />
                <div className="mt-2 text-xs text-white/55">
                  {club.rating.count
                    ? `Dựa trên ${club.rating.count} đánh giá`
                    : "Chưa có dữ liệu đánh giá"}
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className={cn("mt-6 rounded-3xl p-5 md:p-6", glass)}>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white/80" />
            </div>
            <h2 className="text-sm font-semibold">Giới thiệu về câu lạc bộ</h2>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm text-white/65 leading-relaxed">
            {club.description}
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {club.features.map((f) => {
            const Icon = f.icon;
            return (
              <section key={f.title} className={cn("rounded-3xl p-5 md:p-6", glass)}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white/80" />
                  </div>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="mt-1 text-xs text-white/55">{f.desc}</div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
