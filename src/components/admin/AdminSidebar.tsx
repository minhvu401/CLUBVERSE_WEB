"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Calendar, 
  FileText,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/adminStore";

const navItems = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Đơn đăng ký", href: "/admin/applications", icon: Inbox },
  { name: "Câu lạc bộ", href: "/admin/clubs", icon: BarChart3 },
  { name: "Sự kiện", href: "/admin/events", icon: Calendar },
  { name: "Bài viết", href: "/admin/posts", icon: FileText },
];

import { useAuth } from "@/app/providers/AuthProviders";

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, theme } = useAdminStore();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full transition-all duration-500 z-50",
        theme === "dark" 
          ? "bg-[#020617]/80 backdrop-blur-2xl border-r border-white/5" 
          : "bg-white/80 backdrop-blur-2xl border-r border-[#14b8a6]/10",
        "flex flex-col py-8 px-4",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Glow Effect Top Left */}
      <div className={cn(
        "absolute top-0 left-0 w-32 h-32 blur-[80px] -z-10",
        theme === "dark" ? "bg-purple-600/10" : "bg-teal-500/10"
      )} />

      <div className={cn("mb-10 flex items-center justify-center transition-all duration-500", sidebarOpen ? "px-4" : "px-1")}>
        <img 
          src="/clubverse_logo_1.png" 
          alt="Clubverse Logo" 
          className={cn(
            "object-contain transition-all duration-500",
            sidebarOpen ? "h-16 px-2" : "h-14 w-full",
            theme === "light" && "brightness-0 opacity-90"
          )}
        />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? theme === "dark" 
                    ? "bg-white/5 text-purple-400 font-bold" 
                    : "bg-teal-500/10 text-teal-600 font-bold"
                  : theme === "dark" 
                    ? "text-white/50 hover:text-white hover:bg-white/5" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-teal-500/5"
              )}
            >
              {/* Active Neon Glow */}
              {isActive && (
                <div className={cn(
                  "absolute left-0 top-1/4 h-1/2 w-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]",
                  theme === "dark" ? "bg-purple-500 shadow-purple-500/80" : "bg-teal-500 shadow-teal-500/80"
                )} />
              )}
              
              <item.icon className={cn(
                "w-5 h-5", 
                isActive && (theme === "dark" ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]")
              )} />
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "mt-auto pt-8 border-t space-y-2",
        theme === "dark" ? "border-white/5" : "border-teal-500/10"
      )}>
        
        <button 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            theme === "dark" 
              ? "text-white/50 hover:text-red-400 hover:bg-red-500/5" 
              : "text-zinc-500 hover:text-red-600 hover:bg-red-500/5"
          )}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>  
  );
}
