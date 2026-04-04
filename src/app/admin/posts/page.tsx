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
import { useAdminStore } from "@/store/adminStore";

export default function ContentModerationPage() {
  const { theme } = useAdminStore();
  const { data: clubs } = useAdminClubs();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  
  const { data: posts, isLoading } = useAdminPosts(selectedClubId || undefined);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col xl:flex-row justify-between items-end gap-6">
        <div>
          <h2 className={cn("text-4xl font-black tracking-tight mb-2 uppercase", theme === "dark" ? "text-white" : "text-zinc-900")}>Kiểm duyệt nội dung</h2>
          <p className={cn("text-base font-medium", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            Hệ thống giám sát bài viết và duy trì quy tắc cộng đồng toàn mạng lưới.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 w-full xl:w-auto">
          <div className="flex flex-col gap-1.5 min-w-[280px] flex-1 md:flex-initial">
            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] pl-1 mb-1", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Cơ quan chủ quản</span>
            <div className="relative group/select">
              <select 
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className={cn(
                  "w-full h-[54px] appearance-none px-6 py-3 border rounded-2xl text-sm outline-none transition-all cursor-pointer backdrop-blur-sm shadow-inner",
                  theme === "dark" 
                    ? "bg-white/[0.03] border-white/10 text-white focus:border-blue-500/50 hover:bg-white/[0.06] hover:border-white/20" 
                    : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 hover:border-blue-300 shadow-sm"
                )}
              >
                <option value="" className={theme === "dark" ? "bg-[#0a0a0a] py-4" : "bg-white py-4"}>Toàn bộ câu lạc bộ</option>
                {(clubs || []).map((club: any) => (
                  <option key={club._id} value={club._id} className={theme === "dark" ? "bg-[#0a0a0a] py-4" : "bg-white py-4"}>
                    {club.fullName}
                  </option>
                ))}
              </select>
              <div className={cn("absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors", theme === "dark" ? "text-white/20 group-hover/select:text-blue-400" : "text-zinc-400 group-hover/select:text-blue-500")}>
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
             <div key={i} className={cn("h-64 rounded-[2.5rem] animate-pulse border", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-100 border-zinc-200")} />
          ))
        ) : !posts || posts.length === 0 ? (
          <div className={cn("col-span-full py-24 flex flex-col items-center justify-center rounded-[3rem] border border-dashed", theme === "dark" ? "border-white/5 text-white/10" : "border-zinc-200 text-zinc-300")}>
             <MessageSquare className={cn("w-16 h-16 mb-4", theme === "dark" ? "opacity-20" : "opacity-50")} />
             <p className="text-xl font-black uppercase tracking-[0.2em] opacity-80">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          posts.map((post: any) => (
          <div 
            key={post._id} 
            onClick={() => setViewingPostId(post._id)}
            className={cn(
              "group relative rounded-[2.5rem] border transition-all duration-500 p-8 flex flex-col gap-6 overflow-hidden cursor-pointer",
              theme === "dark" ? "bg-white/5 border-white/5 hover:border-blue-500/20 hover:bg-white/[0.07]" : "bg-white border-transparent hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] shadow-sm"
            )}
          >
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
               <ArrowUpRight className={cn("w-6 h-6", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                 <div className={cn("p-3 rounded-2xl border", theme === "dark" ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100")}>
                    <Layers className={cn("w-5 h-5", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className={cn(
                     "text-lg font-bold transition-colors line-clamp-1 uppercase tracking-tight",
                     theme === "dark" ? "text-white group-hover:text-blue-400" : "text-zinc-900 group-hover:text-blue-600"
                   )}>
                     {post.title}
                   </h3>
                   <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/20" : "text-zinc-400")}>
                     ID: {post._id.slice(-8)}
                   </p>
                 </div>
              </div>

              <p className={cn("text-sm leading-relaxed line-clamp-3", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                 {post.content || "Không có nội dung mô tả..."}
              </p>
            </div>

            <div className={cn("pt-6 border-t flex items-center justify-between", theme === "dark" ? "border-white/5" : "border-zinc-100")}>
              <div className="flex items-center gap-4">
                 <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
                    <Heart className="w-3.5 h-3.5 text-red-500/50" />
                    {post.like || 0}
                 </div>
                 <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500/50" />
                    {post.comments?.length || 0}
                 </div>
              </div>

              <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]", theme === "dark" ? "text-blue-400" : "text-blue-600")}>
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
  const { theme } = useAdminStore();
  const { data: post, isLoading } = useAdminPostDetail(postId);
  const [viewingLikes, setViewingLikes] = useState(false);

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-20">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className={cn("absolute inset-0 backdrop-blur-xl", theme === "dark" ? "bg-[#030303]/90" : "bg-zinc-900/60")} onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-4xl border rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]",
        theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200"
      )}>

        
        {/* Banner if any - just decorative placeholder for posts */}
        <div className={cn("relative h-48 shrink-0", theme === "dark" ? "bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" : "bg-gradient-to-br from-blue-500/10 via-white to-blue-400/5")}>
          <div className="absolute inset-0 flex items-center justify-center">
             <MessageSquare className={cn("w-20 h-20", theme === "dark" ? "text-white/5" : "text-blue-900/5")} />
          </div>
          <button 
            onClick={onClose}
            className={cn(
              "absolute top-8 right-8 p-3 rounded-2xl border transition-all z-20 group",
              theme === "dark" ? "bg-black/50 border-white/10 text-white/50 hover:bg-black/80 hover:text-white" : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            )}
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
           {isLoading ? (
             <div className="space-y-6">
                <div className={cn("h-12 w-2/3 animate-pulse rounded-2xl", theme === "dark" ? "bg-white/5" : "bg-zinc-100")} />
                <div className={cn("h-32 w-full animate-pulse rounded-2xl", theme === "dark" ? "bg-white/5" : "bg-zinc-100")} />
             </div>
           ) : (
             <>
               <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                     <div className={cn(
                       "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                       post?.isActive 
                         ? (theme === "dark" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-green-50 border-green-200 text-green-600")
                         : (theme === "dark" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600")
                     )}>
                        {post?.isActive ? "Đang hoạt động" : "Đã ẩn"}
                     </div>
                     {post?.tags?.map((tag: string, idx: number) => (
                        <div key={idx} className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "bg-white/5 border-white/10 text-white/40" : "bg-zinc-100 border-zinc-200 text-zinc-500")}>
                           {tag}
                        </div>
                     ))}
                     <span className={cn("text-xs", theme === "dark" ? "text-white/20" : "text-zinc-300")}>•</span>
                     <div className={cn("flex items-center gap-2 text-xs font-semibold", theme === "dark" ? "text-white/40" : "text-zinc-500")}>
                        <Calendar className="w-4 h-4" />
                        {post && new Date(post.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                     </div>
                  </div>
                  <h2 className={cn("text-4xl font-black tracking-tighter uppercase leading-[1.1]", theme === "dark" ? "text-white" : "text-zinc-900")}>
                    {post?.title}
                  </h2>
               </div>


               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={cn("p-6 rounded-[2rem] border flex items-center gap-5", theme === "dark" ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-200")}>
                     <div className={cn("p-4 rounded-2xl border", theme === "dark" ? "bg-blue-500/10 border-blue-500/20" : "bg-white border-blue-100")}>
                        <User className={cn("w-6 h-6", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-white/20" : "text-zinc-500")}>Cơ quan chủ quản</p>
                        <p className={cn("text-base font-bold truncate", theme === "dark" ? "text-white/90" : "text-zinc-900")}>{post?.clubId?.fullName || "Ẩn danh"}</p>
                        <p className={cn("text-[10px] font-medium uppercase tracking-tight", theme === "dark" ? "text-white/40" : "text-zinc-500")}>{post?.clubId?.category || "Chưa phân loại"}</p>
                     </div>
                  </div>

                  <div 
                    onClick={() => setViewingLikes(true)}
                    className={cn("p-6 rounded-[2rem] border flex items-center gap-5 cursor-pointer transition-all group/stats", theme === "dark" ? "bg-white/5 border-white/5 hover:bg-white/[0.08]" : "bg-zinc-50 border-zinc-200 hover:bg-blue-50 hover:border-blue-200")}
                  >
                     <div className={cn("p-4 rounded-2xl border group-hover/stats:scale-110 transition-transform", theme === "dark" ? "bg-red-500/10 border-red-500/20" : "bg-white border-red-100")}>
                        <Heart className={cn("w-6 h-6", theme === "dark" ? "text-red-400" : "text-red-500")} />
                     </div>
                     <div className="flex-1">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", theme === "dark" ? "text-white/20" : "text-zinc-500")}>Sự quan tâm</p>
                        <div className="flex items-center justify-between">
                           <p className={cn("text-base font-bold", theme === "dark" ? "text-white/90" : "text-zinc-900")}>{post?.like || 0} lượt yêu thích</p>
                           <ArrowUpRight className={cn("w-4 h-4 group-hover/stats:translate-x-0.5 group-hover/stats:-translate-y-0.5 transition-all", theme === "dark" ? "text-white/20 group-hover/stats:text-red-400" : "text-zinc-400 group-hover/stats:text-red-500")} />
                        </div>
                        <p className={cn("text-[10px] font-medium uppercase tracking-tight", theme === "dark" ? "text-white/40" : "text-zinc-500")}>{post?.likedBy?.length || 0} hồ sơ tương tác</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3", theme === "dark" ? "text-blue-400" : "text-blue-600")}>
                     <div className={cn("h-px flex-1", theme === "dark" ? "bg-blue-500/20" : "bg-blue-200")} />
                     Nội dung bài viết
                     <div className={cn("h-px flex-1", theme === "dark" ? "bg-blue-500/20" : "bg-blue-200")} />
                  </h4>
                  <div className={cn("p-8 rounded-[2rem] border text-lg leading-relaxed italic", theme === "dark" ? "bg-white/[0.02] border-white/5 text-white/60" : "bg-white border-zinc-200 text-zinc-600")}>
                     &ldquo;{post?.content}&rdquo;
                  </div>
               </div>

               {post?.images && post.images.length > 0 && (
                  <div className="space-y-4">
                     <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", theme === "dark" ? "text-blue-400" : "text-blue-600")}>Hình ảnh đính kèm</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {post.images.map((img: string, idx: number) => (
                           <div key={idx} className={cn("aspect-square rounded-3xl overflow-hidden border group/img cursor-zoom-in", theme === "dark" ? "border-white/10" : "border-zinc-200 shadow-sm")}>
                              <img src={img} alt={`Post img ${idx}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                           </div>
                        ))}
                     </div>
                  </div>
               )}
             </>
           )}
        </div>

        <div className={cn("p-8 border-t flex justify-end gap-4", theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-zinc-100 bg-zinc-50")}>
           <button 
             onClick={onClose}
             className={cn("px-8 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-lg", theme === "dark" ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm")}
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
  const { theme } = useAdminStore();
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={cn("absolute inset-0 backdrop-blur-md", theme === "dark" ? "bg-black/80" : "bg-zinc-900/40")} onClick={onClose} />
      <div className={cn("relative w-full max-w-lg border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]", theme === "dark" ? "bg-[#0d0d0d] border-white/10" : "bg-white border-zinc-200")}>
        <div className={cn("p-6 border-b flex items-center justify-between", theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-zinc-100 bg-zinc-50")}>
           <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", theme === "dark" ? "text-red-400" : "text-red-500")}>
              <Heart className="w-4 h-4" />
              Người đã yêu thích ({likes.length})
           </h3>
           <button onClick={onClose} className={cn("p-2 rounded-xl transition-all", theme === "dark" ? "hover:bg-white/5 text-white/20 hover:text-white" : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900")}>
              <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3 font-sans">
           {likes.map((item: UserLike, idx: number) => (
              <UserLikeItem key={idx} userId={item.userId} likedAt={item.likedAt} theme={theme} />
           ))}
           {likes.length === 0 && (
             <div className="py-10 text-center space-y-3">
                <HeartOff className={cn("w-10 h-10 mx-auto", theme === "dark" ? "text-white/5" : "text-zinc-200")} />
                <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === "dark" ? "text-white/20" : "text-zinc-400")}>Chưa có lượt yêu thích nào</p>
             </div>
           )}
        </div>
        
        <div className={cn("p-4 border-t flex justify-center", theme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-white border-zinc-100")}>
           <button onClick={onClose} className={cn("text-[9px] font-black uppercase transition-all tracking-[0.3em] py-2 px-4 rounded-xl", theme === "dark" ? "text-white/30 hover:text-white hover:bg-white/5" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}>
              Đóng danh sách
           </button>
        </div>
      </div>
    </div>
  );
}

function UserLikeItem({ userId, likedAt, theme }: UserLike & { theme?: string }) {
  const { data: userProfile, isLoading } = useAdminUserDetail(typeof userId === "string" ? userId : undefined);
  
  // Only show name if we have it (either populated or fetched)
  const isPopulated = typeof userId === "object" && userId?.fullName;
  const displayName = isPopulated ? userId.fullName : userProfile?.fullName;

  return (
    <div className={cn("p-4 rounded-2xl border flex items-center gap-4 group transition-all", theme === "dark" ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]" : "bg-white border-zinc-100 hover:bg-zinc-50 shadow-sm")}>
       <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0", theme === "dark" ? "bg-red-500/5 group-hover:bg-red-500/10 border-red-500/10" : "bg-red-50/50 group-hover:bg-red-50 border-red-100")}>
          {isLoading && !isPopulated ? (
             <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          ) : (
             <UserCheck className={cn("w-6 h-6 transition-transform group-hover:scale-110", theme === "dark" ? "text-red-400" : "text-red-500")} />
          )}
       </div>
       <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
             {isLoading && !isPopulated ? (
                <div className={cn("w-32 h-4 animate-pulse rounded-md", theme === "dark" ? "bg-white/5" : "bg-zinc-100")} />
             ) : (
                <p className={cn("text-sm font-bold truncate transition-colors", theme === "dark" ? "text-white/90 group-hover:text-white" : "text-zinc-900 group-hover:text-red-600")}>
                   {displayName || "Người dùng Clubverse"}
                </p>
             )}
          </div>
          <p className={cn("text-[9px] uppercase font-black tracking-widest", theme === "dark" ? "text-white/30" : "text-zinc-400")}>
             Tương tác vào {new Date(likedAt).toLocaleString("vi-VN")}
          </p>
       </div>
       <div className={cn("w-1.5 h-1.5 rounded-full transition-colors shrink-0", theme === "dark" ? "bg-red-500/20 group-hover:bg-red-500/50" : "bg-red-300 group-hover:bg-red-500")} />
    </div>
  );
}
