"use client";

import React from "react";
import { Search, Bell, Mail, Menu, Sun, Moon } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { cn } from "@/lib/utils";

import { useAuth } from "@/app/providers/AuthProviders";

export function AdminHeader() {
  const { toggleSidebar, sidebarOpen, theme, toggleTheme } = useAdminStore();
  const { user } = useAuth();

  const initials = user?.fullName 
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-16 transition-all duration-500 z-40",
        theme === "dark" 
          ? "bg-[#020617]/40 backdrop-blur-md border-b border-white/5" 
          : "bg-white/40 backdrop-blur-md border-b border-[#14b8a6]/20",
        sidebarOpen ? "w-[calc(100%-16rem)]" : "w-[calc(100%-5rem)]"
      )}
    >
      <div className="h-full flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-lg transition-all",
              theme === "dark" 
                ? "text-white/60 hover:text-white hover:bg-white/5" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center justify-center",
              theme === "dark"
                ? "text-white/60 hover:text-white hover:bg-white/5"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            )}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Night Mode"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className={cn(
            "flex items-center gap-3 pl-6 border-l",
            theme === "dark" ? "border-white/10" : "border-zinc-200"
          )}>
            <div className="text-right hidden sm:block">
              <p className={cn(
                "text-xs font-bold",
                theme === "dark" ? "text-white" : "text-zinc-900"
              )}>{user?.fullName || "Administrator"}</p>
              <p className={cn(
                "text-[10px] font-medium uppercase tracking-wider",
                theme === "dark" ? "text-purple-400" : "text-teal-600"
              )}>
                {user?.role || "System Admin"}
              </p>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl border p-0.5 overflow-hidden",
              theme === "dark" 
                ? "bg-gradient-to-br from-purple-600/20 to-blue-500/20 border-white/10" 
                : "bg-gradient-to-br from-teal-600/20 to-blue-500/20 border-teal-200"
            )}>
               <div className={cn(
                 "w-full h-full rounded-lg flex items-center justify-center text-xs font-bold",
                 theme === "dark" ? "bg-slate-800 text-white" : "bg-white text-zinc-900"
               )}> {initials} </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
