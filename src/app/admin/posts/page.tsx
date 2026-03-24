"use client";

import React from "react";
import { 
  MessageSquare, 
  ShieldAlert, 
  Trash2, 
  Eye, 
  MessageCircle,
  Heart,
  User,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAdminPosts, useAdminClubs } from "@/hooks/useAdmin";
import { useState } from "react";

export default function ContentModerationPage() {
  const { data: clubs } = useAdminClubs();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  
  const { data: posts, isLoading } = useAdminPosts(selectedClubId || undefined);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Kiểm duyệt nội dung</h2>
          <p className="text-white/50 text-base font-medium">
            Giám sát các bài viết trên diễn đàn, xử lý báo cáo vi phạm và duy trì quy tắc cộng đồng.
          </p>
        </div>

        {/* Club Selector */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          <label className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Lọc theo câu lạc bộ</label>
          <select 
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-purple-500/50 outline-none transition-all cursor-pointer hover:bg-white/[0.08]"
          >
            <option value="" className="bg-[#030303]">Tất cả câu lạc bộ</option>
            {(clubs || []).map((club: any) => (
              <option key={club._id} value={club._id} className="bg-[#030303]">
                {club.fullName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className="h-24 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : !posts || posts.length === 0 ? (
           <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest">
              Không tìm thấy bài viết nào
           </div>
        ) : (
          posts.map((post: any) => (
          <div key={post._id} className="group relative rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.07] transition-all duration-500 p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                 <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   {post.status === "Reported" && (
                     <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-wider">
                        <ShieldAlert className="w-3 h-3" />
                        Đã báo cáo
                     </div>
                   )}
                   <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                     {post.title}
                   </h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-white/30 tracking-widest">
                   <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                   </div>
                   <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                   </div>
                   <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <Eye className="w-4 h-4" />
               </button>
               <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
}
