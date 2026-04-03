"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, 
  Building2, 
  FileCheck, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminUsers, useAdminClubs, useAdminEvents, useAdminPosts } from "@/hooks/useAdmin";

// --- Components ---

const StatCard = ({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  variant = "default" 
}: { 
  label: string; 
  value: string | number; 
  change?: string; 
  icon: any;
  variant?: "default" | "primary" | "secondary";
}) => {
  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] p-8 transition-all duration-500",
      "bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07]",
      variant === "primary" && "bg-purple-600/10 border-purple-500/20",
      variant === "secondary" && "bg-blue-600/10 border-blue-500/20"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          "bg-white/5 text-white/70 group-hover:scale-110 transition-transform duration-500",
          variant === "primary" && "bg-purple-500/20 text-purple-400",
          variant === "secondary" && "bg-blue-500/20 text-blue-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-5xl font-black text-white tracking-tighter">{value}</h3>
      </div>
      
      {/* Visual Glare */}
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 blur-[40px] rounded-full group-hover:bg-white/10 transition-colors" />
    </div>
  );
};

const TaskItem = ({ title, status, time }: { title: string; status: string; time: string }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{title}</h4>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-0.5">{status}</p>
      </div>
    </div>
    <div className="text-[10px] font-bold text-white/30 uppercase tracking-tighter flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {time}
    </div>
  </div>
);

// --- Page ---

export default function AdminDashboard() {
  const { data: userData, isLoading: loadingUsers } = useAdminUsers(1, 1, "", "user");
  const { data: clubs, isLoading: loadingClubs } = useAdminClubs();
  const { data: events, isLoading: loadingEvents } = useAdminEvents();
  const { data: posts, isLoading: loadingPosts } = useAdminPosts();

  const isLoading = loadingUsers || loadingClubs || loadingEvents || loadingPosts;

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tight mb-2 uppercase">Dashboard</h2>
          <p className="text-white/50 text-lg max-w-xl font-medium">
            Chào mừng Admin. Giám sát toàn bộ hoạt động của hệ thống Clubverse từ trung tâm điều hành.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tổng Câu lạc bộ" 
          value={loadingClubs ? "..." : (clubs?.length || 0)} 
          icon={Building2} 
          variant="primary"
        />
        <StatCard 
          label="Tổng Sự kiện" 
          value={loadingEvents ? "..." : (events?.length || 0)} 
          icon={Calendar} 
        />
        <StatCard 
          label="Tổng Bài viết" 
          value={loadingPosts ? "..." : (posts?.length || 0)} 
          icon={Activity} 
          variant="secondary"
        />
        <StatCard 
          label="Tổng Sinh viên" 
          value={loadingUsers ? "..." : (userData?.total || 0)} 
          icon={Users} 
        />
      </section>

      {/* System Overview & Events */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] bg-white/5 border border-white/5 p-10 relative overflow-hidden flex flex-col justify-center min-h-[350px]">
           <div className="relative z-10">
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">Trung tâm điều hành</h3>
              <p className="text-white/40 text-sm font-medium mb-10 max-w-xl leading-relaxed">
                 Hệ thống đang được giám sát chặt chẽ. Toàn bộ thông tin được cập nhật theo thời gian thực từ các module quản trị viên. 
                 Sử dụng thanh điều hướng bên trái để quản lý chi tiết từng hạng mục.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-1">Bảo mật & Ổn định</p>
                       <p className="text-base font-bold text-white/80 group-hover:text-emerald-400 transition-colors">Tường lửa đang kích hoạt</p>
                       <p className="text-[10px] text-emerald-500/40 font-black uppercase mt-1">Status: Secure</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <TrendingUp className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-1">Tính toàn vẹn dữ liệu</p>
                       <p className="text-base font-bold text-white/80 group-hover:text-blue-400 transition-colors">Dữ liệu đã đồng bộ</p>
                       <p className="text-[10px] text-blue-500/40 font-black uppercase mt-1">Last sync: Vừa xong</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
           <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-600/5 blur-[60px] rounded-full pointer-events-none" />
        </div>

        {/* Dynamic Events Feed instead of Quick Audit */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/10 p-8 flex flex-col min-h-[350px]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tighter uppercase text-purple-400">Sự kiện sắp diễn ra</h3>
              <Link href="/admin/events" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all">
                 <ArrowUpRight className="w-4 h-4" />
              </Link>
           </div>

           <div className="space-y-4 flex-1">
              {loadingEvents ? (
                 [1,2,3].map(i => (
                    <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-2xl" />
                 ))
              ) : events && events.length > 0 ? (
                 events.slice(0, 3).map((event: any) => (
                    <div key={event._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group/ev">
                       <div className="flex items-center gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover/ev:bg-purple-500/20 transition-colors">
                             <Calendar className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-bold text-white truncate">{event.title}</p>
                             <p className="text-[9px] text-white/30 uppercase font-black truncate">{event.location}</p>
                          </div>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-2">
                    <Calendar className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Không có sự kiện nào</p>
                 </div>
              )}
           </div>

           <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] text-center">
                 Tự động cập nhật 
              </p>
           </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {["Người dùng", "Câu lạc bộ", "Sự kiện", "Bài viết"].map((item, idx) => (
           <Link 
            key={idx}
            href={`/admin/${["users", "clubs", "events", "posts"][idx]}`}
            className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all duration-500"
           >
             <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-purple-400 transition-colors">{item}</h4>
             <p className="text-xs text-white/40 mb-6">Quản lý toàn bộ danh sách và thông tin {item.toLowerCase()} trong hệ thống.</p>
             <div className="flex justify-between items-end">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-[#030303] bg-slate-800" />
                   ))}
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
             </div>
           </Link>
         ))}
      </section>
    </div>
  );
}
