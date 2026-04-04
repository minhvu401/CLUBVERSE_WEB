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
import { useAdminStore } from "@/store/adminStore";
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
  const { theme } = useAdminStore();
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
          <h2 className={cn("text-4xl font-black tracking-tight mb-2 uppercase", theme === "dark" ? "text-white" : "text-zinc-900")}>Quản lý người dùng</h2>
          <p className={cn("text-base font-medium", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            Quản trị danh sách sinh viên, vai trò và trạng thái tài khoản toàn hệ thống.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Khoảng thời gian tham gia</label>
            <div className={cn(
              "flex items-center rounded-xl px-2 h-[42px] transition-all border",
              theme === "dark" 
                ? "bg-white/5 border-white/10 focus-within:border-purple-500/50" 
                : "bg-white border-zinc-200 focus-within:border-teal-500/50 shadow-sm"
            )}>
              <input 
                type="month"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className={cn("bg-transparent px-3 py-1.5 text-xs outline-none cursor-pointer transition-colors w-[130px]", theme === "dark" ? "text-white hover:text-purple-400" : "text-zinc-700 hover:text-teal-600")}
                style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
              />
              <span className={cn("font-light px-1", theme === "dark" ? "text-white/20" : "text-zinc-300")}>—</span>
              <input 
                type="month"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className={cn("bg-transparent px-3 py-1.5 text-xs outline-none cursor-pointer transition-colors w-[130px]", theme === "dark" ? "text-white hover:text-purple-400" : "text-zinc-700 hover:text-teal-600")}
                style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
              />
            </div>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "px-4 h-[42px] rounded-xl border transition-all flex items-center gap-2 group disabled:opacity-50",
              theme === "dark" 
                ? "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20" 
                : "bg-white border-zinc-200 text-zinc-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 shadow-sm",
              isExporting && "animate-pulse"
            )}
            title="Xuất dữ liệu CSV"
          >
            {isExporting ? (
              <RefreshCcw className={cn("w-4 h-4 animate-spin", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
            ) : (
              <Download className={cn("w-4 h-4 group-hover:scale-110 transition-transform", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
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
        <div className={cn(
          "p-8 rounded-[2rem] relative overflow-hidden group border",
          theme === "dark" ? "bg-white/5 border-white/5" : "bg-white/80 border-purple-500/10 shadow-sm"
        )}>
           <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Tổng sinh viên</p>
           <h3 className={cn("text-4xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>{usersRaw.length}</h3>
           {theme === "dark" && <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />}
        </div>
        <div className={cn(
          "p-8 rounded-[2rem] relative overflow-hidden group border",
          theme === "dark" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50/80 border-emerald-200 shadow-sm"
        )}>
           <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-emerald-400/50" : "text-emerald-600/70")}>Đang hoạt động</p>
           <h3 className="text-4xl font-black text-emerald-500">{activeCount}</h3>
           {theme === "dark" && <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />}
        </div>
        <div className={cn(
          "p-8 rounded-[2rem] relative overflow-hidden group border",
          theme === "dark" ? "bg-red-500/5 border-red-500/10" : "bg-red-50/80 border-red-200 shadow-sm"
        )}>
           <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-red-400/50" : "text-red-600/70")}>Bị khóa</p>
           <h3 className="text-4xl font-black text-red-500">{lockedCount}</h3>
           {theme === "dark" && <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/10 blur-[40px] rounded-full pointer-events-none" />}
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-4">
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
              onClick={() => {
                setStatusFilter(filter.id as any);
                setPage(1);
              }}
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

      {/* Table Container */}
      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden relative",
        theme === "dark" ? "bg-white/5 border-white/5" : "bg-white/80 border-teal-500/10 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn("border-b", theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-zinc-100 bg-zinc-50/50")}>
                {["Người dùng", "Major / Role", "Trạng thái", "Ngày tham gia", "Thao tác"].map((th, i) => (
                  <th key={i} className={cn(
                    "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]",
                    theme === "dark" ? "text-white/30" : "text-zinc-400",
                    i === 4 && "text-right"
                  )}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn("divide-y", theme === "dark" ? "divide-white/5" : "divide-zinc-100")}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className={cn("px-8 py-20 text-center font-bold uppercase tracking-widest animate-pulse", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={cn("px-8 py-20 text-center font-bold uppercase tracking-widest", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user._id} className={cn("transition-colors group", theme === "dark" ? "hover:bg-white/[0.02]" : "hover:bg-teal-50/50")}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold border",
                          theme === "dark" 
                            ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-white/10 text-purple-400" 
                            : "bg-teal-50 border-teal-100 text-teal-600"
                        )}>
                           {user.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-bold transition-colors",
                            theme === "dark" ? "text-white group-hover:text-purple-400" : "text-zinc-900 group-hover:text-teal-600"
                          )}>{user.fullName}</p>
                          <p className={cn("text-xs", theme === "dark" ? "text-white/30" : "text-zinc-400")}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-medium truncate max-w-[200px]", theme === "dark" ? "text-white/70" : "text-zinc-600")} title={user.school}>
                          {user.major || user.school || "N/A"}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider",
                          user.role === "admin" && "text-red-500",
                          user.role === "club" && (theme === "dark" ? "text-cyan-400" : "text-cyan-600"),
                          user.role === "user" && "text-emerald-500"
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
                    <td className={cn("px-8 py-5 text-sm font-medium", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUserForDetail(user._id)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            theme === "dark" 
                              ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-purple-400" 
                              : "bg-teal-50 hover:bg-teal-100 text-teal-600 hover:text-teal-700"
                          )}
                          title="Xem chi tiết"
                        >
                          <Contact2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(user)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            theme === "dark" 
                              ? (user.isActive ? "bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400" : "bg-white/5 hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400")
                              : (user.isActive ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600")
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
        <div className={cn(
          "px-8 py-6 border-t flex items-center justify-between",
          theme === "dark" ? "border-white/5 bg-white/[0.01]" : "border-zinc-100 bg-zinc-50"
        )}>
          <p className={cn("text-xs font-bold uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                "p-2 rounded-xl border transition-all disabled:opacity-30 disabled:hover:bg-transparent",
                theme === "dark" 
                  ? "border-white/5 text-white/40 hover:text-white hover:bg-white/5" 
                  : "border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 bg-white"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                "p-2 rounded-xl border transition-all disabled:opacity-30 disabled:hover:bg-transparent",
                theme === "dark" 
                  ? "border-white/5 text-white/40 hover:text-white hover:bg-white/5" 
                  : "border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 bg-white"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Glow Decoration */}
        {theme === "dark" && <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />}
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
  const { theme } = useAdminStore();
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
      <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-[#030303]/80" : "bg-zinc-900/60")} onClick={onClose} />
      
      <div className={cn("relative w-full max-w-2xl border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]", theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200")}>
        {/* Header */}
        <div className={cn("p-8 pb-4 flex justify-between items-center border-b", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
          <div>
            <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>Đăng ký tài khoản mới</h3>
            <p className={cn("text-xs font-medium mt-1", theme === "dark" ? "text-white/40" : "text-zinc-500")}>Khởi tạo sinh viên hoặc tài khoản câu lạc bộ thủ công.</p>
          </div>
          <button 
            onClick={onClose}
            className={cn("p-2 rounded-xl border transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm")}
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
                <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Họ và tên</label>
                <input
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50 shadow-sm")}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Số điện thoại</label>
                <input
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50 shadow-sm")}
                  placeholder="0123456789"
                />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50 shadow-sm")}
                  placeholder="example@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <label className={cn("text-[10px] font-bold uppercase pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Mật khẩu</label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className={cn("w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white focus:border-purple-500/50 focus:bg-white/[0.08]" : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50 shadow-sm")}
                  placeholder="••••••••"
                />
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

        {/* Footer Actions */}
        <div className={cn("p-8 border-t flex justify-end gap-3", theme === "dark" ? "border-white/5 bg-white/[0.01]" : "border-zinc-100 bg-zinc-50/50")}>
          <button 
            type="button"
            onClick={onClose}
            className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all border", theme === "dark" ? "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100")}
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
      <div className={cn("absolute inset-0 backdrop-blur-sm", theme === "dark" ? "bg-[#030303]/90" : "bg-zinc-900/40")} onClick={onClose} />
      <div className={cn("relative w-full max-w-sm border rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300", theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200")}>
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4", theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600")}>
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className={cn("text-xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>Xác thực tài khoản</h3>
            <p className={cn("text-xs mt-2 font-medium", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
              Vui lòng nhập mã OTP đã gửi tới <br/>
              <span className={theme === "dark" ? "text-orange-400" : "text-orange-600"}>{user.email}</span>
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
                className={cn("w-full border rounded-2xl px-4 py-4 text-3xl font-black tracking-[0.5em] text-center outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/10 text-orange-400 focus:border-orange-500/50 placeholder:text-white/10" : "bg-white border-zinc-200 text-orange-600 focus:border-orange-400 placeholder:text-zinc-200")}
                placeholder="••••••"
              />
              <ShieldCheck className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors", theme === "dark" ? "text-orange-500/20 group-focus-within:text-orange-500" : "text-orange-200 group-focus-within:text-orange-500")} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || !otpCode}
                className={cn("w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50", theme === "dark" ? "bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/20" : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm")}
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

function UserDetailModal({ userId, onClose }: { userId: string | null, onClose: () => void }) {
  const { theme } = useAdminStore();
  const { data: user, isLoading } = useAdminUserDetail(userId || undefined);
  if (!userId) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      userId ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-[#030303]/80" : "bg-zinc-900/40")} onClick={onClose} />
      
      <div className={cn("relative w-full max-w-2xl border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 h-[85vh] flex flex-col", theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200")}>
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative h-full flex flex-col min-h-0">
          {/* Header */}
          <div className="p-8 pb-0 flex justify-between items-start shrink-0">
            <div className="flex gap-6">
              <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner", theme === "dark" ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-purple-400" : "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200 text-purple-600")}>
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>{user?.fullName || (isLoading ? "Đang tải..." : "N/A")}</h3>
                  {user?.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                </div>
                <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                  <Mail className="w-4 h-4" />
                  {user?.email || "..."}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    user?.isActive 
                      ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") 
                      : (theme === "dark" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200")
                  )}>
                    {user?.isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border", theme === "dark" ? "bg-white/5 text-white/40 border-white/10" : "bg-zinc-100 text-zinc-500 border-zinc-200")}>
                    {user?.role === "user" ? "Sinh viên" : user?.role || "CLB"}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={cn("p-2 rounded-xl transition-all border", theme === "dark" ? "bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-1 custom-scrollbar min-h-0">
            {/* Left Column: Profile Info */}
            <div className="space-y-6">
              <section>
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Thông tin cốt lõi</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className={cn("w-5 h-5 mt-0.5", theme === "dark" ? "text-purple-400" : "text-purple-600")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Tổ chức/Trường</p>
                      <p className={cn("text-sm font-medium leading-relaxed break-words", theme === "dark" ? "text-white/80" : "text-zinc-900")}>{user?.school || "N/A"}</p>
                    </div>
                  </div>
                  {user?.role === "user" && (
                    <>
                      <div className="flex items-start gap-3">
                        <Briefcase className={cn("w-5 h-5 mt-0.5", theme === "dark" ? "text-purple-400" : "text-purple-600")} />
                        <div>
                          <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Chuyên ngành</p>
                          <p className={cn("text-sm font-medium", theme === "dark" ? "text-white/80" : "text-zinc-900")}>{user?.major || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className={cn("w-5 h-5 mt-0.5", theme === "dark" ? "text-purple-400" : "text-purple-600")} />
                        <div>
                          <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Năm học</p>
                          <p className={cn("text-sm font-medium", theme === "dark" ? "text-white/80" : "text-zinc-900")}>Năm {user?.year || "N/A"}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-3">
                    <Contact2 className={cn("w-5 h-5 mt-0.5", theme === "dark" ? "text-purple-400" : "text-purple-600")} />
                    <div>
                      <p className={cn("text-[10px] font-bold uppercase", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Số điện thoại</p>
                      <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-zinc-900")}>{user?.phoneNumber || "Chưa cung cấp"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Giới thiệu</h4>
                <p className={cn("text-sm font-medium leading-relaxed italic p-4 rounded-2xl border", theme === "dark" ? "bg-white/5 border-white/5 text-white/60" : "bg-zinc-50 border-zinc-200 text-zinc-600 shadow-sm")}>
                  "{user?.description || "Không có mô tả chi tiết."}"
                </p>
              </section>
            </div>

            {/* Right Column: Skills & Clubs */}
            <div className="space-y-6">
              <section>
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Kỹ năng & Sở thích</h4>
                <div className="space-y-4">
                  <div>
                    <p className={cn("text-[10px] font-bold uppercase mb-2", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Kỹ năng</p>
                    <div className="flex flex-wrap gap-2">
                      {user?.skills?.length > 0 ? (
                        user.skills.map((s: string) => (
                          <span key={s} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border", theme === "dark" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-purple-50 text-purple-600 border-purple-200")}>
                            {s}
                          </span>
                        ))
                      ) : <span className={cn("text-xs italic", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Chưa cập nhật kỹ năng</span>}
                    </div>
                  </div>
                  <div>
                    <p className={cn("text-[10px] font-bold uppercase mb-2", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Sở thích</p>
                    <div className="flex flex-wrap gap-2">
                       {user?.interests?.length > 0 ? (
                        user.interests.map((i: string) => (
                          <span key={i} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border", theme === "dark" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200")}>
                            {i}
                          </span>
                        ))
                      ) : <span className={cn("text-xs italic", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Chưa cập nhật sở thích</span>}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Câu lạc bộ đã tham gia</h4>
                <div className="space-y-3">
                  {user?.clubsJoined?.length > 0 ? (
                    user.clubsJoined.map((c: any) => (
                      <div key={c.clubId} className={cn("p-4 border rounded-2xl flex items-center justify-between group/club transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:border-purple-500/30" : "bg-white border-zinc-200 hover:border-purple-300 shadow-sm")}>
                        <div className="flex flex-col gap-1">
                          <span className={cn("text-sm font-bold transition-colors", theme === "dark" ? "text-white/80 group-hover/club:text-purple-400" : "text-zinc-900 group-hover/club:text-purple-600")}>
                            {c.clubName || "CLB Đã tham gia"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-black uppercase tracking-wider", theme === "dark" ? "text-purple-400/50" : "text-purple-600")}>
                              {c.role || "Thành viên"}
                            </span>
                            <span className={cn("text-[10px]", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
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
                    <div className={cn("p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center", theme === "dark" ? "border-white/5 text-white/20" : "border-zinc-300 text-zinc-400")}>
                       <Star className={cn("w-8 h-8 mb-2 opacity-50", theme === "dark" ? "text-purple-500/30" : "text-purple-300")} />
                       <p className="text-xs font-bold tracking-widest uppercase">Chưa tham gia CLB nào</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className={cn("p-8 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]", theme === "dark" ? "border-white/5 bg-white/[0.01] text-white/20" : "border-zinc-100 bg-zinc-50/50 text-zinc-400")}>
             <span>Ngày tham gia: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</span>
             <span>Cập nhật lần cuối: {user?.updatedAt ? new Date(user.updatedAt).toLocaleTimeString("vi-VN") : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
