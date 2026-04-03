"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users2,
  LayoutDashboard,
} from "lucide-react";
import { ProfileResponse } from "@/app/services/api/auth";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]";

/* ================= config ================= */

const actions = [
  {
    title: "Đơn ứng tuyển",
    desc: "Theo dõi, đánh giá và phản hồi hồ sơ ứng viên.",
    href: "/admin/applications",
    icon: FileText,
    accent: "from-rose-500/40 to-orange-500/40",
    badge: "Ưu tiên",
  },
  {
    title: "Quản lý câu lạc bộ",
    desc: "Xác thực, khóa hoặc kích hoạt CLB.",
    href: "/admin/clubs",
    icon: Building2,
    accent: "from-indigo-500/40 to-cyan-500/40",
  },
  {
    title: "Diễn đàn & cộng đồng",
    desc: "Giám sát nội dung và xử lý báo cáo.",
    href: "/club/forum",
    icon: Users2,
    accent: "from-emerald-500/40 to-lime-500/40",
  },
  {
    title: "Dashboard CLB",
    desc: "Theo dõi dữ liệu hoạt động theo CLB.",
    href: "/club/dashboard",
    icon: LayoutDashboard,
    accent: "from-violet-500/40 to-fuchsia-500/40",
  },
];

const checklist = [
  {
    title: "Kiểm soát quyền truy cập",
    detail: "Admin chỉ thao tác trên CLB được phân quyền.",
  },
  {
    title: "Thông báo kịp thời",
    detail: "Cảnh báo đơn chờ duyệt quá hạn.",
  },
  {
    title: "Phê duyệt hai lớp",
    detail: "Xác nhận log trước khi chấp nhận thành viên.",
  },
];

/* ================= page ================= */

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as {
    user: ProfileResponse;
    token: string;
    loading: boolean;
  };

  const isAdmin = useMemo(
    () => String(user?.role).toLowerCase() === "admin",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isAdmin) return router.replace("/");
  }, [loading, token, isAdmin, router]);

  if (loading || !token || !isAdmin) return null;

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <BackgroundGlow />
      <Header />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-14 space-y-14">
        {/* ================= CONTROL CENTER ================= */}
        <section
          className={cn(
            "relative overflow-hidden rounded-[40px] p-10",
            "bg-gradient-to-br from-white/10 via-white/5 to-white/0",
            glass
          )}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">
                Admin Control Center
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                {user?.fullName || "Administrator"}
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/70 leading-relaxed">
                Trung tâm điều phối hệ thống ClubVerse – giám sát hoạt động,
                đảm bảo minh bạch và an toàn cho cộng đồng.
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/70">
              <InfoRow
                label="Ngày"
                value={new Date().toLocaleDateString("vi-VN")}
              />
              <InfoRow label="Quyền hạn" value="System Administrator" />
            </div>
          </div>

          {/* ================= METRICS ================= */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="CLB hoạt động" value={(user as any)?.activeClubs ?? "—"} />
            <StatCard label="Đơn chờ duyệt" value={(user as any)?.pendingApplications ?? "—"} />
            <StatCard label="Báo cáo mới" value={(user as any)?.reports ?? 0} />
            <StatCard label="Lần đăng nhập" value={(user as any)?.lastLogin || "Hôm nay"} />
          </div>
        </section>

        {/* ================= MODULES ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((a) => (
            <ActionCard key={a.href} {...a} />
          ))}
        </section>

        {/* ================= SYSTEM ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Checklist />
          <SystemSignals />
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ================= components ================= */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <ClipboardList className="h-4 w-4 text-white/40" />
      <span className="text-white/60">{label}:</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40" />
      <p className="relative z-10 text-xs uppercase tracking-widest text-white/50">
        {label}
      </p>
      <p className="relative z-10 mt-4 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ActionCard({ title, desc, href, icon: Icon, accent, badge }: any) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-white/60">
          <ShieldCheck className="h-4 w-4" />
          Admin Module
        </div>
        {badge && (
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-[0.65rem] font-semibold text-rose-200">
            {badge}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-8 flex gap-5">
        <div className={cn("rounded-2xl p-4 bg-gradient-to-br shadow-lg", accent)}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-white/65 leading-relaxed">{desc}</p>
        </div>
      </div>

      <div className="relative z-10 mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
        Truy cập module
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1.5" />
      </div>
    </Link>
  );
}

function Checklist() {
  return (
    <div className={cn("rounded-[32px] p-8", glass)}>
      <h2 className="text-lg font-bold tracking-tight mb-6">
        Checklist vận hành
      </h2>
      <ul className="space-y-4">
        {checklist.map((c) => (
          <li
            key={c.title}
            className="flex gap-4 rounded-2xl border border-white/10 p-5"
          >
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <div>
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-sm text-white/65 mt-1">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SystemSignals() {
  return (
    <div className={cn("rounded-[32px] p-8", glass)}>
      <h2 className="text-lg font-bold tracking-tight mb-6">
        Tín hiệu hệ thống
      </h2>
      <div className="space-y-4 text-sm">
        <Signal color="emerald">
          Hệ thống ổn định, không phát hiện sự cố trong 24h qua.
        </Signal>
        <Signal color="amber">
          Có CLB đang chờ xác thực giấy tờ.
        </Signal>
        <Signal color="rose">
          Có báo cáo nội dung cần kiểm tra.
        </Signal>
      </div>
    </div>
  );
}

function Signal({ children, color }: any) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex gap-3",
        color === "emerald" && "border-emerald-400/20 bg-emerald-400/10",
        color === "amber" && "border-amber-400/20 bg-amber-400/10",
        color === "rose" && "border-rose-400/20 bg-rose-400/10"
      )}
    >
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-current" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />
      <div className="absolute -top-48 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[360px] w-[360px] rounded-full bg-indigo-400/15 blur-[120px]" />
    </>
  );
}
