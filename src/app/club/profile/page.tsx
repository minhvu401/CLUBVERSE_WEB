"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders";
import { getCurrentProfile } from "@/app/services/api/users";
import { getClubPosts, type PostItem } from "@/app/services/api/post";
import type { ProfileResponse } from "@/app/services/api/auth";

import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";

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

// ✅ glass đồng bộ homepage user
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

export default function HomeClubPage() {
  const router = useRouter();

  // ✅ CHỈ SỬA PHẦN NÀY: lấy loading/token để tránh redirect sớm khi refresh
  const { user, token, loading } = useAuth() as any;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [clubPosts, setClubPosts] = useState<PostItem[]>([]);
  const [fetchingClub, setFetchingClub] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    // ✅ quan trọng: đợi AuthProvider load xong mới check
    if (loading) return;

    // chưa đăng nhập -> về trang login (hoặc "/" nếu bạn muốn)
    if (!token) {
      router.replace("/login"); // bạn muốn về "/" thì đổi chỗ này
      return;
    }

    // có token nhưng không phải club -> đá về home
    if (!isClubRole) {
      router.replace("/");
    }
  }, [loading, token, isClubRole, router]);

  useEffect(() => {
    if (loading || !token) return;

    let cancelled = false;

    const fetchClubData = async () => {
      try {
        setFetchingClub(true);
        setFetchErr(null);
        const profileData = await getCurrentProfile(token);
        if (cancelled) return;
        setProfile(profileData);

        const clubId = profileData?._id || user?._id;
        if (clubId) {
          const posts = await getClubPosts(token, clubId, {
            sortBy: "newest",
            limit: 8,
          });
          if (!cancelled) setClubPosts(posts);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchErr(
            error instanceof Error
              ? error.message
              : "Không tải được dữ liệu câu lạc bộ"
          );
        }
      } finally {
        if (!cancelled) setFetchingClub(false);
      }
    };

    void fetchClubData();

    return () => {
      cancelled = true;
    };
  }, [loading, token, user?._id]);

  const club = useMemo(() => {
    const memberCount = profile?.clubJoined?.length ?? 0;
    const postsCount = clubPosts.length;
    const ratingScore =
      typeof profile?.rating === "number" ? profile.rating : 0;
    const createdDate = profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
      : "Chưa cập nhật";
    const fallbackDesc =
      "Câu lạc bộ của bạn hiện chưa có mô tả chi tiết. Cập nhật thông tin để thành viên hiểu hơn về sứ mệnh và hoạt động của CLB.";
    const categoryLabel = profile?.category ?? "Công nghệ";

    const buildAvatarUrl = (raw?: string) => {
      if (!raw)
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          profile?.fullName || "club"
        )}`;
      if (raw.startsWith("http")) return raw;
      return `https://clubverse.onrender.com${raw}`;
    };

    return {
      name: profile?.fullName ?? user?.fullName ?? "Câu lạc bộ Clubverse",
      tagline:
        profile?.description?.split("\n")[0] ??
        "Chia sẻ hành trình, lan tỏa đam mê và kết nối cộng đồng sinh viên.",
      avatarUrl: buildAvatarUrl(profile?.avatarUrl),
      info: {
        tenClb: profile?.fullName ?? "Chưa cập nhật",
        thanhLap: createdDate,
        soThanhVien: memberCount.toLocaleString("vi-VN"),
        diaChi: profile?.school ?? "Chưa có thông tin",
        chuTich: user?.fullName ?? "Chưa cập nhật",
        email: profile?.email ?? user?.email ?? "Chưa có email",
        hotline: profile?.phoneNumber ?? "Chưa có số liên hệ",
      },
      quickStats: {
        totalPosts: postsCount,
        activeMembers: memberCount,
        events: clubPosts.length,
      },
      rating: {
        score: Number.isFinite(ratingScore) ? ratingScore : 0,
        count: memberCount,
      },
      description: profile?.description ?? fallbackDesc,
      features: [
        {
          title: `Workshop ${categoryLabel}`,
          desc: `Các buổi workshop chuyên sâu xoay quanh chủ đề ${categoryLabel.toLowerCase()}.`,
          icon: GraduationCap,
        },
        {
          title: "Dự án cộng đồng",
          desc: "Thực hiện dự án thật với mentor hướng dẫn và demo định kỳ.",
          icon: Rocket,
        },
        {
          title: "Networking",
          desc: "Kết nối doanh nghiệp, diễn giả và các CLB khác trên Clubverse.",
          icon: Network,
        },
      ],
    };
  }, [profile, clubPosts, user?.email, user?.fullName]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BACKGROUND giống homepage user */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {fetchErr ? (
          <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {fetchErr}
          </div>
        ) : null}

        {/* HERO */}
        <section
          className={cn(
            "relative overflow-hidden rounded-3xl p-6 md:p-8",
            glass
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
          <div className="relative flex flex-col items-center text-center">
            {/* ✅ GIỮ Y NGUYÊN NHƯ BAN ĐẦU */}
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={club.avatarUrl}
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
            {fetchingClub ? (
              <div className="mt-3 text-xs text-white/60">
                Đang đồng bộ dữ liệu từ máy chủ...
              </div>
            ) : null}
          </div>
        </section>

        {/* Row cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Thông tin cơ bản */}
          <section
            className={cn("rounded-3xl p-5 md:p-6 lg:col-span-2", glass)}
          >
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

          {/* Right column */}
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
                  {
                    label: "Club members",
                    value: club.quickStats.activeMembers,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/65">{s.label}</span>
                    <span className="font-semibold text-violet-200">
                      {s.value}
                    </span>
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
                  {club.rating.score}
                </div>
                <Stars value={club.rating.score} />
                <div className="mt-2 text-xs text-white/55">
                  Dựa trên {club.rating.count} đánh giá
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Giới thiệu */}
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

        {/* 3 cards dưới */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {club.features.map((f) => {
            const Icon = f.icon;
            return (
              <section
                key={f.title}
                className={cn("rounded-3xl p-5 md:p-6", glass)}
              >
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
