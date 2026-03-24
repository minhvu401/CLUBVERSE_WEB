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
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStats } from "@/hooks/useAdmin";

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
  const { data: stats, isLoading } = useAdminStats();

  // Mock data for fallback/demo
  const displayStats = {
    activeClubs: stats?.activeClubs ?? 24,
    pendingApps: stats?.pendingApps ?? 12,
    newReports: stats?.newReports ?? 3,
    totalMembers: stats?.totalMembers ?? "1.2k"
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tight mb-2 uppercase">Admin Console</h2>
          <p className="text-white/50 text-lg max-w-xl font-medium">
            Giám sát trung tâm hệ thống. Theo dõi chỉ số, quản lý đơn đăng ký và bảo trì trải nghiệm người dùng.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
            Xuất báo cáo
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all">
            Hành động nhanh
          </button>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="CLB hoạt động" 
          value={displayStats.activeClubs} 
          change="+12% tháng này" 
          icon={Building2} 
          variant="primary"
        />
        <StatCard 
          label="Đơn chờ duyệt" 
          value={displayStats.pendingApps} 
          change="Ưu tiên" 
          icon={FileCheck} 
        />
        <StatCard 
          label="Báo cáo mới" 
          value={displayStats.newReports} 
          icon={AlertCircle} 
          variant="secondary"
        />
        <StatCard 
          label="Thành viên" 
          value={displayStats.totalMembers} 
          change="+400" 
          icon={Users} 
        />
      </section>

      {/* Main Grid: Checklist & Status */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Task Checklist */}
        <div className="lg:col-span-3 rounded-[2.5rem] bg-white/5 border border-white/5 p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black tracking-tight uppercase">Danh sách công việc</h3>
            <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 uppercase tracking-widest">
              Xem tất cả
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4">
            <TaskItem title="Duyệt đơn đăng ký CLB Nhiếp Ảnh" status="Chờ xử lý" time="2h trước" />
            <TaskItem title="Kiểm tra báo cáo vi phạm bài viết #9920" status="Cần xem xét" time="5h trước" />
            <TaskItem title="Cập nhật quyền cho Admin mới" status="Hoàn thành" time="1 ngày trước" />
            <TaskItem title="Xác minh giấy tờ CLB Robot" status="Đang thực hiện" time="2 ngày trước" />
          </div>

          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
        </div>

        {/* System Status Feed */}
        <div className="lg:col-span-2 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-8">
          <h3 className="text-2xl font-black tracking-tight uppercase mb-8">Trạng thái hệ thống</h3>
          
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">Server ổn định</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Hệ thống đang hoạt động với hiệu suất 99.9%. Không có lỗi nghiêm trọng nào được ghi nhận.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest">Cảnh báo bảo trì</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Dự kiến bảo trì hệ thống vào 2:00 AM Chủ Nhật để nâng cấp cơ sở dữ liệu.
              </p>
            </div>

            <div className="pt-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">DB Load</span>
                  <span className="text-[10px] font-bold text-white/70">12%</span>
               </div>
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[12%] bg-purple-500 rounded-full" />
               </div>
            </div>
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
