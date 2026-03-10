"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 border-0">
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
      "relative text-base font-medium transition-colors", // ⬅️ tăng từ text-sm
      active ? "text-amber-300" : "text-white/75 hover:text-white",
      active &&
        "after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-amber-300/90",
    );

  return (
    <nav className="hidden items-center gap-10 md:flex">
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

function RightGuest() {
  return (
    <div className="flex items-center gap-5">
      <Link
        href="/login"
        className="hidden text-base font-medium text-white/75 hover:text-white transition-colors md:inline-block"
      >
        Đăng nhập
      </Link>

      <Link
        href="/register"
        className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500
                   px-6 py-2.5 text-base font-semibold text-slate-900
                   shadow-lg shadow-cyan-500/40
                   hover:shadow-cyan-500/60 hover:scale-105 active:scale-95 transition-all"
      >
        Tham gia ngay
      </Link>
    </div>
  );
}

export default function GuestHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: "Trang Chủ", href: "/", match: ["/"] },
    { label: "Giới Thiệu", href: "/about", match: ["/about"] },
    { label: "Tính Năng", href: "/features", match: ["/features"] },
    { label: "Bảng Giá", href: "/pricing", match: ["/pricing"] },
  ];

  return (
    <HeaderShell>
      <div className="flex h-20 items-center justify-between">
        <Brand href="/" />
        <NavLinks items={navItems} pathname={pathname} />
        <RightGuest />
      </div>
    </HeaderShell>
  );
}
