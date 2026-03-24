"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Users, 
  MapPin, 
  Star, 
  MoreVertical, 
  Settings, 
  ExternalLink,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserMinus,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminClubs, useDeactivateUser, useReactivateUser } from "@/hooks/useAdmin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function ClubManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: clubs, isLoading } = useAdminClubs();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();

  const filteredClubs = (clubs || []).filter((club: any) => 
    club.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    club.category?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: clubs?.length || 0,
    active: clubs?.filter((c: any) => c.isActive).length || 0,
    verified: clubs?.filter((c: any) => c.isVerified).length || 0,
    inactive: clubs?.filter((c: any) => !c.isActive).length || 0,
  };

  const handleAction = (club: any) => {
    setSelectedClub(club);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedClub) return;
    if (selectedClub.isActive) {
      await deactivateMutation.mutateAsync(selectedClub._id);
    } else {
      await reactivateMutation.mutateAsync(selectedClub._id);
    }
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Quản lý câu lạc bộ</h2>
          <p className="text-white/50 text-base font-medium">
            Giám sát danh sách, xác thực hoạt động và điều phối các câu lạc bộ trong toàn hệ thống.
          </p>
        </div>
      </section>

      {/* Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng số CLB", value: stats.total, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Đang hoạt động", value: stats.active, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Đã xác thực", value: stats.verified, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Bị khóa", value: stats.inactive, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-white">{stat.value}</h4>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm câu lạc bộ theo tên hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] rounded-2xl text-sm text-white border border-white/5 focus:border-purple-500/50 outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/70 font-bold text-sm hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Bộ lọc
        </button>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : filteredClubs.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 font-black uppercase tracking-widest text-xl">
             Không tìm thấy câu lạc bộ nào
          </div>
        ) : (
          filteredClubs.map((club: any) => (
            <div key={club._id} className="group relative rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07] transition-all duration-500 p-8 flex flex-col justify-between h-[320px]">
              <div className="absolute top-6 right-8 flex items-center gap-2">
                 {club.isVerified && (
                   <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider">
                      Verified
                   </div>
                 )}
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   club.isActive ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                 )} />
              </div>

              <div>
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center overflow-hidden mb-6 group-hover:scale-110 transition-transform duration-500">
                   {club.avatar ? (
                     <img src={club.avatar} alt={club.fullName} className="w-full h-full object-cover" />
                   ) : (
                     <Building2 className="w-8 h-8 text-purple-400/50" />
                   )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-1 truncate pr-16 uppercase tracking-tight">
                    {club.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    {club.category || "General"}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-0.5">Thành viên</span>
                     <span className="text-lg font-black text-white/80">{club.clubJoined?.length || 0}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-0.5">Đánh giá</span>
                     <div className="flex items-center gap-1.5 font-black text-white/80">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {club.rating?.toFixed(1) || "5.0"}
                     </div>
                  </div>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                      Chi tiết
                   </button>
                   <button 
                    onClick={() => handleAction(club)}
                    className={cn(
                      "p-3 rounded-2xl border border-white/5 transition-all group/btn",
                      club.isActive ? "bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    )}
                   >
                      {club.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                   </button>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-600/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-600/10 transition-colors" />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={selectedClub?.isActive ? "Khóa câu lạc bộ" : "Mở khóa câu lạc bộ"}
        description={selectedClub?.isActive 
          ? `Bạn có chắc chắn muốn vô hiệu hóa ${selectedClub.fullName}? Các hoạt động của CLB sẽ bị tạm dừng.` 
          : `Kích hoạt lại ${selectedClub?.fullName}? CLB sẽ có thể tiếp tục hoạt động.`
        }
        confirmText={selectedClub?.isActive ? "Đồng ý khóa" : "Kích hoạt"}
        variant={selectedClub?.isActive ? "danger" : "success"}
        isLoading={deactivateMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}

