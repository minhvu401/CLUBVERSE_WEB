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

export default function ClubManagementPage() {
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
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Quản lý câu lạc bộ</h2>
          <p className="text-white/50 text-base font-medium">
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
      <section className="flex flex-wrap gap-4">
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] rounded-2xl text-sm text-white border border-white/5 focus:border-purple-500/50 outline-none transition-all placeholder:text-white/20"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
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
                  ? "bg-white/10 text-white shadow-xl" 
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
              )}
            >
              <filter.icon className="w-3 h-3" />
              {filter.label}
            </button>
          ))}
        </div>

        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/70 font-bold text-sm hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Bộ lọc nâng cao
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(club);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border border-white/5 transition-all group/btn",
                      club.isActive ? "bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400" : "bg-emerald-500/10 text-emerald-400"
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
      <div className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Đăng ký tài khoản</h3>
            <p className="text-white/40 text-xs font-medium mt-1">Khởi tạo tài khoản câu lạc bộ hoặc thành viên mới.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn("p-4 rounded-2xl border transition-all text-center group", role === "user" ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]")}
            >
              <GraduationCap className={cn("w-6 h-6 mx-auto mb-2", role === "user" ? "text-purple-400" : "text-white/20")} />
              <p className="text-xs font-black uppercase tracking-widest">Sinh viên</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("club")}
              className={cn("p-4 rounded-2xl border transition-all text-center group", role === "club" ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]")}
            >
              <Briefcase className={cn("w-6 h-6 mx-auto mb-2", role === "club" ? "text-blue-400" : "text-white/20")} />
              <p className="text-xs font-black uppercase tracking-widest">Câu lạc bộ</p>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Họ và tên</label>
                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Số điện thoại</label>
                <input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Mật khẩu</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 outline-none transition-all" />
              </div>
            </div>
          </div>

          {role === "club" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Lĩnh vực hoạt động</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                  {["Công nghệ", "Văn hóa - Nghệ thuật", "Thể thao", "Học thuật", "Cộng đồng"].map(cat => <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Mô tả tóm tắt</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none resize-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase">Trường học</label>
                <input required value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none" />
              </div>
            </div>
          )}
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white/70 font-bold text-sm hover:text-white hover:bg-white/10 transition-all">Hủy bỏ</button>
          <button type="submit" onClick={handleSubmit} disabled={registerMutation.isPending} className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-center disabled:opacity-50">
            {registerMutation.isPending ? "Đang xử lý..." : "Khởi tạo tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifyOtpModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: { email: string, fullName: string } | null }) {
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
      <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Xác thực OTP</h3>
            <p className="text-xs text-white/40 mt-2 font-medium">
              Nhập mã OTP đã gửi tới <br/>
              <span className="text-orange-400">{user.email}</span>
            </p>
          </div>
          <div className="space-y-6">
            <input
              type="text" autoFocus maxLength={6} value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-3xl font-black tracking-[0.5em] text-center text-orange-400 focus:border-orange-500/50 outline-none transition-all placeholder:text-white/10"
              placeholder="••••••"
            />
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleVerify} 
                disabled={verifyMutation.isPending || !otpCode} 
                className="w-full py-4 rounded-2xl bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:bg-orange-500 transition-all disabled:opacity-50"
              >
                {verifyMutation.isPending ? "Đang xác thực..." : "Xác nhận ngay"}
              </button>
              <button 
                onClick={handleResend} 
                disabled={resendMutation.isPending || verifyMutation.isPending} 
                className="w-full py-3 rounded-xl hover:bg-white/5 text-white/40 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className={cn("w-3 h-3", resendMutation.isPending && "animate-spin")} />
                Gửi lại mã
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
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
