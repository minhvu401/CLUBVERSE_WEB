/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProviders/page";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Role = "user" | "club" | "admin" | "guest";

function normalizeRole(role: unknown): Role {
  const r = String(role || "")
    .trim()
    .toLowerCase();
  if (r === "user" || r === "club" || r === "admin") return r;
  return "guest";
}

function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 shadow-none border-0 outline-none">
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </header>
  );
}

function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 group">
      <div className="relative h-14 w-[250px] overflow-hidden">
        <Image
          src="/clubverse_logo_1.png"
          alt="Clubverse"
          fill
          priority
          className="object-contain object-left"
        />
      </div>
    </Link>
  );
}

function NavLinks({
  items,
  pathname,
}: {
  items: { label: string; href: string; match: string[] }[];
  pathname: string;
}) {
  const isActive = (match: string[]) =>
    match.some((m) => pathname === m || pathname.startsWith(m + "/"));

  const navLinkClass = (active: boolean) =>
    cn(
      "relative text-sm font-medium transition-colors",
      active ? "text-amber-300" : "text-white/70 hover:text-white",
      active &&
        "after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-amber-300/90"
    );

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {items.map((it) => {
        const active = isActive(it.match);
        return (
          <Link key={it.href} href={it.href} className={navLinkClass(active)}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RightAuthed({
  avatarUrl,
  onProfile,
  onLogout,
}: {
  avatarUrl?: string;
  onProfile: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Search (desktop) */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
        <Search className="h-4 w-4 text-white/70" />
        <input
          placeholder="Tìm kiếm..."
          className="w-[280px] bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />
      </div>

      {/* Bell */}
      <button
        type="button"
        className="relative rounded-full p-2 hover:bg-white/10 transition"
        title="Thông báo"
      >
        <Bell className="h-5 w-5 text-white/85" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
      </button>

      {/* Avatar */}
      <button
        type="button"
        onClick={onProfile}
        className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10 transition"
        title="Hồ sơ"
      >
        <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              avatarUrl ||
              "https://api.dicebear.com/7.x/identicon/svg?seed=clubverse"
            }
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full p-2 hover:bg-white/10 transition"
        title="Đăng xuất"
      >
        <LogOut className="h-5 w-5 text-white/85" />
      </button>
    </div>
  );
}

function RightGuest() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="hidden text-sm font-medium text-white/70 hover:text-white transition-colors md:inline-block"
      >
        Đăng nhập
      </Link>

      <Link
        href="/register"
        className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-bold text-slate-900
                 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 active:scale-95 transition-all"
      >
        Tham gia ngay
      </Link>
    </div>
  );
}

function MobileSearch({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="md:hidden pb-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
        <Search className="h-4 w-4 text-white/70" />
        <input
          placeholder="Tìm kiếm..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
        />
      </div>
    </div>
  );
}

/** ====== USER HEADER (giữ như bạn đang có) ====== */
function UserHeader({ pathname, isAuthed, user, onLogout, router }: any) {
  const navItems = [
    { label: "Trang Chủ", href: "/homepage", match: ["/", "/homepage"] },
    { label: "Khám Phá", href: "/finding", match: ["/finding"] },
    { label: "Sự Kiện", href: "/su-kien", match: ["/su-kien"] },
    { label: "Câu Lạc Bộ", href: "/clb", match: ["/clb"] },
    { label: "Diễn Đàn", href: "/dien-dan", match: ["/dien-dan"] },
  ];

  return (
    <HeaderShell>
      <div className="flex h-20 items-center justify-between bg-transparent border-0">
        <Brand href={isAuthed ? "/homepage" : "/"} />
        <NavLinks items={navItems} pathname={pathname} />

        {!isAuthed ? (
          <RightGuest />
        ) : (
          <RightAuthed
            avatarUrl={user?.avatarUrl || user?.avatar}
            onProfile={() => router.push("/profile")}
            onLogout={onLogout}
          />
        )}
      </div>

      <MobileSearch show={!!isAuthed} />
    </HeaderShell>
  );
}

/** ====== CLUB HEADER (đổi về /homeclub) ====== */
function ClubHeader({ pathname, isAuthed, user, onLogout, router }: any) {
  const navItems = [
    { label: "Trang CLB", href: "/club/home", match: ["/club/home"] },
    { label: "Diễn đàn", href: "/club/forum", match: ["/club/forum"] },
    { label: "Sự kiện", href: "/club/events", match: ["/club/events"] },
    {
      label: "Đơn đăng ký",
      href: "/club/applications",
      match: ["/club/applications"],
    },
    { label: "Dashboard", href: "/club/dashboard", match: ["/club/dashboard"] },
  ];

  return (
    <HeaderShell>
      <div className="flex h-20 items-center justify-between bg-transparent border-0">
        <Brand href={isAuthed ? "/club/home" : "/club/home"} />
        <NavLinks items={navItems} pathname={pathname} />

        {!isAuthed ? (
          <RightGuest />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/club/profile/edit"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 hover:bg-white/14 transition"
              title="Chỉnh sửa hồ sơ CLB"
            >
              <Settings className="h-4 w-4" />
              <span>Quản lý</span>
            </Link>

            <RightAuthed
              avatarUrl={user?.avatarUrl || user?.avatar}
              onProfile={() => router.push("/club/profile")}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>

      <MobileSearch show={!!isAuthed} />
    </HeaderShell>
  );
}

/** ====== ADMIN HEADER ====== */
function AdminHeader({ pathname, isAuthed, user, onLogout, router }: any) {
  const navItems = [
    { label: "Dashboard", href: "/admin", match: ["/admin"] },
    { label: "Users", href: "/admin/users", match: ["/admin/users"] },
    { label: "CLB", href: "/admin/clubs", match: ["/admin/clubs"] },
    { label: "Cài đặt", href: "/admin/settings", match: ["/admin/settings"] },
  ];

  return (
    <HeaderShell>
      <div className="flex h-20 items-center justify-between bg-transparent border-0">
        <Brand href={isAuthed ? "/admin" : "/"} />
        <NavLinks items={navItems} pathname={pathname} />

        {!isAuthed ? (
          <RightGuest />
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </div>

            <RightAuthed
              avatarUrl={user?.avatarUrl || user?.avatar}
              onProfile={() => router.push("/admin/profile")}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>

      <MobileSearch show={!!isAuthed} />
    </HeaderShell>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuth() as any;

  const isAuthed = !!token;
  const role = normalizeRole(user?.role);

  const onLogout = () => {
    logout?.();
    router.replace("/");
  };

  // guest
  if (!isAuthed || role === "guest") {
    return (
      <UserHeader
        pathname={pathname}
        isAuthed={false}
        user={user}
        onLogout={onLogout}
        router={router}
      />
    );
  }

  // role based
  if (role === "club") {
    return (
      <ClubHeader
        pathname={pathname}
        isAuthed={true}
        user={user}
        onLogout={onLogout}
        router={router}
      />
    );
  }

  if (role === "admin") {
    return (
      <AdminHeader
        pathname={pathname}
        isAuthed={true}
        user={user}
        onLogout={onLogout}
        router={router}
      />
    );
  }

  return (
    <UserHeader
      pathname={pathname}
      isAuthed={true}
      user={user}
      onLogout={onLogout}
      router={router}
    />
  );
}
