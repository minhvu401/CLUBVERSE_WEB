"use client";

import React from "react";
import { Search, Bell, Mail, Menu } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { cn } from "@/lib/utils";

import { useAuth } from "@/app/providers/AuthProviders";

export function AdminHeader() {
  const { toggleSidebar, sidebarOpen } = useAdminStore();
  const { user } = useAuth();

  const initials = user?.fullName 
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-16 transition-all duration-500 z-40",
        "bg-[#030303]/40 backdrop-blur-md border-b border-white/5",
        sidebarOpen ? "w-[calc(100%-16rem)]" : "w-[calc(100%-5rem)]"
      )}
    >
      <div className="h-full flex justify-between items-center px-8">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative w-full max-w-md group border-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên, CLB hoặc ID..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl text-sm text-white border-none focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </button>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <Mail className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.fullName || "Administrator"}</p>
              <p className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">
                {user?.role || "System Admin"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-500/20 border border-white/10 p-0.5 overflow-hidden">
               <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-white"> {initials} </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
