"use client";

import React from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Search,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminEvents } from "@/hooks/useAdmin";

export default function EventsManagementPage() {
  const { data: events, isLoading } = useAdminEvents();

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Quản lý sự kiện</h2>
          <p className="text-white/50 text-base font-medium">
            Theo dõi các sự kiện sắp diễn ra, lịch sử hoạt động và báo cáo liên quan.
          </p>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => (
             <div key={i} className="h-48 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : !events || events.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 font-black uppercase tracking-widest">
             Không có sự kiện nào
          </div>
        ) : (
          (events || []).map((event: any) => (
            <div key={event._id} className="group relative rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07] transition-all duration-500 p-8 flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex flex-col items-center justify-center shrink-0">
                 <span className="text-xs font-black uppercase text-white/40 mb-1">Tháng 10</span>
                 <span className="text-3xl font-black text-white">24</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <div className={cn(
                     "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                     event.status === "UPCOMING" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/40 border border-white/5"
                   )}>
                      {event.status}
                   </div>
                   <span className="text-white/20 text-xs">•</span>
                   <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">{event.clubId?.fullName}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-4 line-clamp-1">
                  {event.title}
                </h3>

                <div className="grid grid-cols-2 gap-y-3">
                   <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                      <Clock className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                   </div>
                   <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                      <Users className="w-4 h-4" />
                      {event.participantCount} tham dự
                   </div>
                   <div className="flex items-center gap-2 text-white/40 text-xs font-medium underline decoration-purple-500/30">
                      Chi tiết sự kiện
                      <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 justify-center">
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all" title="Hủy sự kiện">
                    <XCircle className="w-5 h-5" />
                 </button>
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all" title="Duyệt">
                    <CheckCircle2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
