"use client";

import React from "react";
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminApplications, useApproveApplication, useRejectApplication, useAdminClubs } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminStore } from "@/store/adminStore";

export default function ApplicationsPage() {
  const { theme } = useAdminStore();
  const { data: clubs } = useAdminClubs();
  const [selectedClubId, setSelectedClubId] = useState<string>("");

  useEffect(() => {
    if (clubs && clubs.length > 0 && !selectedClubId) {
      setSelectedClubId(clubs[0]._id);
    }
    setCurrentPage(1); // Reset page on club change
  }, [clubs, selectedClubId]);

  const { data: applications, isLoading } = useAdminApplications(selectedClubId);
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetApp, setTargetApp] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [viewingApp, setViewingApp] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNote, setInterviewNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const getClubName = (clubId: any) => {
    if (!clubId) return "N/A";
    if (typeof clubId === "object" && clubId.fullName) return clubId.fullName;
    const found = clubs?.find((c: any) => c._id === clubId);
    return found?.fullName || `ID: ${clubId}`;
  };

  const handleAction = (app: any, type: "approve" | "reject") => {
    setTargetApp(app);
    setActionType(type);
    
    // Reset forms
    setInterviewDate(new Date().toISOString().slice(0, 16));
    setInterviewLocation("");
    setInterviewNote("");
    setRejectionReason("");
    
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!targetApp) return;
    try {
      if (actionType === "approve") {
        await approveMutation.mutateAsync({
          appId: targetApp._id,
          interviewDate: new Date(interviewDate).toISOString(),
          interviewLocation,
          interviewNote
        });
      } else {
        await rejectMutation.mutateAsync({
          appId: targetApp._id,
          rejectionReason
        });
      }
      setConfirmOpen(false);
      setTargetApp(null);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const totalPages = Math.ceil((applications?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = applications?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className={cn("text-4xl font-black tracking-tight mb-2 uppercase", theme === "dark" ? "text-white" : "text-zinc-900")}>Đơn đăng ký</h2>
          <p className={cn("text-base font-medium", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            Phê duyệt hoặc từ chối các yêu cầu tham gia câu lạc bộ.
          </p>
        </div>

        <div className="flex flex-col gap-2 min-w-[280px]">
          <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Chọn câu lạc bộ</label>
          <div className="relative group/select">
            <select 
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className={cn(
                "w-full appearance-none px-5 py-3.5 pr-12 border rounded-2xl text-sm outline-none transition-all cursor-pointer shadow-inner",
                theme === "dark" 
                  ? "bg-white/5 border-white/10 text-white focus:border-purple-500/50 hover:bg-white/[0.08] hover:border-white/20" 
                  : "bg-white border-zinc-200 text-zinc-900 focus:border-purple-500/50 hover:border-purple-300"
              )}
            >
              {(clubs || []).map((club: any) => (
                <option key={club._id} value={club._id} className={theme === "dark" ? "bg-[#0d0d0d] py-2" : "bg-white py-2"}>
                  {club.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className={cn("absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all pointer-events-none group-focus-within/select:rotate-180", theme === "dark" ? "text-white/20 group-hover/select:text-purple-400" : "text-zinc-400 group-hover/select:text-purple-500")} />
          </div>
        </div>
      </section>

      {/* Stats Mini Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn("p-6 rounded-3xl border flex items-center justify-between group transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.07]" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm")}>
           <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Tổng đơn</p>
              <p className={cn("text-2xl font-black", theme === "dark" ? "text-white" : "text-zinc-900")}>{applications?.length || 0}</p>
           </div>
           <MessageSquare className={cn("w-8 h-8 transition-all", theme === "dark" ? "text-white/10 group-hover:text-white/20" : "text-zinc-200 group-hover:text-zinc-300")} />
        </div>
        
        <div className={cn("p-6 rounded-3xl border flex items-center justify-between group transition-all", theme === "dark" ? "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10" : "bg-amber-50 border-amber-100 hover:bg-amber-100/50 shadow-sm")}>
           <div>
              <p className="text-[10px] font-black uppercase text-amber-500/80 tracking-widest mb-1">Đang chờ</p>
              <p className="text-2xl font-black text-amber-500">
                {applications?.filter((a: any) => a.status === "PENDING").length || 0}
              </p>
           </div>
           <Clock className="w-8 h-8 text-amber-500/20 group-hover:text-amber-500/40 transition-all" />
        </div>

        <div className={cn("p-6 rounded-3xl border flex items-center justify-between group transition-all", theme === "dark" ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50 shadow-sm")}>
           <div>
              <p className="text-[10px] font-black uppercase text-emerald-500/80 tracking-widest mb-1">Thành công</p>
              <p className="text-2xl font-black text-emerald-500">
                {applications?.filter((a: any) => ["APPROVED", "ACCEPTED", "SUCCESS"].includes(a.status)).length || 0}
              </p>
           </div>
           <CheckCircle2 className="w-8 h-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all" />
        </div>

        <div className={cn("p-6 rounded-3xl border flex items-center justify-between group transition-all", theme === "dark" ? "bg-red-500/5 border-red-500/10 hover:bg-red-500/10" : "bg-red-50 border-red-100 hover:bg-red-100/50 shadow-sm")}>
           <div>
              <p className="text-[10px] font-black uppercase text-red-500/80 tracking-widest mb-1">Đã từ chối</p>
              <p className="text-2xl font-black text-red-500">
                {applications?.filter((a: any) => ["REJECTED", "DECLINED"].includes(a.status)).length || 0}
              </p>
           </div>
           <XCircle className="w-8 h-8 text-red-500/20 group-hover:text-red-500/40 transition-all" />
        </div>
      </section>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className={cn("h-32 rounded-[2rem] animate-pulse border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")} />
          ))
        ) : !paginatedApplications || paginatedApplications.length === 0 ? (
          <div className={cn("py-20 text-center rounded-[3rem] border", theme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-zinc-200")}>
             <Inbox className={cn("w-16 h-16 mx-auto mb-4", theme === "dark" ? "text-white/10" : "text-zinc-200")} />
             <p className={cn("font-black uppercase tracking-widest", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Hộp thư trống</p>
          </div>
        ) : (
          paginatedApplications.map((app: any) => (
            <div key={app._id} className={cn(
              "group relative rounded-[2rem] border transition-all duration-500 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6",
              theme === "dark" ? "bg-white/5 border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07]" : "bg-white border-transparent shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] hover:border-purple-300 hover:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)]"
            )}>
              <div className="flex items-center gap-6 flex-1">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl overflow-hidden",
                  theme === "dark" ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 text-purple-400 shadow-lg shadow-purple-900/10" : "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200 text-purple-600 shadow-sm"
                )}>
                   {app.userId?.avatarUrl ? (
                     <img src={app.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                   ) : (
                     app.userId?.fullName?.charAt(0) || "U"
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                    <h3 className={cn("text-lg font-bold transition-colors truncate", theme === "dark" ? "text-white group-hover:text-purple-400" : "text-zinc-900 group-hover:text-purple-600")}>
                      {app.userId?.fullName || "Sinh viên ẩn danh"}
                    </h3>
                    <span className={cn("px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider", theme === "dark" ? "bg-white/5 border-white/5 text-white/40" : "bg-zinc-100 border-zinc-200 text-zinc-500")}>
                      {app.userId?.major || "Chuyên ngành: N/A"}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-4 text-xs font-bold uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
                    <div className={cn("flex items-center gap-1.5", theme === "dark" ? "text-purple-400/80" : "text-purple-600")}>
                      <MessageSquare className="w-3 h-3" />
                      CLB: <span className={theme === "dark" ? "text-white/70" : "text-zinc-700"}>{getClubName(app.clubId)}</span>
                    </div>
                    <span>•</span>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black tracking-tighter",
                      app.status === "PENDING" ? (theme === "dark" ? "bg-amber-500/10 text-amber-500" : "bg-amber-100 text-amber-600") :
                      (app.status === "APPROVED" || app.status === "ACCEPTED" || app.status === "SUCCESS") ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-100 text-emerald-600") :
                      (theme === "dark" ? "bg-red-500/10 text-red-500" : "bg-red-100 text-red-600")
                    )}>
                      {app.status}
                    </div>
                    <span>•</span>
                    <div>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</div>
                  </div>
                  {app.reason && (
                    <p className={cn("mt-3 text-sm line-clamp-1 italic", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
                      "{app.reason}"
                    </p>
                  )}
                  {(app.status === "APPROVED" || app.status === "ACCEPTED") && app.interviewDate && (
                    <div className={cn("mt-2 text-[10px] font-medium flex items-center gap-3", theme === "dark" ? "text-white/30" : "text-zinc-500")}>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(app.interviewDate).toLocaleString("vi-VN")}</span>
                       <span className="flex items-center gap-1">📍 {app.interviewLocation}</span>
                    </div>
                  )}
                  {(app.status === "REJECTED" || app.status === "DECLINED") && app.rejectionReason && (
                    <p className="mt-2 text-[10px] font-medium text-red-500">
                       Lý do: {app.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

               <div className="flex items-center gap-3 shrink-0">
                {app.status === "PENDING" && (
                  <>
                    <button 
                      onClick={() => handleAction(app, "approve")}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg", theme === "dark" ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 shadow-sm")}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button 
                      onClick={() => handleAction(app, "reject")}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border", theme === "dark" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20" : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm")}
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </>
                )}
                 <button 
                  onClick={() => setViewingApp(app)}
                  className={cn("p-3 rounded-xl transition-all group/btn", theme === "dark" ? "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900")}
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn("p-3 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white/40 hover:text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 shadow-sm")}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className={cn("flex items-center gap-1.5 px-4 font-black text-sm tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
              TRANG <span className={theme === "dark" ? "text-white" : "text-zinc-900"}>{currentPage}</span> / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={cn("p-3 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed transition-all", theme === "dark" ? "bg-white/5 border-white/5 text-white/40 hover:text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 shadow-sm")}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-black/80" : "bg-zinc-900/40")} onClick={() => setViewingApp(null)} />
           <div className={cn("relative w-full max-w-2xl border rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl", theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200")}>
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl overflow-hidden",
                      theme === "dark" ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-purple-400" : "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200 text-purple-600 shadow-sm"
                    )}>
                       {viewingApp.userId?.avatarUrl ? (
                         <img src={viewingApp.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         viewingApp.userId?.fullName?.charAt(0) || "U"
                       )}
                    </div>
                    <div>
                       <h3 className={cn("text-2xl font-black uppercase tracking-tight", theme === "dark" ? "text-white" : "text-zinc-900")}>{viewingApp.userId?.fullName}</h3>
                       <p className={cn("font-bold text-sm tracking-widest uppercase", theme === "dark" ? "text-purple-500" : "text-purple-600")}>Đơn đăng ký tham gia</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingApp(null)} className={cn("p-4 rounded-2xl transition-all", theme === "dark" ? "bg-white/5 hover:bg-white/10 text-white/30 hover:text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900")}>
                    <Inbox className="w-6 h-6" />
                 </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-6">
                    <div>
                       <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Thông tin sinh viên</p>
                       <div className="space-y-2">
                          <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white/70" : "text-zinc-700")}><User className={cn("w-4 h-4", theme === "dark" ? "text-purple-500" : "text-purple-600")} /> Chuyên ngành: {viewingApp.userId?.major || "N/A"}</p>
                          <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white/70" : "text-zinc-700")}><Inbox className={cn("w-4 h-4", theme === "dark" ? "text-purple-500" : "text-purple-600")} /> {viewingApp.userId?.email}</p>
                          <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white/70" : "text-zinc-700")}>📞 {viewingApp.userId?.phoneNumber || "N/A"}</p>
                       </div>
                    </div>
                    <div>
                       <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Câu lạc bộ mục tiêu</p>
                       <p className={cn("font-bold border px-4 py-2 rounded-xl inline-block", theme === "dark" ? "bg-white/5 border-white/5 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-900 shadow-sm")}>
                          {getClubName(viewingApp.clubId)}
                       </p>
                    </div>
                 </div>
                 <div>
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Lý do tham gia</p>
                    <div className={cn("p-4 rounded-2xl border text-sm leading-relaxed italic", theme === "dark" ? "bg-white/5 border-white/5 text-white/60" : "bg-zinc-50 border-zinc-200 text-zinc-600 shadow-sm")}>
                       "{viewingApp.reason || "Không có lý do được cung cấp."}"
                    </div>
                 </div>
              </div>

               {/* Actions */}
              {viewingApp.status === "PENDING" ? (
                <div className={cn("flex gap-4 pt-8 border-t", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
                   <button 
                      onClick={() => { handleAction(viewingApp, "approve"); setViewingApp(null); }}
                      className={cn("flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]", theme === "dark" ? "bg-emerald-500 text-[#030303] hover:bg-emerald-400" : "bg-emerald-500 text-white hover:bg-emerald-600")}
                   >
                      <CheckCircle2 className="w-5 h-5" />
                      Duyệt phỏng vấn
                   </button>
                   <button 
                      onClick={() => { handleAction(viewingApp, "reject"); setViewingApp(null); }}
                      className={cn("flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", theme === "dark" ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100")}
                   >
                      <XCircle className="w-5 h-5" />
                      Từ chối
                   </button>
                </div>
              ) : (
                <div className={cn("pt-8 border-t flex flex-col gap-4", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
                   <div className={cn(
                     "p-4 rounded-2xl border flex items-center justify-between",
                     (viewingApp.status === "APPROVED" || viewingApp.status === "ACCEPTED" || viewingApp.status === "SUCCESS") 
                       ? (theme === "dark" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                       : (theme === "dark" ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600")
                   )}>
                      <span className="text-xs font-black uppercase tracking-widest">Trạng thái hiện tại: {viewingApp.status}</span>
                      <CheckCircle2 className="w-5 h-5" />
                   </div>
                   {(viewingApp.status === "APPROVED" || viewingApp.status === "ACCEPTED") && viewingApp.interviewDate && (
                      <div className={cn("p-4 rounded-2xl border space-y-2", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                         <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Lịch phỏng vấn</p>
                         <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white" : "text-zinc-900")}><Clock className={cn("w-4 h-4", theme === "dark" ? "text-purple-500" : "text-purple-600")} /> {new Date(viewingApp.interviewDate).toLocaleString("vi-VN")}</p>
                         <p className={cn("font-medium flex items-center gap-2", theme === "dark" ? "text-white" : "text-zinc-900")}>📍 {viewingApp.interviewLocation}</p>
                         {viewingApp.interviewNote && <p className={cn("text-xs italic", theme === "dark" ? "text-white/50" : "text-zinc-500")}>"{viewingApp.interviewNote}"</p>}
                      </div>
                   )}
                   {(viewingApp.status === "REJECTED" || viewingApp.status === "DECLINED") && viewingApp.rejectionReason && (
                      <div className={cn("p-4 rounded-2xl border space-y-2", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                         <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Lý do từ chối</p>
                         <p className={cn("text-sm italic", theme === "dark" ? "text-white/70" : "text-zinc-600")}>"{viewingApp.rejectionReason}"</p>
                      </div>
                   )}
                </div>
              )}

              {/* Decorative Glow */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
           </div>
        </div>
      )}
      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={actionType === "approve" ? "Duyệt đơn đăng ký" : "Từ chối đơn đăng ký"}
        description={actionType === "approve"
          ? `Cung cấp thông tin phỏng vấn cho ${targetApp?.userId?.fullName}:`
          : `Lý do từ chối đơn của ${targetApp?.userId?.fullName}:`
        }
        confirmText={actionType === "approve" ? "Đồng ý duyệt" : "Từ chối"}
        variant={actionType === "approve" ? "success" : "danger"}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      >
        {actionType === "approve" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Ngày phỏng vấn</label>
              <input 
                type="datetime-local" 
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className={cn("w-full px-4 py-3 border rounded-xl text-sm focus:border-purple-500/50 outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900 shadow-sm")}
              />
            </div>
            <div className="space-y-1.5">
              <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Địa điểm</label>
              <input 
                type="text" 
                placeholder="VD: Phòng A101, Tòa nhà B"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                className={cn("w-full px-4 py-3 border rounded-xl text-sm focus:border-purple-500/50 outline-none transition-all", theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm")}
              />
            </div>
            <div className="space-y-1.5">
              <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Ghi chú (Tùy chọn)</label>
              <textarea 
                placeholder="VD: Vui lòng mang theo CV..."
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                rows={2}
                className={cn("w-full px-4 py-3 border rounded-xl text-sm focus:border-purple-500/50 outline-none transition-all resize-none", theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm")}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-500")}>Lý do từ chối</label>
            <textarea 
              placeholder="Nhập lý do tại đây..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className={cn("w-full px-4 py-3 border rounded-xl text-sm focus:border-purple-500/50 outline-none transition-all resize-none", theme === "dark" ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm")}
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
