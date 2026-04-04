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
  Info,
  UserPlus,
  Fingerprint,
  RefreshCcw,
  GraduationCap,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useAdminClubs, 
  useDeactivateUser, 
  useReactivateUser,
  useAdminRegister,
  useAdminVerifyOtp,
  useAdminResendOtp
} from "@/hooks/useAdmin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import { useAdminStore } from "@/store/adminStore";

export default function ClubManagementPage() {
  const { theme } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewingClub, setViewingClub] = useState<any>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [verifyOtpOpen, setVerifyOtpOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<{ email: string, fullName: string } | null>(null);

  const { data: clubs, isLoading } = useAdminClubs();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();

  const filteredClubs = (clubs || [])
    .filter((club: any) => 
      club.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      club.email?.toLowerCase().includes(search.toLowerCase()) ||
      club.category?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((club: any) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return club.isActive;
      if (statusFilter === "inactive") return !club.isActive;
      return true;
    });

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
          <h2 className={cn("text-4xl font-black tracking-tight mb-2 uppercase", theme === "dark" ? "text-white" : "text-zinc-900")}>Quản lý câu lạc bộ</h2>
          <p className={cn("text-base font-medium", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            Giám sát danh sách, xác thực hoạt động và điều phối các câu lạc bộ trong toàn hệ thống.
          </p>
        </div>
        <button 
          onClick={() => setRegisterOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 h-[42px]"
        >
          <UserPlus className="w-4 h-4" />
          Đăng ký tài khoản
        </button>
      </section>

      {/* Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng số CLB", value: stats.total, icon: Building2, color: theme === "dark" ? "text-blue-400" : "text-blue-600", bg: theme === "dark" ? "bg-blue-500/10" : "bg-blue-50" },
          { label: "Đang hoạt động", value: stats.active, icon: Users, color: theme === "dark" ? "text-emerald-400" : "text-emerald-600", bg: theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-50" },
          { label: "Đã xác thực", value: stats.verified, icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Bị khóa", value: stats.inactive, icon: ShieldAlert, color: theme === "dark" ? "text-red-400" : "text-red-600", bg: theme === "dark" ? "bg-red-500/10" : "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-6 rounded-[2rem] border flex items-center justify-between group transition-all",
            theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-white/80 border-teal-500/10 shadow-sm hover:shadow-md"
          )}>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-white/30" : "text-zinc-400")}>{stat.label}</p>
              <h4 className={cn("text-3xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>{stat.value}</h4>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", stat.bg, stat.color, theme === "dark" ? "border-white/5" : "border-transparent")}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-4">
        <div className="relative group min-w-[300px]">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", theme === "dark" ? "text-white/30 group-focus-within:text-purple-500" : "text-zinc-400 group-focus-within:text-teal-500")} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-11 pr-4 py-3 rounded-2xl text-sm border outline-none transition-all placeholder:text-white/20",
              theme === "dark" 
                ? "bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] text-white border-white/5 focus:border-purple-500/50" 
                : "bg-white text-zinc-900 border-zinc-200 focus:border-teal-500/50 shadow-sm placeholder:text-zinc-400"
            )}
          />
        </div>

        <div className={cn(
          "flex items-center gap-2 p-1 rounded-2xl border",
          theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100/80 border-zinc-200 shadow-inner"
        )}>
          {[
            { id: "all", label: "Tất cả", icon: Users },
            { id: "active", label: "Hoạt động", icon: CheckCircle2 },
            { id: "inactive", label: "Bị khóa", icon: ShieldAlert },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                statusFilter === filter.id 
                  ? (theme === "dark" ? "bg-white/10 text-white shadow-xl" : "bg-white text-teal-600 shadow-md border border-teal-100")
                  : (theme === "dark" ? "text-white/30 hover:text-white/60 hover:bg-white/[0.03]" : "text-zinc-500 hover:text-zinc-900 hover:bg-teal-50")
              )}
            >
              <filter.icon className="w-3 h-3" />
              {filter.label}
            </button>
          ))}
        </div>

        <button className={cn(
          "px-6 py-3 rounded-2xl border font-bold text-sm transition-all flex items-center gap-2 ml-auto",
          theme === "dark" ? "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm"
        )}>
          <Filter className="w-4 h-4" />
          Bộ lọc nâng cao
        </button>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => (
             <div key={i} className={cn("h-64 rounded-[2.5rem] animate-pulse border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")} />
          ))
        ) : filteredClubs.length === 0 ? (
          <div className={cn("col-span-full py-20 text-center font-black uppercase tracking-widest text-xl", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
             Không tìm thấy câu lạc bộ nào
          </div>
        ) : (
          filteredClubs.map((club: any) => (
            <div key={club._id} className={cn(
              "group relative rounded-[2.5rem] border transition-all duration-500 p-8 flex flex-col justify-between h-[320px]",
              theme === "dark" 
                ? "bg-white/5 border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07]" 
                : "bg-white border-transparent hover:border-teal-300 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.1)]"
            )}>
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
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden mb-6 group-hover:scale-110 transition-transform duration-500 border",
                  theme === "dark" ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/10" : "bg-teal-50 border-teal-100"
                )}>
                   {club.avatar ? (
                     <img src={club.avatar} alt={club.fullName} className="w-full h-full object-cover" />
                   ) : (
                     <Building2 className={cn("w-8 h-8", theme === "dark" ? "text-purple-400/50" : "text-teal-600/50")} />
                   )}
                </div>

                <div className="mb-6">
                  <h3 className={cn(
                    "text-xl font-bold transition-colors mb-1 truncate pr-16 uppercase tracking-tight",
                    theme === "dark" ? "text-white group-hover:text-purple-400" : "text-zinc-900 group-hover:text-teal-600"
                  )}>
                    {club.fullName}
                  </h3>
                  <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]", theme === "dark" ? "text-white/30" : "text-zinc-500")}>
                    <MapPin className={cn("w-3 h-3", theme === "dark" ? "text-purple-500" : "text-teal-500")} />
                    {club.category || "General"}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                     <span className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Thành viên</span>
                     <span className={cn("text-lg font-black", theme === "dark" ? "text-white/80" : "text-zinc-900")}>{club.clubJoined?.length || 0}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Đánh giá</span>
                     <div className={cn("flex items-center gap-1.5 font-black", theme === "dark" ? "text-white/80" : "text-zinc-900")}>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {club.rating?.toFixed(1) || "5.0"}
                     </div>
                  </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => setViewingClub(club)}
                    className={cn(
                      "flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      theme === "dark" 
                        ? "bg-white/5 hover:bg-white/10 border-white/5 text-white" 
                        : "bg-teal-50 hover:bg-teal-100 border-teal-100 text-teal-700"
                    )}
                   >
                      Chi tiết
                   </button>
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(club);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border transition-all group/btn",
                      theme === "dark"
                        ? (club.isActive ? "bg-white/5 border-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400" : "bg-emerald-500/10 border-white/5 text-emerald-400")
                        : (club.isActive ? "bg-red-50 hover:bg-red-100 border-transparent text-red-600" : "bg-emerald-50 hover:bg-emerald-100 border-transparent text-emerald-600")
                    )}
                   >
                      {club.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                   </button>
                   {!club.isVerified && (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setUserToVerify({ email: club.email, fullName: club.fullName });
                         setVerifyOtpOpen(true);
                       }}
                       className="p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all flex items-center justify-center shrink-0"
                       title="Xác thực OTP"
                     >
                       <Fingerprint className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>

              {/* Decorative Accent */}
              {theme === "dark" && <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-600/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-600/10 transition-colors" />}
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

      <RegisterUserModal 
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />

      <VerifyOtpModal
        isOpen={verifyOtpOpen}
        onClose={() => setVerifyOtpOpen(false)}
        user={userToVerify}
      />
    </div>
  );
}

function RegisterUserModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { theme } = useAdminStore();
  const registerMutation = useAdminRegister();
  const [role, setRole] = useState<"user" | "club">("club");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    school: "FPT University",
    major: "",
    year: 1,
    category: "Cộng đồng",
    description: ""
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    try {
      await registerMutation.mutateAsync({ ...formData, role });
      onClose();
      setFormData({
        email: "", password: "", fullName: "", phoneNumber: "",
        school: "FPT University", major: "", year: 1,
        category: "Cộng đồng", description: ""
      });
    } catch (err) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-[#030303]/80" : "bg-zinc-900/60")} onClick={onClose} />
      <div className={cn(
        "relative w-full max-w-2xl border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]",
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-teal-500/10"
      )}>
        <div className={cn("p-8 pb-4 flex justify-between items-center border-b", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
          <div>
            <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>Đăng ký tài khoản</h3>
            <p className={cn("text-xs font-medium mt-1", theme === "dark" ? "text-white/40" : "text-zinc-500")}>Khởi tạo tài khoản câu lạc bộ hoặc thành viên mới.</p>
          </div>
          <button onClick={onClose} className={cn(
            "p-2 rounded-xl border transition-all",
            theme === "dark" ? "bg-white/5 border-white/5 text-white/30 hover:text-white" : "bg-zinc-100/50 border-zinc-200 text-zinc-500 hover:text-zinc-900"
          )}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "p-4 rounded-2xl border transition-all text-center group",
                role === "user" 
                  ? (theme === "dark" ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600 shadow-sm") 
                  : (theme === "dark" ? "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-white hover:shadow-sm")
              )}
            >
              <GraduationCap className={cn("w-6 h-6 mx-auto mb-2 transition-transform group-hover:scale-110", role === "user" ? (theme === "dark" ? "text-purple-400" : "text-purple-600") : (theme === "dark" ? "text-white/20" : "text-zinc-400"))} />
              <p className="text-xs font-black uppercase tracking-widest">Sinh viên</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("club")}
              className={cn(
                "p-4 rounded-2xl border transition-all text-center group",
                role === "club" 
                  ? (theme === "dark" ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600 shadow-sm") 
                  : (theme === "dark" ? "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-white hover:shadow-sm")
              )}
            >
              <Briefcase className={cn("w-6 h-6 mx-auto mb-2 transition-transform group-hover:scale-110", role === "club" ? (theme === "dark" ? "text-blue-400" : "text-blue-600") : (theme === "dark" ? "text-white/20" : "text-zinc-400"))} />
              <p className="text-xs font-black uppercase tracking-widest">Câu lạc bộ</p>
            </button>
          </div>

          {/* Basic Info Container */}
          <div className="space-y-4">
            <h4 className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-purple-400/50" : "text-purple-600/70")}>Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Họ và tên</label>
                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50")} />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Số điện thoại</label>
                <input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50")} />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50")} />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Mật khẩu</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50")} />
              </div>
            </div>
          </div>

          {/* Conditional Role-Based Container */}
          <div className="space-y-4">
            <h4 className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-blue-400/50" : "text-blue-600/70")}>
              {role === "user" ? "Thông tin học thuật" : "Thông tin tổ chức"}
            </h4>
            
            {role === "user" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-2 space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Trường học</label>
                  <input
                    required
                    value={formData.school}
                    onChange={e => setFormData({...formData, school: e.target.value})}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 shadow-sm")}
                  />
                </div>
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Chuyên ngành</label>
                  <input
                    required
                    value={formData.major}
                    onChange={e => setFormData({...formData, major: e.target.value})}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 shadow-sm")}
                    placeholder="VD: Kỹ thuật phần mềm"
                  />
                </div>
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Năm học</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all appearance-none cursor-pointer", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 shadow-sm")}
                  >
                    {[1,2,3,4,5].map(y => <option key={y} value={y} className={theme === "dark" ? "bg-[#0a0a0a]" : "bg-white"}>Năm {y}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Lĩnh vực hoạt động</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all appearance-none cursor-pointer", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 shadow-sm")}
                  >
                    {["Công nghệ", "Văn hóa - Nghệ thuật", "Thể thao", "Học thuật", "Cộng đồng"].map(cat => (
                      <option key={cat} value={cat} className={theme === "dark" ? "bg-[#0a0a0a]" : "bg-white"}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Mô tả tóm tắt</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className={cn("w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 shadow-sm")}
                    placeholder="Giới thiệu sơ lược về câu lạc bộ..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Warning */}
          <div className={cn("p-4 rounded-2xl border flex items-start gap-3", theme === "dark" ? "bg-amber-500/5 border-amber-500/10" : "bg-amber-50 border-amber-100")}>
             <ShieldAlert className={cn("w-5 h-5 shrink-0 mt-0.5", theme === "dark" ? "text-amber-500" : "text-amber-600")} />
             <div>
               <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", theme === "dark" ? "text-amber-500" : "text-amber-600")}>Lưu ý bảo mật</p>
               <p className={cn("text-[10px] leading-relaxed font-medium", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                 Tài khoản sau khi khởi tạo sẽ có trạng thái hoạt động ngay lập tức. Admin chịu trách nhiệm về tính xác thực của thông tin này.
               </p>
             </div>
          </div>
        </form>

        <div className={cn("p-8 border-t flex justify-end gap-3", theme === "dark" ? "border-white/5 bg-white/[0.01]" : "border-zinc-100 bg-zinc-50")}>
          <button onClick={onClose} className={cn(
            "px-6 py-2.5 rounded-xl border font-bold text-sm transition-all",
            theme === "dark" ? "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          )}>Hủy bỏ</button>
          <button type="submit" onClick={handleSubmit} disabled={registerMutation.isPending} className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-center disabled:opacity-50">
            {registerMutation.isPending ? "Đang xử lý..." : "Khởi tạo tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifyOtpModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: { email: string, fullName: string } | null }) {
  const { theme } = useAdminStore();
  const verifyMutation = useAdminVerifyOtp();
  const resendMutation = useAdminResendOtp();
  const [otpCode, setOtpCode] = useState("");

  if (!isOpen || !user) return null;

  const handleVerify = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error("Vui lòng nhập mã OTP hợp lệ");
      return;
    }
    await verifyMutation.mutateAsync({ email: user.email, otp: otpCode });
    setOtpCode("");
    onClose();
  };

  const handleResend = async () => {
    await resendMutation.mutateAsync(user.email);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={cn("absolute inset-0 backdrop-blur-sm", theme === "dark" ? "bg-[#030303]/90" : "bg-zinc-900/60")} onClick={onClose} />
      <div className={cn(
        "relative w-full max-w-sm border rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300",
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-white"
      )}>
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>Xác thực OTP</h3>
            <p className={cn("text-xs mt-2 font-medium", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
              Nhập mã OTP đã gửi tới <br/>
              <span className="text-orange-500">{user.email}</span>
            </p>
          </div>
          <div className="space-y-6">
            <input
              type="text" autoFocus maxLength={6} value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className={cn(
                "w-full border rounded-2xl px-4 py-4 text-3xl font-black tracking-[0.5em] text-center focus:border-orange-500/50 outline-none transition-all",
                theme === "dark" ? "bg-white/5 border-white/10 text-orange-400 placeholder:text-white/10" : "bg-zinc-50 border-zinc-200 text-orange-500 placeholder:text-zinc-300"
              )}
              placeholder="••••••"
            />
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleVerify} 
                disabled={verifyMutation.isPending || !otpCode} 
                className={cn("w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50", theme === "dark" ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500" : "bg-orange-500 text-white shadow-sm hover:bg-orange-600")}
              >
                {verifyMutation.isPending ? "Đang xác thực..." : "Xác nhận ngay"}
              </button>
              <button 
                onClick={handleResend} 
                disabled={resendMutation.isPending || verifyMutation.isPending} 
                className={cn("w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2", theme === "dark" ? "hover:bg-white/5 text-white/40" : "hover:bg-zinc-100 text-zinc-500")}
              >
                <RefreshCcw className={cn("w-3 h-3", resendMutation.isPending && "animate-spin")} />
                Gửi lại mã
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className={cn("absolute top-4 right-4 p-2 rounded-lg transition-colors", theme === "dark" ? "bg-white/5 text-white/20 hover:text-white" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ClubDetailModal({ club, onClose }: { club: any, onClose: () => void }) {
  const { theme } = useAdminStore();
  if (!club) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      club ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-[#030303]/80" : "bg-zinc-900/50")} onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-3xl border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300",
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-teal-500/10"
      )}>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative h-full flex flex-col max-h-[90vh]">
          <div className={cn("p-8 pb-4 flex justify-between items-start border-b", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
            <div className="flex gap-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl border flex items-center justify-center text-3xl font-black shadow-inner overflow-hidden",
                theme === "dark" ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-white/10 text-purple-400" : "bg-teal-50 border-teal-100 text-teal-600"
              )}>
                {club.avatar ? (
                  <img src={club.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" />
                )}
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>{club.fullName}</h3>
                  {club.isVerified && <ShieldCheck className={cn("w-5 h-5", theme === "dark" ? "text-purple-400" : "text-teal-500")} />}
                </div>
                <div className="flex flex-wrap gap-3">
                  <p className={cn("font-medium text-sm flex items-center gap-1.5", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                    <Mail className="w-3.5 h-3.5" />
                    {club.email}
                  </p>
                  <p className={cn("font-medium text-sm flex items-center gap-1.5", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    {club.category || "Chưa phân loại"}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl border transition-all",
                theme === "dark" ? "bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className={cn("p-4 rounded-2xl border text-center group transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 hover:bg-teal-50")}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 transition-colors", theme === "dark" ? "text-white/30 group-hover:text-amber-400" : "text-zinc-500 group-hover:text-amber-500")}>Đánh giá</p>
                <div className={cn("flex items-center justify-center gap-1.5 text-xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {club.rating?.toFixed(1) || "5.0"}
                </div>
              </div>
              <div className={cn("p-4 rounded-2xl border text-center group transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 hover:bg-teal-50")}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 transition-colors", theme === "dark" ? "text-white/30 group-hover:text-blue-400" : "text-zinc-500 group-hover:text-blue-600")}>Thành viên</p>
                <div className={cn("flex items-center justify-center gap-1.5 text-xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>
                  <Users className="w-4 h-4 text-blue-400" />
                  {club.clubJoined?.length || 0}
                </div>
              </div>
              <div className={cn("p-4 rounded-2xl border text-center group transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 hover:bg-teal-50")}>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 transition-colors", theme === "dark" ? "text-white/30 group-hover:text-purple-400" : "text-zinc-500 group-hover:text-teal-600")}>Bài viết</p>
                <div className={cn("flex items-center justify-center gap-1.5 text-xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>
                  <ExternalLink className={cn("w-4 h-4", theme === "dark" ? "text-purple-400" : "text-teal-500")} />
                  {club.posts?.length || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Thông tin cơ bản</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")}>
                        <Building2 className={cn("w-4 h-4", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-500")}>Trường học</p>
                        <p className={cn("text-sm font-medium", theme === "dark" ? "text-white/80" : "text-zinc-900")}>{club.school || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")}>
                        <Phone className={cn("w-4 h-4", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-500")}>Số điện thoại</p>
                        <p className={cn("text-sm font-medium", theme === "dark" ? "text-white/80" : "text-zinc-900")}>{club.phoneNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Giới thiệu</h4>
                  <div className={cn("p-4 rounded-2xl border text-sm font-medium leading-relaxed italic", theme === "dark" ? "bg-white/5 border-white/5 text-white/60" : "bg-zinc-50 border-zinc-200 text-zinc-600")}>
                      "{club.description || "Câu lạc bộ này chưa cập nhật mô tả chi tiết."}"
                  </div>
                </section>
                
                <section>
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Hệ thống</h4>
                  <div className="flex gap-3">
                    <div className={cn(
                      "flex-1 px-4 py-3 rounded-2xl border text-center transition-all",
                      club.isActive 
                        ? (theme === "dark" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                        : (theme === "dark" ? "bg-red-500/5 border-red-500/20 text-red-500" : "bg-red-50 border-red-200 text-red-600")
                    )}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5">Hoạt động</p>
                      <p className="text-xs font-bold">{club.isActive ? "ACTIVE" : "INACTIVE"}</p>
                    </div>
                    <div className={cn(
                      "flex-1 px-4 py-3 rounded-2xl border text-center transition-all",
                      club.isVerified 
                        ? (theme === "dark" ? "bg-purple-500/5 border-purple-500/20 text-purple-400" : "bg-teal-50 border-teal-200 text-teal-600")
                        : (theme === "dark" ? "bg-white/5 border-white/10 text-white/20" : "bg-zinc-100 border-zinc-200 text-zinc-400")
                    )}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5">Xác thực</p>
                      <p className="text-xs font-bold">{club.isVerified ? "VERIFIED" : "NO"}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center justify-between", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                  Bài viết gần đây
                  <span className={cn("text-[9px] lowercase font-medium tracking-normal", theme === "dark" ? "text-white/40" : "text-zinc-500")}>({club.posts?.length || 0})</span>
                </h4>
                <div className="space-y-3">
                  {club.posts?.length > 0 ? (
                    club.posts.map((post: any) => (
                      <div key={post._id} className={cn(
                        "p-4 border rounded-2xl group/post transition-all cursor-default relative overflow-hidden",
                        theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-purple-500/30" : "bg-zinc-50 border-zinc-200 hover:bg-white hover:border-teal-500/30 hover:shadow-sm"
                      )}>
                        <div className={cn("absolute top-0 left-0 w-1 h-full transition-all", theme === "dark" ? "bg-purple-500/0 group-hover/post:bg-purple-500" : "bg-teal-500/0 group-hover/post:bg-teal-500")} />
                        <h5 className={cn("text-sm font-bold transition-colors mb-2 line-clamp-2 leading-snug", theme === "dark" ? "text-white/80 group-hover/post:text-purple-400" : "text-zinc-800 group-hover/post:text-teal-600")}>
                          {post.title}
                        </h5>
                        <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={cn("py-12 flex flex-col items-center justify-center rounded-[2rem] border border-dashed", theme === "dark" ? "border-white/5 text-white/20" : "border-zinc-200 text-zinc-400")}>
                      <Info className={cn("w-8 h-8 mb-3 opacity-30", theme === "dark" ? "text-purple-500" : "text-teal-500")} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Chưa có bài viết</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          
          <div className={cn("p-8 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]", theme === "dark" ? "border-white/5 bg-white/[0.01] text-white/20" : "border-zinc-100 bg-zinc-50 text-zinc-400")}>
             <span>Gia nhập: {new Date(club.createdAt).toLocaleDateString("vi-VN")}</span>
             <span>Cập nhật: {new Date(club.updatedAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
