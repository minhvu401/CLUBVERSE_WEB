"use client";

import React, { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminStore } from "@/store/adminStore";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/AuthProviders";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAdminStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 font-['Inter'] antialiased overflow-x-hidden">
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Main purple glow */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px]" />
        {/* Sub blue glow */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px]" />
        {/* Horizontal subtle gradient line */}
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Navigation */}
      <AdminSidebar />
      <AdminHeader />

      {/* Main Content Area */}
      <main
        className={cn(
          "transition-all duration-500 pt-16 min-h-screen flex flex-col",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>

        {/* Global Footer (Subtle) */}
        <footer className="p-8 border-t border-white/5 text-center text-white/20 text-xs">
          © 2024 CLUBVERSE SYSTEM • OBSIDIAN ACADEMY DESIGN
        </footer>
      </main>
    </div>
  );
}
