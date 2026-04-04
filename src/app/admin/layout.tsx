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
  const { sidebarOpen, theme } = useAdminStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-500",
        theme === "dark" ? "bg-[#020617]" : "bg-white"
      )}>
        <div className={cn(
          "w-12 h-12 border-4 border-t-transparent rounded-full animate-spin",
          theme === "dark" ? "border-purple-500/20 border-t-purple-500" : "border-teal-500/20 border-t-teal-500"
        )} />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 font-['Inter'] antialiased overflow-x-hidden relative",
      theme === "dark" ? "bg-[#020617] text-white selection:bg-purple-500/30" : "bg-white text-zinc-900 selection:bg-teal-500/30"
    )}>
      {/* Dynamic Background Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden transition-all duration-700">
        {theme === "dark" ? (
          <>
            {/* Night Mode: User Login inspired background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.16),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.16),transparent_55%)]" />
            
            {/* Additional glows from layout */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px]" />
            
            <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </>
        ) : (
          <>
            {/* Light Mode: Teal Glow background */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #14b8a6 100%)",
                backgroundSize: "100% 100%",
              }} 
            />
            
            {/* Subtle floating accents for light mode */}
            <div className="absolute top-[5%] right-[5%] w-[30%] h-[30%] bg-teal-400/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[5%] left-[5%] w-[25%] h-[25%] bg-blue-400/5 blur-[100px] rounded-full" />
            
            <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />
          </>
        )}
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
        <footer className={cn(
          "p-8 border-t text-center text-xs transition-colors duration-500",
          theme === "dark" ? "border-white/5 text-white/20" : "border-teal-500/10 text-zinc-400"
        )}>
          © 2026 CLUBVERSE SYSTEM
        </footer>
      </main>
    </div>
  );
}
