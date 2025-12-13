"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProviders/page";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();

  const isAuthed = !!token;

  const navItems = [
    { label: "Trang Chủ", href: "/homepage", match: ["/", "/homepage"] },
    { label: "Khám Phá", href: "/finding", match: ["/finding"] },
    { label: "Sự Kiện", href: "/su-kien", match: ["/su-kien"] },
    { label: "Câu Lạc Bộ", href: "/clb", match: ["/clb"] },
    { label: "Diễn Đàn", href: "/dien-dan", match: ["/dien-dan"] },
  ];

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
    <header className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 shadow-none border-0 outline-none">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between bg-transparent border-0">
          {/* Left: brand */}
          <Link href={isAuthed ? "/homepage" : "/"} className="flex items-center gap-3 group">
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

          {/* Center nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((it) => {
              const active = isActive(it.match);
              return (
                <Link key={it.href} href={it.href} className={navLinkClass(active)}>
                  {it.label}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          {!isAuthed ? (
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
          ) : (
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
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10 transition"
                title="Hồ sơ"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      user?.avatarUrl ||
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
                onClick={() => {
                  logout?.();
                  router.replace("/");
                }}
                className="rounded-full p-2 hover:bg-white/10 transition"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5 text-white/85" />
              </button>
            </div>
          )}
        </div>

        {/* Search mobile */}
        {isAuthed && (
          <div className="md:hidden pb-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
              <Search className="h-4 w-4 text-white/70" />
              <input
                placeholder="Tìm kiếm..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
