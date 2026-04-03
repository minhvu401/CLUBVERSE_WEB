"use client";

import { adminApi } from "@/app/services/api/admin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { 
  useAdminUserDetail, 
  useAdminUsers, 
  useDeactivateUser, 
  useReactivateUser,
  useAdminVerifyOtp,
  useAdminResendOtp
} from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Contact2,
  Download,
  Filter,
  GraduationCap,
  Mail,
  Search,
  Star,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  ShieldAlert,
  ShieldCheck,
  Info,
  RefreshCcw,
  Fingerprint
} from "lucide-react";
import { useState } from "react";
import { useAdminRegister } from "@/hooks/useAdmin";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { data: userData, isLoading } = useAdminUsers(page, 10, "", "user");
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportStart, setExportStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [exportEnd, setExportEnd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [verifyOtpOpen, setVerifyOtpOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<{ email: string, fullName: string } | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<string | null>(null);

  const usersRaw = (userData?.users || [])
    .filter((u: any) => u.role === "user")
    .filter((u: any) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return u.isActive;
      if (statusFilter === "inactive") return !u.isActive;
      return true;
    });

  const activeCount = userData?.activeCount ?? (userData?.users || []).filter((u: any) => u.isActive && u.role === "user").length;
  const lockedCount = userData?.lockedCount ?? (userData?.users || []).filter((u: any) => !u.isActive && u.role === "user").length;
  
  // Since we use server-side pagination for Users, we don't slice again on the frontend
  const users = usersRaw;
  const totalPages = Math.ceil((userData?.total || usersRaw.length) / 10) || 1;

  const handleAction = (user: any) => {
    setTargetUser(user);
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!targetUser) return;
    if (targetUser.isActive) {
      await deactivateMutation.mutateAsync(targetUser._id);
    } else {
      await reactivateMutation.mutateAsync(targetUser._id);
    }
    setConfirmOpen(false);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await adminApi.getUsers(1, 1000, "", "user");
      const allUsers = res?.users || [];
      
      const startDate = new Date(exportStart + "-01");
      const endDate = new Date(exportEnd + "-01");
      endDate.setMonth(endDate.getMonth() + 1); // Move to start of next month

      const filtered = allUsers.filter((u: any) => {
        const joinDate = new Date(u.createdAt);
        return joinDate >= startDate && joinDate < endDate;
      });

      if (filtered.length === 0) {
        toast.error(`Không có người dùng nào tham gia trong khoảng thời gian từ ${exportStart} đến ${exportEnd}`);
        return;
      }

      // Excel data mapping
      const data = filtered.map((u: any) => ({
        "ID": u._id,
        "Họ tên": u.fullName,
        "Email": u.email,
        "Chuyên ngành/Trường": u.major || u.school || "N/A",
        "Vai trò": u.role,
        "Trạng thái": u.isActive ? "Hoạt động" : "Bị khóa",
        "Ngày tham gia": new Date(u.createdAt).toLocaleDateString("vi-VN")
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "UsersJoined");

      // Export file
      XLSX.writeFile(workbook, `users_joined_${exportStart}_to_${exportEnd}.xlsx`);
      
      toast.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Xuất file thất bại");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Quản lý người dùng</h2>
          <p className="text-white/50 text-base font-medium">
            Quản trị danh sách sinh viên, vai trò và trạng thái tài khoản toàn hệ thống.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Khoảng thời gian tham gia</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2 h-[42px] focus-within:border-purple-500/50 transition-all">
              <input 
                type="month"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:text-purple-400 transition-colors w-[130px]"
                style={{ colorScheme: 'dark' }}
              />
              <span className="text-white/20 font-light px-1">—</span>
              <input 
                type="month"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className="bg-transparent px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:text-purple-400 transition-colors w-[130px]"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "px-4 h-[42px] rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group disabled:opacity-50",
              isExporting && "animate-pulse"
            )}
            title="Xuất dữ liệu CSV"
          >
            {isExporting ? (
              <RefreshCcw className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform text-purple-400" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">Xuất Excel</span>
          </button>
          <button 
            onClick={() => setRegisterOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 h-[42px]"
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký tài khoản
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Tổng sinh viên</p>
           <h3 className="text-4xl font-black text-white">{usersRaw.length}</h3>
           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/10 blur-[40px] rounded-full" />
        </div>
        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase text-emerald-400/50 tracking-widest mb-1">Đang hoạt động</p>
           <h3 className="text-4xl font-black text-emerald-400">{activeCount}</h3>
           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 blur-[40px] rounded-full" />
        </div>
        <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 relative overflow-hidden group">
           <p className="text-[10px] font-black uppercase text-red-400/50 tracking-widest mb-1">Bị khóa</p>
           <h3 className="text-4xl font-black text-red-500">{lockedCount}</h3>
           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/10 blur-[40px] rounded-full" />
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {[
            { id: "all", label: "Tất cả", icon: Users },
            { id: "active", label: "Hoạt động", icon: CheckCircle2 },
            { id: "inactive", label: "Bị khóa", icon: ShieldAlert },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setStatusFilter(filter.id as any);
                setPage(1);
              }}
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

        <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/70 font-bold text-sm hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 ml-auto">
          <Filter className="w-4 h-4" />
          Bộ lọc nâng cao
        </button>
      </section>

      {/* Table Container */}
      <div className="rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Người dùng</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Major / Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Ngày tham gia</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-bold uppercase tracking-widest animate-pulse">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-purple-400">
                           {user.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user.fullName}</p>
                          <p className="text-xs text-white/30">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/70 truncate max-w-[200px]" title={user.school}>
                          {user.major || user.school || "N/A"}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider",
                          user.role === "admin" && "text-red-500",
                          user.role === "club" && "text-cyan-400",
                          user.role === "user" && "text-emerald-400"
                        )}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        user.isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", user.isActive ? "bg-emerald-400" : "bg-red-400")} />
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-white/40 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUserForDetail(user._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-purple-400 transition-all"
                          title="Xem chi tiết"
                        >
                          <Contact2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(user)}
                          className={cn(
                            "p-2 rounded-lg bg-white/5 transition-all",
                            user.isActive ? "hover:bg-red-500/10 text-white/60 hover:text-red-400" : "hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400"
                          )}
                          title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {user.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {!user.isVerified && (
                          <button 
                            onClick={() => {
                              setUserToVerify({ email: user.email, fullName: user.fullName });
                              setVerifyOtpOpen(true);
                            }}
                            className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all"
                            title="Xác thực OTP"
                          >
                            <Fingerprint className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-white/5 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-white/5 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Glow Decoration */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={targetUser?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
        description={targetUser?.isActive 
          ? `Bạn có chắc chắn muốn vô hiệu hóa ${targetUser.fullName}? Người dùng này sẽ không thể đăng nhập vào hệ thống.` 
          : `Kích hoạt lại tài khoản cho ${targetUser?.fullName}?`
        }
        confirmText={targetUser?.isActive ? "Đồng ý khóa" : "Kích hoạt"}
        variant={targetUser?.isActive ? "danger" : "success"}
        isLoading={deactivateMutation.isPending || reactivateMutation.isPending}
      />

      <UserDetailModal 
        userId={selectedUserForDetail} 
        onClose={() => setSelectedUserForDetail(null)} 
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
  const [role, setRole] = useState<"user" | "club">("user");
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
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        ...formData,
        role
      });
      onClose();
      // Reset form
      setFormData({
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
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Đăng ký tài khoản mới</h3>
            <p className="text-white/40 text-xs font-medium mt-1">Khởi tạo sinh viên hoặc tài khoản câu lạc bộ thủ công.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "p-4 rounded-2xl border transition-all text-center group",
                role === "user" 
                  ? "bg-purple-500/10 border-purple-500/50 text-purple-400" 
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]"
              )}
            >
              <GraduationCap className={cn("w-6 h-6 mx-auto mb-2 transition-transform group-hover:scale-110", role === "user" ? "text-purple-400" : "text-white/20")} />
              <p className="text-xs font-black uppercase tracking-widest">Sinh viên</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("club")}
              className={cn(
                "p-4 rounded-2xl border transition-all text-center group",
                role === "club" 
                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]"
              )}
            >
              <Briefcase className={cn("w-6 h-6 mx-auto mb-2 transition-transform group-hover:scale-110", role === "club" ? "text-blue-400" : "text-white/20")} />
              <p className="text-xs font-black uppercase tracking-widest">Câu lạc bộ</p>
            </button>
          </div>

          {/* Basic Info Container */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-purple-400/50 tracking-widest pl-1">Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Họ và tên</label>
                <input
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Số điện thoại</label>
                <input
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  placeholder="0123456789"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  placeholder="example@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Mật khẩu</label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Conditional Role-Based Container */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-blue-400/50 tracking-widest pl-1">
              {role === "user" ? "Thông tin học thuật" : "Thông tin tổ chức"}
            </h4>
            
            {role === "user" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Trường học</label>
                  <input
                    required
                    value={formData.school}
                    onChange={e => setFormData({...formData, school: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Chuyên ngành</label>
                  <input
                    required
                    value={formData.major}
                    onChange={e => setFormData({...formData, major: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all"
                    placeholder="VD: Kỹ thuật phần mềm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Năm học</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    {[1,2,3,4,5].map(y => <option key={y} value={y} className="bg-[#0a0a0a]">Năm {y}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Lĩnh vực hoạt động</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    {["Công nghệ", "Văn hóa - Nghệ thuật", "Thể thao", "Học thuật", "Cộng đồng"].map(cat => (
                      <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase pl-1">Mô tả tóm tắt</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all resize-none"
                    placeholder="Giới thiệu sơ lược về câu lạc bộ..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Warning */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
             <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
             <div>
               <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Lưu ý bảo mật</p>
               <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                 Tài khoản sau khi khởi tạo sẽ có trạng thái hoạt động ngay lập tức. Admin chịu trách nhiệm về tính xác thực của thông tin này.
               </p>
             </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white/70 font-bold text-sm hover:text-white hover:bg-white/10 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
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
    await verifyMutation.mutateAsync({
      email: user.email,
      otp: otpCode
    });
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
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Xác thực tài khoản</h3>
            <p className="text-xs text-white/40 mt-2 font-medium">
              Vui lòng nhập mã OTP đã gửi tới <br/>
              <span className="text-orange-400">{user.email}</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-3xl font-black tracking-[0.5em] text-center text-orange-400 focus:border-orange-500/50 outline-none transition-all placeholder:text-white/10"
                placeholder="••••••"
              />
              <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500/20 group-focus-within:text-orange-500 transition-colors" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || !otpCode}
                className="w-full py-4 rounded-2xl bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
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

function UserDetailModal({ userId, onClose }: { userId: string | null, onClose: () => void }) {
  const { data: user, isLoading } = useAdminUserDetail(userId || undefined);
  if (!userId) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      userId ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className="absolute inset-0 bg-[#030303]/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 h-[85vh] flex flex-col">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative h-full flex flex-col min-h-0">
          {/* Header */}
          <div className="p-8 pb-0 flex justify-between items-start shrink-0">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-3xl font-black text-purple-400 shadow-inner">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{user?.fullName || (isLoading ? "Đang tải..." : "N/A")}</h3>
                  {user?.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                </div>
                <p className="text-white/40 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || "..."}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    user?.isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  )}>
                    {user?.isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                    {user?.role === "user" ? "Sinh viên" : user?.role || "CLB"}
                  </span>
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

          <div className="p-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-1 custom-scrollbar min-h-0">
            {/* Left Column: Profile Info */}
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Thông tin cốt lõi</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase">Tổ chức/Trường</p>
                      <p className="text-sm text-white/80 font-medium leading-relaxed break-words">{user?.school || "N/A"}</p>
                    </div>
                  </div>
                  {user?.role === "user" && (
                    <>
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-white/20 uppercase">Chuyên ngành</p>
                          <p className="text-sm text-white/80 font-medium">{user?.major || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-white/20 uppercase">Năm học</p>
                          <p className="text-sm text-white/80 font-medium">Năm {user?.year || "N/A"}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-3">
                    <Contact2 className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase">Số điện thoại</p>
                      <p className="text-sm text-white font-medium">{user?.phoneNumber || "Chưa cung cấp"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Giới thiệu</h4>
                <p className="text-sm text-white/60 font-medium leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/5">
                  "{user?.description || "Không có mô tả chi tiết."}"
                </p>
              </section>
            </div>

            {/* Right Column: Skills & Clubs */}
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Kỹ năng & Sở thích</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-white/20 uppercase mb-2">Kỹ năng</p>
                    <div className="flex flex-wrap gap-2">
                      {user?.skills?.length > 0 ? (
                        user.skills.map((s: string) => (
                          <span key={s} className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                            {s}
                          </span>
                        ))
                      ) : <span className="text-xs text-white/20 italic">Chưa cập nhật kỹ năng</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/20 uppercase mb-2">Sở thích</p>
                    <div className="flex flex-wrap gap-2">
                       {user?.interests?.length > 0 ? (
                        user.interests.map((i: string) => (
                          <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                            {i}
                          </span>
                        ))
                      ) : <span className="text-xs text-white/20 italic">Chưa cập nhật sở thích</span>}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4">Câu lạc bộ đã tham gia</h4>
                <div className="space-y-3">
                  {user?.clubsJoined?.length > 0 ? (
                    user.clubsJoined.map((c: any) => (
                      <div key={c.clubId} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group/club hover:border-purple-500/30 transition-all">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white/80 group-hover/club:text-purple-400 transition-colors">
                            {c.clubName || "CLB Đã tham gia"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-purple-400/50 tracking-wider">
                              {c.role || "Thành viên"}
                            </span>
                            <span className="text-[10px] text-white/20">
                              • Tham gia: {new Date(c.joinedAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        {c.isActive ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-30" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-white/20">
                       <Star className="w-8 h-8 mb-2 opacity-50 text-purple-500/30" />
                       <p className="text-xs font-bold tracking-widest uppercase">Chưa tham gia CLB nào</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
             <span>Ngày tham gia: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</span>
             <span>Cập nhật lần cuối: {user?.updatedAt ? new Date(user.updatedAt).toLocaleTimeString("vi-VN") : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
