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
import { useAdminStore } from "@/store/adminStore";

export default function EventsManagementPage() {
  const { theme } = useAdminStore();
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
          <h2 className={cn("text-4xl font-black tracking-tight mb-2 uppercase", theme === "dark" ? "text-white" : "text-zinc-900")}>Quản lý sự kiện</h2>
          <p className={cn("text-base font-medium", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            Giám sát toàn bộ sự kiện đang diễn ra và lịch sử hoạt động trên hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 w-full xl:w-auto">
          {/* Status Filter Tabs */}
          <div className={cn("flex p-1.5 rounded-2xl border h-[54px] items-center", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100/80 border-zinc-200 shadow-inner")}>
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
                     ? (theme === "dark" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "bg-white text-teal-600 shadow-md border border-teal-100")
                     : (theme === "dark" ? "text-white/30 hover:text-white/60" : "text-zinc-500 hover:text-zinc-900 hover:bg-teal-50")
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="flex flex-col gap-2 min-w-[280px] flex-1 md:flex-initial">
            <label className={cn("text-[10px] font-black uppercase tracking-widest pl-1", theme === "dark" ? "text-white/30" : "text-zinc-400")}>Lọc theo câu lạc bộ</label>
            <div className="relative group/select">
              <select 
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className={cn(
                  "w-full h-[54px] appearance-none px-6 py-3.5 pr-12 border rounded-2xl text-sm outline-none transition-all cursor-pointer shadow-inner",
                  theme === "dark" 
                    ? "bg-white/5 border-white/10 text-white focus:border-purple-500/50 hover:bg-white/[0.08] hover:border-white/20" 
                    : "bg-white border-zinc-200 text-zinc-900 focus:border-teal-500/50 hover:border-teal-300"
                )}
              >
                <option value="" className={theme === "dark" ? "bg-[#0d0d0d] py-2" : "bg-white py-2"}>Tất cả câu lạc bộ</option>
                {(clubs || []).map((club: any) => (
                  <option key={club._id} value={club._id} className={theme === "dark" ? "bg-[#0d0d0d] py-2" : "bg-white py-2"}>
                    {club.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className={cn("absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all pointer-events-none group-focus-within/select:rotate-180", theme === "dark" ? "text-white/20 group-hover/select:text-purple-400" : "text-zinc-400 group-hover/select:text-teal-500")} />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => (
             <div key={i} className={cn("h-48 rounded-[2.5rem] animate-pulse border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")} />
          ))
        ) : !events || events.length === 0 ? (
          <div className={cn("col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-dashed", theme === "dark" ? "border-white/5 text-white/10" : "border-zinc-200 text-zinc-300")}>
             <Calendar className={cn("w-16 h-16 mb-4", theme === "dark" ? "opacity-20" : "opacity-50")} />
             <p className="text-xl font-black uppercase tracking-[0.2em] opacity-80">Không tìm thấy sự kiện nào</p>
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
                  className={cn(
                    "group relative rounded-[2.5rem] border transition-all duration-500 p-8 flex flex-col sm:flex-row gap-8 overflow-hidden cursor-pointer selection:bg-purple-500/30",
                    theme === "dark" ? "bg-white/5 border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07]" : "bg-white border-transparent hover:border-teal-300 hover:shadow-[0_4px_20px_-4px_rgba(20,184,166,0.1)]"
                  )}
                >
                <div className={cn(
                  "w-full sm:w-32 h-32 rounded-3xl border flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden",
                  theme === "dark" ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/10" : "bg-teal-50 border-teal-100"
                )}>
                   {event.images?.[0] ? (
                     <>
                       <img src={event.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                       <div className={cn("absolute inset-0 z-0", theme === "dark" ? "bg-black/40" : "bg-teal-900/10")} />
                     </>
                   ) : (
                     <div className={cn("absolute inset-0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity", theme === "dark" ? "bg-purple-500/5" : "bg-teal-500/10")} />
                   )}
                   <span className={cn("text-[10px] font-black uppercase mb-1 z-10", theme === "dark" ? "text-white/50" : "text-teal-600/70")}>{month}</span>
                   <span className={cn("text-4xl font-black z-10 tracking-tighter", theme === "dark" ? "text-white" : "text-teal-700")}>{day}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                     <div className={cn(
                       "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                       event.status === "upcoming" ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") : 
                       event.status === "ongoing" ? (theme === "dark" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" : "bg-blue-50 text-blue-600 border-blue-200 animate-pulse") :
                       (theme === "dark" ? "bg-white/5 text-white/40 border-white/5" : "bg-zinc-100 text-zinc-500 border-zinc-200")
                     )}>
                        {event.status}
                     </div>
                     <span className={cn("text-xs", theme === "dark" ? "text-white/10" : "text-zinc-300")}>•</span>
                     <span className={cn("text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]", theme === "dark" ? "text-purple-400" : "text-teal-600")}>{event.clubId?.fullName}</span>
                  </div>
                  
                  <h3 className={cn(
                    "text-xl font-bold transition-colors mb-5 line-clamp-1 uppercase tracking-tight",
                    theme === "dark" ? "text-white group-hover:text-purple-400" : "text-zinc-900 group-hover:text-teal-600"
                  )}>
                    {event.title}
                  </h3>


                  <div className="grid grid-cols-2 gap-y-4">
                     <div className={cn("flex items-center gap-2.5 text-xs font-semibold", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                        <Clock className={cn("w-4 h-4", theme === "dark" ? "text-purple-500/50" : "text-teal-500/80")} />
                        {startDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className={cn("flex items-center gap-2.5 text-xs font-semibold", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                        <MapPin className={cn("w-4 h-4", theme === "dark" ? "text-purple-500/50" : "text-teal-500/80")} />
                        <span className="truncate">{event.location}</span>
                     </div>
                     <div className={cn("flex items-center gap-2.5 text-xs font-semibold", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                        <Users className={cn("w-4 h-4", theme === "dark" ? "text-purple-500/50" : "text-teal-500/80")} />
                        {event.maxParticipants - event.availableSlots} đăng ký
                     </div>
                     <div 
                      className={cn(
                        "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors",
                        theme === "dark" ? "text-purple-400 group-hover:text-purple-300" : "text-teal-600 group-hover:text-teal-500"
                      )}
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
  const { theme } = useAdminStore();
  const { data: event, isLoading } = useAdminEventDetail(eventId || undefined);

  if (!eventId) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      eventId ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className={cn("absolute inset-0 backdrop-blur-xl", theme === "dark" ? "bg-[#030303]/90" : "bg-zinc-900/60")} onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-5xl border rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]",
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-teal-500/10"
      )}>
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        
        {/* Banner Section */}
        <div className={cn("relative h-72 shrink-0 flex flex-col justify-end", theme === "dark" ? "bg-white/5" : "bg-teal-50")}>
          {event?.images?.[0] ? (
            <img src={event.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
          ) : (
            <div className={cn("absolute inset-0 w-full h-full flex items-center justify-center", theme === "dark" ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10" : "bg-gradient-to-br from-teal-500/10 to-emerald-500/10")}>
              <Calendar className={cn("w-20 h-20", theme === "dark" ? "text-white/5" : "text-teal-900/5")} />
            </div>
          )}
          <div className={cn("absolute inset-0", theme === "dark" ? "bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" : "bg-gradient-to-t from-white via-white/80 to-white/10")} />
          
          <button 
            onClick={onClose}
            className={cn(
              "absolute top-6 right-6 p-2 rounded-xl transition-all z-20",
              theme === "dark" ? "bg-black/50 border border-white/10 text-white/50 hover:text-white" : "bg-white/50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm"
            )}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 bottom-10 px-12">
            <div className="flex items-center gap-3 mb-3">
               <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                   event?.status === "upcoming" ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200") : 
                   event?.status === "ongoing" ? (theme === "dark" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200") :
                   (theme === "dark" ? "bg-white/5 text-white/40 border-white/5" : "bg-zinc-100 text-zinc-500 border-zinc-200")
               )}>
                  {event?.status}
               </div>
               <span className={cn("text-sm font-bold flex items-center gap-2", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                 <Building2 className={cn("w-4 h-4", theme === "dark" ? "text-purple-500" : "text-teal-600")} />
                 {event?.clubId?.fullName}
               </span>
            </div>
            <h3 className={cn("text-4xl font-black uppercase tracking-tight line-clamp-2 leading-[1.1]", theme === "dark" ? "text-white" : "text-zinc-900")}>{event?.title}</h3>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Info & Description */}
          <div className={cn("flex-1 overflow-y-auto no-scrollbar p-10 border-r space-y-10", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("p-5 rounded-3xl border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl border", theme === "dark" ? "bg-purple-500/10 border-purple-500/20" : "bg-white border-teal-100")}>
                      <Clock className={cn("w-5 h-5", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Thời gian</p>
                      <p className={cn("text-sm font-bold", theme === "dark" ? "text-white/90" : "text-zinc-900")}>
                         {event ? new Date(event.time).toLocaleString("vi-VN") : "---"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cn("p-5 rounded-3xl border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl border", theme === "dark" ? "bg-purple-500/10 border-purple-500/20" : "bg-white border-teal-100")}>
                      <Users className={cn("w-5 h-5", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Đã đăng ký</p>
                      <p className={cn("text-sm font-bold", theme === "dark" ? "text-white/90" : "text-zinc-900")}>{event?.joinedUsers?.length || 0} / {event?.maxParticipants || "∞"} học viên</p>
                    </div>
                  </div>
                </div>

                <div className={cn("md:col-span-2 p-5 rounded-3xl border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl border", theme === "dark" ? "bg-purple-500/10 border-purple-500/20" : "bg-white border-teal-100")}>
                      <MapPin className={cn("w-5 h-5", theme === "dark" ? "text-purple-400" : "text-teal-600")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Địa điểm</p>
                      <p className={cn("text-sm font-bold break-words", theme === "dark" ? "text-white/90" : "text-zinc-900")}>{event?.location || "N/A"}</p>
                    </div>
                  </div>
                </div>
             </div>

             <section className="space-y-4">
                <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                   Mô tả sự kiện
                   <div className={cn("h-px flex-1", theme === "dark" ? "bg-white/5" : "bg-zinc-200")} />
                </h4>
                <div className={cn("p-8 rounded-[2rem] border min-h-[150px]", theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white border-zinc-200")}>
                   <p className={cn("text-base font-medium leading-[1.8] whitespace-pre-wrap italic", theme === "dark" ? "text-white/60" : "text-zinc-600")}>
                    "{event?.description || "Không có mô tả chi tiết."}"
                   </p>
                </div>
             </section>

          </div>

          {/* Right Side: Participant Lists (Audit Tabs style) */}
          {/* Right Side: Participant Lists (Audit Tabs style) */}
          <div className={cn("w-full lg:w-[400px] flex flex-col border-l", theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-zinc-50 border-zinc-100")}>
             <div className="flex-1 overflow-hidden flex flex-col p-8 no-scrollbar">
                {/* Joined Users */}
                <div className="flex-1 flex flex-col mb-8 overflow-hidden">
                   <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center justify-between", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                      Danh sách tham gia
                      <span className={theme === "dark" ? "text-purple-400" : "text-teal-600"}>({event?.joinedUsers?.length || 0})</span>
                   </h4>
                   <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                      {event?.joinedUsers?.length > 0 ? (
                        event.joinedUsers.map((user: any) => (
                           <div key={user._id} className={cn("p-4 rounded-2xl border flex items-center justify-between group transition-all", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-white border-zinc-200 hover:border-teal-200 shadow-sm")}>
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <div className={cn("w-8 h-8 rounded-lg border shrink-0 overflow-hidden flex items-center justify-center", theme === "dark" ? "bg-white/10 border-white/10" : "bg-teal-50 border-teal-100")}>
                                    <UserCircle className={cn("w-5 h-5", theme === "dark" ? "text-white/30" : "text-teal-500")} />
                                 </div>
                                 <div className="overflow-hidden">
                                    <h5 className={cn("text-xs font-bold truncate", theme === "dark" ? "text-white" : "text-zinc-900")}>{user.fullName}</h5>
                                    <p className={cn("text-[10px] truncate", theme === "dark" ? "text-white/30" : "text-zinc-500")}>{user.email}</p>
                                 </div>
                              </div>
                              {user.checkedIn && (
                                <div className={cn("p-1 rounded-full border", theme === "dark" ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")} title="Đã điểm danh">
                                  <UserCheck className={cn("w-3 h-3", theme === "dark" ? "text-emerald-400" : "text-emerald-600")} />
                                </div>
                              )}
                           </div>
                        ))
                      ) : (
                        <div className={cn("py-12 border border-dashed rounded-3xl flex flex-col items-center justify-center", theme === "dark" ? "border-white/5 text-white/10" : "border-zinc-200 text-zinc-300")}>
                           <Users className="w-8 h-8 mb-2 opacity-20" />
                           <p className="text-[9px] font-black uppercase tracking-widest">Trống</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Cancelled Users */}
                <div className={cn("h-[200px] flex flex-col overflow-hidden pt-6 border-t no-scrollbar", theme === "dark" ? "border-white/5" : "border-zinc-200")}>
                   <h4 className="text-[10px] font-black uppercase text-red-500/60 tracking-[0.2em] mb-4 flex items-center justify-between">
                      Lịch sử hủy đăng ký
                      <span>({event?.cancelledUsers?.length || 0})</span>
                   </h4>
                   <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                      {event?.cancelledUsers?.length > 0 ? (
                        event.cancelledUsers.map((user: any) => (
                          <div key={user._id} className={cn("p-4 rounded-2xl border flex flex-col gap-2", theme === "dark" ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-200 shadow-sm")}>
                             <div className={cn("flex items-center justify-between text-xs font-bold", theme === "dark" ? "text-white/60" : "text-zinc-700")}>
                                <span className="truncate max-w-[150px]">{user.fullName}</span>
                                <span className="text-red-500/50 text-[9px]">{new Date(user.cancelledAt).toLocaleDateString("vi-VN")}</span>
                             </div>
                             <div className="flex gap-2">
                                <AlertCircle className="w-3 h-3 text-red-500/60 shrink-0 mt-0.5" />
                                <p className={cn("text-[10px] italic leading-relaxed", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                                  {user.reason || "Không có lý do"}
                                </p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className={cn("py-8 flex flex-col items-center justify-center", theme === "dark" ? "text-white/5" : "text-zinc-300")}>
                           <XCircle className="w-6 h-6 mb-2 opacity-20" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-inherit">Không có</p>
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
