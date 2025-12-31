"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { ProfileResponse } from "../services/api/auth";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type AdminAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  badge?: string;
};

const actions: AdminAction[] = [
  {
    title: "Đơn ứng tuyển",
    description: "Theo dõi, lên lịch và phản hồi cho từng ứng viên.",
    href: "/admin/applications",
    icon: FileText,
    accent: "from-rose-500/40 to-orange-500/40",
    badge: "Ưu tiên",
  },
  {
    title: "Quản lý câu lạc bộ",
    description: "Kích hoạt, khóa hoặc xác thực thông tin CLB.",
    href: "/admin/clubs",
    icon: Building2,
    accent: "from-indigo-500/40 to-cyan-500/40",
  },
  {
    title: "Diễn đàn & cộng đồng",
    description: "Giám sát các cuộc thảo luận và báo cáo vi phạm.",
    href: "/club/forum",
    icon: Users2,
    accent: "from-emerald-500/40 to-lime-500/40",
  },
  {
    title: "Bảng điều phối",
    description: "Tổng quan nhanh trạng thái hoạt động của hệ thống.",
    href: "/club/dashboard",
    icon: Activity,
    accent: "from-violet-500/40 to-fuchsia-500/40",
  },
];

const checklist = [
  {
    title: "Đảm bảo quyền truy cập",
    detail:
      "Xác minh rằng mỗi quản trị viên được gán CLB cụ thể để thao tác dữ liệu.",
  },
  {
    title: "Thông báo kịp thời",
    detail: "Kích hoạt email hoặc SMS khi đơn cần quyết định cuối cùng.",
  },
  {
    title: "Luồng phê duyệt 2 bước",
    detail: "Kiểm tra log trước khi chấp nhận hoặc từ chối thành viên mới.",
  },
];

function ActionCard({ action }: { action: AdminAction }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5 text-white",
        "transition hover:scale-[1.01] hover:border-white/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
          <ShieldCheck className="h-4 w-4 text-white/60" />
          Admin Toolkit
        </div>
        {action.badge ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] text-white/80">
            {action.badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div
          className={cn(
            "rounded-2xl p-3 text-white",
            "bg-gradient-to-br",
            action.accent
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{action.title}</h3>
          <p className="mt-1 text-sm text-white/70">{action.description}</p>
        </div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
        Đi tới trang
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function AdminLandingPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as {
    user: ProfileResponse;
    token: string;
    loading: boolean;
  };

  const isAdmin = useMemo(
    () => String(user?.role || "").toLowerCase() === "admin",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [loading, token, isAdmin, router]);

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <BackgroundGlow />
        <Header />
        <main className="mx-auto max-w-5xl px-4 pt-16">
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Đang tải trung tâm quản trị...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!token || !isAdmin) {
    return null;
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <BackgroundGlow />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <section className={cn("rounded-[32px] p-8", glass)}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/70">
                Xin chào, {user?.fullName || "Admin"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-white">
                Trung tâm điều phối Clubverse
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Tổng hợp nhanh các khu vực quan trọng để bạn giám sát hoạt động
                hệ thống, duy trì trải nghiệm minh bạch cho các câu lạc bộ và
                ứng viên.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-white/60" />
                {new Date().toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/60" />
                Quyền: Toàn hệ thống
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatPill
              label="CLB đang hoạt động"
              value={(user as any)?.activeClubs ?? "—"}
            />
            <StatPill
              label="Đơn chờ duyệt"
              value={(user as any)?.pendingApplications ?? "—"}
            />
            <StatPill label="Báo cáo mới" value={(user as any)?.reports ?? 0} />
            <StatPill
              label="Lần đăng nhập"
              value={(user as any)?.lastLogin || "Hôm nay"}
            />
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {actions.map((action) => (
            <ActionCard key={action.href} action={action} />
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  Hướng dẫn tác vụ tuần này
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Checklist nhanh
                </h2>
              </div>
              <Users2 className="h-6 w-6 text-white/60" />
            </div>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-white/10 p-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-white/65">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Báo cáo trạng thái</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Tín hiệu hệ thống
                </h2>
              </div>
              <Activity className="h-6 w-6 text-white/60" />
            </div>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                Nền tảng đang ổn định. Không có cảnh báo hiệu năng hoặc dịch vụ
                thất bại trong 24h qua.
              </p>
              <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                02 câu lạc bộ đang chờ xác thực giấy tờ. Ưu tiên xử lý trong hôm
                nay để không làm trì hoãn đợt tuyển thành viên của họ.
              </p>
              <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                Có 01 báo cáo nội dung cần xem lại tại khu vực diễn đàn. Kiểm
                tra mục Diễn đàn & cộng đồng để phản hồi.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="text-xs uppercase tracking-wide text-white/60">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white/90">{value}</div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
    </>
  );
}
