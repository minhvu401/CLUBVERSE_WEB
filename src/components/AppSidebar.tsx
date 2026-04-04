"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  Home,
  Users,
  CalendarDays,
  User,
  MessageSquare,
  Inbox,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  key: string;
};

const NAV_ITEMS: SidebarItem[] = [
  { key: "home", icon: <Home size={16} />, label: "Trang chủ", href: "/homepage" },
  { key: "clubs", icon: <Users size={16} />, label: "Câu lạc bộ", href: "/my-clubs" },
  {
    key: "events",
    icon: <CalendarDays size={16} />,
    label: "Sự kiện",
    href: "/my-events",
  },
  {
    key: "messages",
    icon: <MessageSquare size={16} />,
    label: "Tin nhắn",
    href: "/my-messages",
  },
  {
    key: "profile",
    icon: <User size={16} />,
    label: "Hồ sơ của tôi",
    href: "/profile",
  },
  {
    key: "payments",
    icon: <CreditCard size={16} />,
    label: "Lịch sử thanh toán",
    href: "/my-payment",
  },
  {
    key: "requests",
    icon: <Inbox size={16} />,
    label: "Đơn đã gửi",
    href: "/requests",
  },
];

export default function AppSidebar({
  activeKey,
}: {
  activeKey: string;
}) {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authToken");
      }

      updateUser?.({
        fullName: "",
        email: "",
        avatarUrl: "",
        phoneNumber: "",
        school: "",
        major: "",
        year: undefined,
      });

      router.replace("/");
    } catch {
      router.replace("/");
    }
  };

  return (
    <aside className={cn("hidden w-72 shrink-0 rounded-3xl p-4 md:block", glass)}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-[250px] overflow-hidden">
          <Image
            src="/clubverse_logo_1.png"
            alt="Clubverse"
            fill
            priority
            className="object-contain object-left"
          />
        </div>
      </div>

      {/* User card */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/6">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs font-semibold">
              {initials(user?.fullName || "User")}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {user?.fullName || "—"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-[0.68rem] text-emerald-300/80">● Sinh viên</p>
            {user?.isPremium && (
              <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-violet-200 border border-violet-500/20">
                Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 space-y-1.5 text-[0.78rem]">
        {NAV_ITEMS.map((it) => {
          const active = it.key === activeKey;
          
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                active
                  ? "bg-linear-to-r from-emerald-500/80 to-sky-500/60 text-slate-950 font-semibold"
                  : "text-white/70 hover:bg-white/6 hover:text-white"
              )}
            >
              <span className={cn("opacity-90", active && "text-slate-950")}>
                {it.icon}
              </span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-6 border-t border-white/10 pt-4 space-y-2">

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[0.78rem] text-white/70 hover:bg-white/6 hover:text-white transition"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
