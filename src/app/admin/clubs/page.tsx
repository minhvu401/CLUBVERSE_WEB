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
  UserCheck,
  X,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminClubs, useDeactivateUser, useReactivateUser } from "@/hooks/useAdmin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function ClubManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewingClub, setViewingClub] = useState<any>(null);

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
                   <button 
                    onClick={() => setViewingClub(club)}
                    className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                   >
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

      <ClubDetailModal 
        club={viewingClub} 
        onClose={() => setViewingClub(null)} 
      />
    </div>
  );
}

function ClubDetailModal({ club, onClose }: { club: any, onClose: () => void }) {
  if (!club) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      club ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative h-full flex flex-col max-h-[90vh]">
          <div className="p-8 pb-4 flex justify-between items-start border-b border-white/5">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-3xl font-black text-purple-400 shadow-inner overflow-hidden">
                {club.avatar ? (
                  <img src={club.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" />
                )}
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{club.fullName}</h3>
                  {club.isVerified && <ShieldCheck className="w-5 h-5 text-purple-400" />}
                </div>
                <div className="flex flex-wrap gap-3">
                  <p className="text-white/40 font-medium text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {club.email}
                  </p>
                  <p className="text-white/40 font-medium text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-500" />
                    {club.category || "Chưa phân loại"}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/[0.08] transition-all">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 group-hover:text-amber-400 transition-colors">Đánh giá</p>
                <div className="flex items-center justify-center gap-1.5 text-xl font-black text-white">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {club.rating?.toFixed(1) || "5.0"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/[0.08] transition-all">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Thành viên</p>
                <div className="flex items-center justify-center gap-1.5 text-xl font-black text-white">
                  <Users className="w-4 h-4 text-blue-400" />
                  {club.clubJoined?.length || 0}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/[0.08] transition-all">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Bài viết</p>
                <div className="flex items-center justify-center gap-1.5 text-xl font-black text-white">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  {club.posts?.length || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Thông tin cơ bản</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <Building2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase">Trường học</p>
                        <p className="text-sm text-white/80 font-medium">{club.school || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <Phone className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase">Số điện thoại</p>
                        <p className="text-sm text-white/80 font-medium">{club.phoneNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Giới thiệu</h4>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60 font-medium leading-relaxed italic">
                      "{club.description || "Câu lạc bộ này chưa cập nhật mô tả chi tiết."}"
                  </div>
                </section>
                
                <section>
                  <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Hệ thống</h4>
                  <div className="flex gap-3">
                    <div className={cn(
                      "flex-1 px-4 py-3 rounded-2xl border text-center transition-all",
                      club.isActive ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-500"
                    )}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5">Hoạt động</p>
                      <p className="text-xs font-bold">{club.isActive ? "ACTIVE" : "INACTIVE"}</p>
                    </div>
                    <div className={cn(
                      "flex-1 px-4 py-3 rounded-2xl border text-center transition-all",
                      club.isVerified ? "bg-purple-500/5 border-purple-500/20 text-purple-400" : "bg-white/5 border-white/10 text-white/20"
                    )}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5">Xác thực</p>
                      <p className="text-xs font-bold">{club.isVerified ? "VERIFIED" : "NO"}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4 flex items-center justify-between">
                  Bài viết gần đây
                  <span className="text-[9px] lowercase font-medium tracking-normal text-white/40">({club.posts?.length || 0})</span>
                </h4>
                <div className="space-y-3">
                  {club.posts?.length > 0 ? (
                    club.posts.map((post: any) => (
                      <div key={post._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group/post hover:bg-white/[0.08] hover:border-purple-500/30 transition-all cursor-default relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/0 group-hover/post:bg-purple-500 transition-all" />
                        <h5 className="text-sm font-bold text-white/80 group-hover/post:text-purple-400 transition-colors mb-2 line-clamp-2 leading-snug">
                          {post.title}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center rounded-[2rem] border border-white/5 border-dashed text-white/20">
                      <Info className="w-8 h-8 mb-3 opacity-30 text-purple-500/30" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chưa có bài viết</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
             <span>Gia nhập: {new Date(club.createdAt).toLocaleDateString("vi-VN")}</span>
             <span>Cập nhật: {new Date(club.updatedAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

