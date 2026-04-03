"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  ChevronRight,
  ChevronDown,
  Info,
  Building2,
  X,
  UserCheck,
  UserCircle,
  XCircle,
  Hash,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useAdminEvents, 
  useAdminClubs, 
  useAdminEventDetail
} from "@/hooks/useAdmin";

export default function EventsManagementPage() {
  const [selectedClubId, setSelectedClubId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);

  const { data: clubs } = useAdminClubs();
  const { data: events, isLoading } = useAdminEvents(selectedClubId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Quản lý sự kiện</h2>
          <p className="text-white/50 text-base font-medium">
            Giám sát toàn bộ sự kiện đang diễn ra và lịch sử hoạt động trên hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 w-full xl:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 h-[54px] items-center">
             {[
               { id: "all", label: "Tất cả" },
               { id: "upcoming", label: "Sắp diễn ra" },
               { id: "completed", label: "Đã diễn ra" }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setSelectedStatus(tab.id)}
                 className={cn(
                   "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   selectedStatus === tab.id 
                     ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                     : "text-white/30 hover:text-white/60"
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="flex flex-col gap-2 min-w-[280px] flex-1 md:flex-initial">
            <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Lọc theo câu lạc bộ</label>
            <div className="relative group/select">
              <select 
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full h-[54px] appearance-none px-6 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:border-purple-500/50 outline-none transition-all cursor-pointer hover:bg-white/[0.08] hover:border-white/20 shadow-inner"
              >
                <option value="" className="bg-[#0d0d0d] py-2">Tất cả câu lạc bộ</option>
                {(clubs || []).map((club: any) => (
                  <option key={club._id} value={club._id} className="bg-[#0d0d0d] py-2">
                    {club.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/select:text-purple-400 group-focus-within/select:rotate-180 transition-all pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => (
             <div key={i} className="h-48 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : !events || events.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-white/5 border-dashed text-white/10">
             <Calendar className="w-16 h-16 mb-4 opacity-20" />
             <p className="text-xl font-black uppercase tracking-[0.2em]">Không tìm thấy sự kiện nào</p>
          </div>
        ) : (
          (events || [])
            .filter((event: any) => selectedStatus === "all" || event.status === selectedStatus)
            .map((event: any) => {
              const startDate = new Date(event.time);
              const day = startDate.getDate();
              const month = startDate.toLocaleString('vi-VN', { month: 'long' });
              
              return (
                <div 
                  key={event._id} 
                  onClick={() => setViewingEventId(event._id)}
                  className="group relative rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07] transition-all duration-500 p-8 flex flex-col sm:flex-row gap-8 overflow-hidden cursor-pointer selection:bg-purple-500/30"
                >
                <div className="w-full sm:w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                   {event.images?.[0] ? (
                     <>
                       <img src={event.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                       <div className="absolute inset-0 bg-black/40 z-0" />
                     </>
                   ) : (
                     <div className="absolute inset-0 bg-purple-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   )}
                   <span className="text-[10px] font-black uppercase text-white/50 mb-1 z-10">{month}</span>
                   <span className="text-4xl font-black text-white z-10 tracking-tighter">{day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                     <div className={cn(
                       "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                       event.status === "upcoming" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                       event.status === "ongoing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" :
                       "bg-white/5 text-white/40 border-white/5"
                     )}>
                        {event.status}
                     </div>
                     <span className="text-white/10 text-xs">•</span>
                     <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{event.clubId?.fullName}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-5 line-clamp-1 uppercase tracking-tight">
                    {event.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-y-4">
                     <div className="flex items-center gap-2.5 text-white/40 text-xs font-semibold">
                        <Clock className="w-4 h-4 text-purple-500/50" />
                        {startDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="flex items-center gap-2.5 text-white/40 text-xs font-semibold">
                        <MapPin className="w-4 h-4 text-purple-500/50" />
                        <span className="truncate">{event.location}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-white/40 text-xs font-semibold">
                        <Users className="w-4 h-4 text-purple-500/50" />
                        {event.maxParticipants - event.availableSlots} đăng ký
                     </div>
                     <div 
                      className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest group-hover:text-purple-300 transition-colors"
                     >
                        Xem chi tiết
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <EventDetailModal 
        eventId={viewingEventId} 
        onClose={() => setViewingEventId(null)} 
      />
    </div>
  );
}

function EventDetailModal({ eventId, onClose }: { eventId: string | null, onClose: () => void }) {
  const { data: event, isLoading } = useAdminEventDetail(eventId || undefined);

  if (!eventId) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      eventId ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        
        {/* Banner Section */}
        <div className="relative h-72 shrink-0 bg-white/5">
          {event?.images?.[0] ? (
            <img src={event.images[0]} alt="" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
              <Calendar className="w-20 h-20 text-white/5" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-black/50 border border-white/10 text-white/50 hover:text-white transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-10 left-12 right-12">
            <div className="flex items-center gap-3 mb-3">
               <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                   event?.status === "upcoming" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                   event?.status === "ongoing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                   "bg-white/5 text-white/40 border-white/5 text-white/40"
               )}>
                  {event?.status}
               </div>
               <span className="text-white/40 text-sm font-bold flex items-center gap-2">
                 <Building2 className="w-4 h-4 text-purple-500" />
                 {event?.clubId?.fullName}
               </span>
            </div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tight line-clamp-2 leading-[1.1]">{event?.title}</h3>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Info & Description */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-10 border-r border-white/5 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-0.5">Thời gian</p>
                      <p className="text-sm text-white/90 font-bold">
                         {event ? new Date(event.time).toLocaleString("vi-VN") : "---"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-0.5">Đã đăng ký</p>
                      <p className="text-sm text-white/90 font-bold">{event?.joinedUsers?.length || 0} / {event?.maxParticipants || "∞"} học viên</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-5 rounded-3xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-0.5">Địa điểm</p>
                      <p className="text-sm text-white/90 font-bold break-words">{event?.location || "N/A"}</p>
                    </div>
                  </div>
                </div>
             </div>

             <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] flex items-center gap-3">
                   Mô tả sự kiện
                   <div className="h-px flex-1 bg-white/5" />
                </h4>
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 min-h-[150px]">
                   <p className="text-base text-white/60 font-medium leading-[1.8] whitespace-pre-wrap italic">
                    "{event?.description || "Không có mô tả chi tiết."}"
                   </p>
                </div>
             </section>
          </div>

          {/* Right Side: Participant Lists (Audit Tabs style) */}
          <div className="w-full lg:w-[400px] flex flex-col bg-white/[0.01] border-l border-white/5">
             <div className="flex-1 overflow-hidden flex flex-col p-8 no-scrollbar">
                {/* Joined Users */}
                <div className="flex-1 flex flex-col mb-8 overflow-hidden">
                   <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4 flex items-center justify-between">
                      Danh sách tham gia
                      <span className="text-purple-400">({event?.joinedUsers?.length || 0})</span>
                   </h4>
                   <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                      {event?.joinedUsers?.length > 0 ? (
                        event.joinedUsers.map((user: any) => (
                           <div key={user._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-white/30" />
                                 </div>
                                 <div className="overflow-hidden">
                                    <h5 className="text-xs font-bold text-white truncate">{user.fullName}</h5>
                                    <p className="text-[10px] text-white/30 truncate">{user.email}</p>
                                 </div>
                              </div>
                              {user.checkedIn && (
                                <div className="p-1 rounded-full bg-emerald-500/20 border border-emerald-500/30" title="Đã điểm danh">
                                  <UserCheck className="w-3 h-3 text-emerald-400" />
                                </div>
                              )}
                           </div>
                        ))
                      ) : (
                        <div className="py-12 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-white/10">
                           <Users className="w-8 h-8 mb-2 opacity-20" />
                           <p className="text-[9px] font-black uppercase tracking-widest">Trống</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Cancelled Users */}
                <div className="h-[200px] flex flex-col overflow-hidden pt-6 border-t border-white/5 no-scrollbar">
                   <h4 className="text-[10px] font-black uppercase text-red-500/40 tracking-[0.2em] mb-4 flex items-center justify-between">
                      Lịch sử hủy đăng ký
                      <span>({event?.cancelledUsers?.length || 0})</span>
                   </h4>
                   <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                      {event?.cancelledUsers?.length > 0 ? (
                        event.cancelledUsers.map((user: any) => (
                          <div key={user._id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col gap-2">
                             <div className="flex items-center justify-between text-xs font-bold text-white/60">
                                <span className="truncate max-w-[150px]">{user.fullName}</span>
                                <span className="text-red-500/50 text-[9px]">{new Date(user.cancelledAt).toLocaleDateString("vi-VN")}</span>
                             </div>
                             <div className="flex gap-2">
                                <AlertCircle className="w-3 h-3 text-red-500/40 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-white/40 italic leading-relaxed">
                                  {user.reason || "Không có lý do"}
                                </p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center text-white/5">
                           <XCircle className="w-6 h-6 mb-2 opacity-20" />
                           <p className="text-[9px] font-black uppercase tracking-widest">Không có</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
