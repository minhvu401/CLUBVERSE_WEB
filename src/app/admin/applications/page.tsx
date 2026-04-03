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

export default function ApplicationsPage() {
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
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Đơn đăng ký</h2>
          <p className="text-white/50 text-base font-medium">
            Phê duyệt hoặc từ chối các yêu cầu tham gia câu lạc bộ.
          </p>
        </div>

        <div className="flex flex-col gap-2 min-w-[280px]">
          <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Chọn câu lạc bộ</label>
          <div className="relative group/select">
            <select 
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="w-full appearance-none px-5 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-purple-500/50 outline-none transition-all cursor-pointer hover:bg-white/[0.08] hover:border-white/20 shadow-inner"
            >
              {(clubs || []).map((club: any) => (
                <option key={club._id} value={club._id} className="bg-[#0d0d0d] py-2">
                  {club.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/select:text-purple-400 group-focus-within/select:rotate-180 transition-all pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats Mini Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.07] transition-all">
           <div>
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Tổng đơn</p>
              <p className="text-2xl font-black text-white">{applications?.length || 0}</p>
           </div>
           <MessageSquare className="w-8 h-8 text-white/10 group-hover:text-white/20 transition-all" />
        </div>
        
        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between group hover:bg-amber-500/10 transition-all">
           <div>
              <p className="text-[10px] font-black uppercase text-amber-500/50 tracking-widest mb-1">Đang chờ</p>
              <p className="text-2xl font-black text-amber-500">
                {applications?.filter((a: any) => a.status === "PENDING").length || 0}
              </p>
           </div>
           <Clock className="w-8 h-8 text-amber-500/20 group-hover:text-amber-500/40 transition-all" />
        </div>

        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group hover:bg-emerald-500/10 transition-all">
           <div>
              <p className="text-[10px] font-black uppercase text-emerald-500/50 tracking-widest mb-1">Thành công</p>
              <p className="text-2xl font-black text-emerald-500">
                {applications?.filter((a: any) => ["APPROVED", "ACCEPTED", "SUCCESS"].includes(a.status)).length || 0}
              </p>
           </div>
           <CheckCircle2 className="w-8 h-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all" />
        </div>

        <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-center justify-between group hover:bg-red-500/10 transition-all">
           <div>
              <p className="text-[10px] font-black uppercase text-red-500/50 tracking-widest mb-1">Đã từ chối</p>
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
             <div key={i} className="h-32 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : !paginatedApplications || paginatedApplications.length === 0 ? (
          <div className="py-20 text-center rounded-[3rem] bg-white/5 border border-white/10">
             <Inbox className="w-16 h-16 text-white/10 mx-auto mb-4" />
             <p className="text-white/20 font-black uppercase tracking-widest">Hộp thư trống</p>
          </div>
        ) : (
          paginatedApplications.map((app: any) => (
            <div key={app._id} className="group relative rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07] transition-all duration-500 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center font-black text-xl text-purple-400 overflow-hidden shadow-lg shadow-purple-900/10">
                   {app.userId?.avatarUrl ? (
                     <img src={app.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                   ) : (
                     app.userId?.fullName?.charAt(0) || "U"
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                      {app.userId?.fullName || "Sinh viên ẩn danh"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-black uppercase text-white/40 tracking-wider">
                      {app.userId?.major || "Chuyên ngành: N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-white/30 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-purple-400/80">
                      <MessageSquare className="w-3 h-3" />
                      CLB: <span className="text-white/70">{getClubName(app.clubId)}</span>
                    </div>
                    <span>•</span>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black tracking-tighter",
                      app.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
                      (app.status === "APPROVED" || app.status === "ACCEPTED" || app.status === "SUCCESS") ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {app.status}
                    </div>
                    <span>•</span>
                    <div>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</div>
                  </div>
                  {app.reason && (
                    <p className="mt-3 text-sm text-white/50 line-clamp-1 italic">
                      "{app.reason}"
                    </p>
                  )}
                  {(app.status === "APPROVED" || app.status === "ACCEPTED") && app.interviewDate && (
                    <div className="mt-2 text-[10px] font-medium text-white/30 flex items-center gap-3">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(app.interviewDate).toLocaleString("vi-VN")}</span>
                       <span className="flex items-center gap-1">📍 {app.interviewLocation}</span>
                    </div>
                  )}
                  {(app.status === "REJECTED" || app.status === "DECLINED") && app.rejectionReason && (
                    <p className="mt-2 text-[10px] font-medium text-red-400/60">
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
                      className="px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button 
                      onClick={() => handleAction(app, "reject")}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-red-500/20"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </>
                )}
                 <button 
                  onClick={() => setViewingApp(app)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all group/btn"
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
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex items-center gap-1.5 px-4 font-black text-sm tracking-widest text-white/30">
              TRANG <span className="text-white">{currentPage}</span> / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setViewingApp(null)} />
           <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-black text-3xl text-purple-400 overflow-hidden">
                       {viewingApp.userId?.avatarUrl ? (
                         <img src={viewingApp.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         viewingApp.userId?.fullName?.charAt(0) || "U"
                       )}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">{viewingApp.userId?.fullName}</h3>
                       <p className="text-purple-500 font-bold text-sm tracking-widest uppercase">Đơn đăng ký tham gia</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingApp(null)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all">
                    <Inbox className="w-6 h-6" />
                 </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Thông tin sinh viên</p>
                       <div className="space-y-2">
                          <p className="text-white/70 font-medium flex items-center gap-2"><User className="w-4 h-4 text-purple-500" /> Chuyên ngành: {viewingApp.userId?.major || "N/A"}</p>
                          <p className="text-white/70 font-medium flex items-center gap-2"><Inbox className="w-4 h-4 text-purple-500" /> {viewingApp.userId?.email}</p>
                          <p className="text-white/70 font-medium flex items-center gap-2">📞 {viewingApp.userId?.phoneNumber || "N/A"}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Câu lạc bộ mục tiêu</p>
                       <p className="text-white font-bold bg-white/5 border border-white/5 px-4 py-2 rounded-xl inline-block">
                          {getClubName(viewingApp.clubId)}
                       </p>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2">Lý do tham gia</p>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60 leading-relaxed italic">
                       "{viewingApp.reason || "Không có lý do được cung cấp."}"
                    </div>
                 </div>
              </div>

               {/* Actions */}
              {viewingApp.status === "PENDING" ? (
                <div className="flex gap-4 pt-8 border-t border-white/5">
                   <button 
                      onClick={() => { handleAction(viewingApp, "approve"); setViewingApp(null); }}
                      className="flex-1 py-4 rounded-2xl bg-emerald-500 text-[#030303] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                   >
                      <CheckCircle2 className="w-5 h-5" />
                      Duyệt phỏng vấn
                   </button>
                   <button 
                      onClick={() => { handleAction(viewingApp, "reject"); setViewingApp(null); }}
                      className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                   >
                      <XCircle className="w-5 h-5" />
                      Từ chối
                   </button>
                </div>
              ) : (
                <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                   <div className={cn(
                     "p-4 rounded-2xl border flex items-center justify-between",
                     (viewingApp.status === "APPROVED" || viewingApp.status === "ACCEPTED" || viewingApp.status === "SUCCESS") ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                   )}>
                      <span className="text-xs font-black uppercase tracking-widest">Trạng thái hiện tại: {viewingApp.status}</span>
                      <CheckCircle2 className="w-5 h-5" />
                   </div>
                   {(viewingApp.status === "APPROVED" || viewingApp.status === "ACCEPTED") && viewingApp.interviewDate && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                         <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Lịch phỏng vấn</p>
                         <p className="text-white font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /> {new Date(viewingApp.interviewDate).toLocaleString("vi-VN")}</p>
                         <p className="text-white font-medium flex items-center gap-2">📍 {viewingApp.interviewLocation}</p>
                         {viewingApp.interviewNote && <p className="text-white/50 text-xs italic">"{viewingApp.interviewNote}"</p>}
                      </div>
                   )}
                   {(viewingApp.status === "REJECTED" || viewingApp.status === "DECLINED") && viewingApp.rejectionReason && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                         <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Lý do từ chối</p>
                         <p className="text-white/70 text-sm italic">"{viewingApp.rejectionReason}"</p>
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
              <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Ngày phỏng vấn</label>
              <input 
                type="datetime-local" 
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Địa điểm</label>
              <input 
                type="text" 
                placeholder="VD: Phòng A101, Tòa nhà B"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Ghi chú (Tùy chọn)</label>
              <textarea 
                placeholder="VD: Vui lòng mang theo CV..."
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none transition-all resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Lý do từ chối</label>
            <textarea 
              placeholder="Nhập lý do tại đây..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none transition-all resize-none"
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
