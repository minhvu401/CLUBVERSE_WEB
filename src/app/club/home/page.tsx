"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders/page";

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

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
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

  // ===== Mock data (bạn map API sau) =====
  const club = {
    name: "Câu lạc bộ Công nghệ Sáng tạo",
    tagline:
      "Nơi kết nối những tài năng đam mê công nghệ và sáng tạo, cùng nhau\nxây dựng tương lai số",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    info: {
      tenClb: "Câu lạc bộ Công nghệ Sáng tạo",
      thanhLap: "15/08/2020",
      soThanhVien: "1200",
      diaChi: "KCN Linh Trung, Việt Nam",
      chuTich: "Nguyễn Văn A",
      email: "contact@clubverse.vn",
      hotline: "0123 456 789",
    },
    quickStats: {
      totalPosts: 42,
      activeMembers: 28,
      events: 15,
    },
    rating: {
      score: 4.8,
      count: 156,
    },
    description:
      "Câu lạc bộ Công nghệ Sáng tạo là nơi dành cho những bạn trẻ yêu thích công nghệ, lập trình và đổi mới sáng tạo. Chúng tôi cam kết tạo ra môi trường học tập – chia sẻ – trải nghiệm thực tế thông qua các workshop, dự án và hoạt động networking.\n\nVới sứ mệnh “Kết nối – Học hỏi – Sáng tạo”, chúng tôi tổ chức các buổi workshop, hackathon, và thảo luận chuyên đề về các xu hướng công nghệ mới.\n\nTham gia cùng chúng tôi để khám phá tiềm năng của bản thân, mở rộng mạng lưới quan hệ và đóng góp những sản phẩm ý nghĩa cho cộng đồng.",
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
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BACKGROUND giống homepage user */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* HERO */}
        <section className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8", glass)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
          <div className="relative flex flex-col items-center text-center">
            {/* ✅ GIỮ Y NGUYÊN NHƯ BAN ĐẦU */}
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
              <Image
                src={club.avatarUrl}
                alt="Club avatar"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-wide md:text-3xl">
              {club.name}
            </h1>

            <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-white/65 leading-relaxed">
              {club.tagline}
            </p>
          </div>
        </section>

        {/* Row cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Thông tin cơ bản */}
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
