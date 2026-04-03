"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  ShieldAlert, 
  Eye, 
  MessageCircle,
  Heart,
  User,
  ChevronDown,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  HeartOff,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPosts, useAdminClubs, useAdminPostDetail, useAdminUserDetail } from "@/hooks/useAdmin";

export default function ContentModerationPage() {
  const { data: clubs } = useAdminClubs();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  
  const { data: posts, isLoading } = useAdminPosts(selectedClubId || undefined);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Kiểm duyệt nội dung</h2>
          <p className="text-white/50 text-base font-medium">
            Hệ thống giám sát bài viết và duy trì quy tắc cộng đồng toàn mạng lưới.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 w-full xl:w-auto">
          <div className="flex flex-col gap-1.5 min-w-[280px] flex-1 md:flex-initial">
            <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.2em] pl-1 mb-1">Cơ quan chủ quản</span>
            <div className="relative group/select">
              <select 
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full h-[54px] appearance-none px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white focus:border-blue-500/50 outline-none transition-all cursor-pointer hover:bg-white/[0.06] hover:border-white/20 shadow-xl backdrop-blur-sm"
              >
                <option value="" className="bg-[#0a0a0a] py-4">Toàn bộ câu lạc bộ</option>
                {(clubs || []).map((club: any) => (
                  <option key={club._id} value={club._id} className="bg-[#0a0a0a] py-4">
                    {club.fullName}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover/select:text-blue-400 transition-colors">
                <ChevronDown className="w-4 h-4 group-focus-within/select:rotate-180 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : !posts || posts.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-white/5 border-dashed text-white/10">
             <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
             <p className="text-xl font-black uppercase tracking-[0.2em]">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          posts.map((post: any) => (
          <div 
            key={post._id} 
            onClick={() => setViewingPostId(post._id)}
            className="group relative rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.07] transition-all duration-500 p-8 flex flex-col gap-6 overflow-hidden cursor-pointer"
          >
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
               <ArrowUpRight className="w-6 h-6 text-blue-400" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <Layers className="w-5 h-5 text-blue-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 uppercase tracking-tight">
                     {post.title}
                   </h3>
                   <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">
                     ID: {post._id.slice(-8)}
                   </p>
                 </div>
              </div>

              <p className="text-sm text-white/40 leading-relaxed line-clamp-3">
                 {post.content || "Không có nội dung mô tả..."}
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/30 tracking-widest">
                    <Heart className="w-3.5 h-3.5 text-red-500/50" />
                    {post.like || 0}
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/30 tracking-widest">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500/50" />
                    {post.comments?.length || 0}
                 </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">
                 Chi tiết
                 <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Detail Modal */}
    {viewingPostId && (
      <PostDetailModal 
        postId={viewingPostId} 
        onClose={() => setViewingPostId(null)} 
      />
    )}
    </div>
  );
}

function PostDetailModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { data: post, isLoading } = useAdminPostDetail(postId);
  const [viewingLikes, setViewingLikes] = useState(false);

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-20">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
        
        {/* Banner if any - just decorative placeholder for posts */}
        <div className="relative h-48 shrink-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20">
          <div className="absolute inset-0 flex items-center justify-center">
             <MessageSquare className="w-20 h-20 text-white/5" />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-2xl bg-black/50 border border-white/10 text-white/50 hover:bg-black/80 hover:text-white transition-all z-20 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
           {isLoading ? (
             <div className="space-y-6">
                <div className="h-12 w-2/3 bg-white/5 animate-pulse rounded-2xl" />
                <div className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
             </div>
           ) : (
             <>
               <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                     <div className={cn(
                       "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                       post?.isActive 
                         ? "bg-green-500/10 border-green-500/20 text-green-400" 
                         : "bg-red-500/10 border-red-500/20 text-red-400"
                     )}>
                        {post?.isActive ? "Đang hoạt động" : "Đã ẩn"}
                     </div>
                     {post?.tags?.map((tag: string, idx: number) => (
                        <div key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/40 tracking-widest">
                           {tag}
                        </div>
                     ))}
                     <span className="text-white/20 text-xs">•</span>
                     <div className="flex items-center gap-2 text-white/40 text-xs font-semibold">
                        <Calendar className="w-4 h-4" />
                        {post && new Date(post.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                     </div>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[1.1]">
                    {post?.title}
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-5">
                     <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <User className="w-6 h-6 text-blue-400" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Cơ quan chủ quản</p>
                        <p className="text-base text-white/90 font-bold truncate">{post?.clubId?.fullName || "Ẩn danh"}</p>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-tight">{post?.clubId?.category || "Chưa phân loại"}</p>
                     </div>
                  </div>

                  <div 
                    onClick={() => setViewingLikes(true)}
                    className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center gap-5 cursor-pointer hover:bg-white/[0.08] transition-all group/stats"
                  >
                     <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover/stats:scale-110 transition-transform">
                        <Heart className="w-6 h-6 text-red-400" />
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Sự quan tâm</p>
                        <div className="flex items-center justify-between">
                           <p className="text-base text-white/90 font-bold">{post?.like || 0} lượt yêu thích</p>
                           <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/stats:text-red-400 group-hover/stats:translate-x-0.5 group-hover/stats:-translate-y-0.5 transition-all" />
                        </div>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-tight">{post?.likedBy?.length || 0} hồ sơ tương tác</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-3">
                     <div className="h-px flex-1 bg-blue-500/20" />
                     Nội dung bài viết
                     <div className="h-px flex-1 bg-blue-500/20" />
                  </h4>
                  <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-white/60 text-lg leading-relaxed italic">
                     &ldquo;{post?.content}&rdquo;
                  </div>
               </div>

               {post?.images && post.images.length > 0 && (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Hình ảnh đính kèm</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {post.images.map((img: string, idx: number) => (
                           <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-white/10 group/img cursor-zoom-in">
                              <img src={img} alt={`Post img ${idx}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                           </div>
                        ))}
                     </div>
                  </div>
               )}
             </>
           )}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
           <button 
             onClick={onClose}
             className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-lg"
           >
             Đóng
           </button>
        </div>
      </div>
    </div>
      
    {viewingLikes && post?.likedBy && (
      <LikesListModal 
        likes={post.likedBy} 
        onClose={() => setViewingLikes(false)} 
      />
    )}
  </>
  );
}

interface UserLike {
  userId: any;
  likedAt: string;
}

function LikesListModal({ likes, onClose }: { likes: UserLike[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <h3 className="text-xs font-black uppercase text-red-400 tracking-[0.2em] flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Người đã yêu thích ({likes.length})
           </h3>
           <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
              <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3 font-sans">
           {likes.map((item: UserLike, idx: number) => (
              <UserLikeItem key={idx} userId={item.userId} likedAt={item.likedAt} />
           ))}
           {likes.length === 0 && (
             <div className="py-10 text-center space-y-3">
                <HeartOff className="w-10 h-10 text-white/5 mx-auto" />
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Chưa có lượt yêu thích nào</p>
             </div>
           )}
        </div>
        
        <div className="p-4 bg-white/[0.01] border-t border-white/5 flex justify-center">
           <button onClick={onClose} className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-all tracking-[0.3em] py-2 px-4 rounded-xl hover:bg-white/5">
              Đóng danh sách
           </button>
        </div>
      </div>
    </div>
  );
}

function UserLikeItem({ userId, likedAt }: UserLike) {
  const { data: userProfile, isLoading } = useAdminUserDetail(typeof userId === "string" ? userId : undefined);
  
  // Only show name if we have it (either populated or fetched)
  const isPopulated = typeof userId === "object" && userId?.fullName;
  const displayName = isPopulated ? userId.fullName : userProfile?.fullName;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.06] transition-all">
       <div className="w-12 h-12 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 border border-red-500/10 flex items-center justify-center transition-colors shrink-0">
          {isLoading && !isPopulated ? (
             <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          ) : (
             <UserCheck className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
          )}
       </div>
       <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
             {isLoading && !isPopulated ? (
                <div className="w-32 h-4 bg-white/5 animate-pulse rounded-md" />
             ) : (
                <p className="text-sm font-bold text-white/90 truncate group-hover:text-white transition-colors">
                   {displayName || "Người dùng Clubverse"}
                </p>
             )}
          </div>
          <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">
             Tương tác vào {new Date(likedAt).toLocaleString("vi-VN")}
          </p>
       </div>
       <div className="w-1.5 h-1.5 rounded-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors shrink-0" />
    </div>
  );
}
