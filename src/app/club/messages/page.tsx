"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders";
import Header from "@/app/layout/header/page";
import { cn } from "@/lib/utils"; // Fallback to raw if not exists
import {
  MessageSquare,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Send,
  Paperclip,
  Smile,
  Mic,
  Users,
  BellOff,
  UserPlus,
  Trash2,
  ChevronLeft,
  Pin
} from "lucide-react";

import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsReadAll,
  muteConversation,
  unmuteConversation,
  type ConversationData,
  type MessageData,
} from "@/app/services/api/messages";
import { AUTH_BASE_URL } from "@/app/services/api/auth";

export default function ClubMessagesPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendError, setSendError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");

    const fetchConvs = async () => {
      try {
        const data = await getConversations(token);
        // Deduplicate: keep only the latest conversation per unique participant set
        const seen = new Map<string, ConversationData>();
        for (const conv of data) {
          const key = conv.isGroup
            ? conv._id  // groups are unique by ID
            : (conv.participants?.map(p => p._id).sort().join(",") || conv._id);
          const existing = seen.get(key);
          if (!existing || (conv.lastMessageTime && (!existing.lastMessageTime || conv.lastMessageTime > existing.lastMessageTime))) {
            seen.set(key, conv);
          }
        }
        const deduped = Array.from(seen.values());
        setConversations(deduped);
        if (deduped.length > 0 && !activeConvId) {
          setActiveConvId(deduped[0]._id);
        }
      } catch (err) {
        console.warn("Khởi tạo cuộc trò chuyện thất bại (Server có thể đang ngủ):", err);
      }
    };
    fetchConvs();

    // Poll conversations list to keep sidebar up to date  
    const convInterval = setInterval(fetchConvs, 8000);
    return () => clearInterval(convInterval);
  }, [loading, token]);

  useEffect(() => {
    if (!token || !activeConvId) return;

    const fetchMsgs = async () => {
      try {
        const data = await getMessages(token, activeConvId);
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (err) {
        console.warn("Lỗi tải tin nhắn (Server có thể đang ngủ):", err);
      }
    };
    fetchMsgs();
    
    // Polling simulation
    const interval = setInterval(fetchMsgs, 5000);
    return () => clearInterval(interval);
  }, [token, activeConvId]);

  // When selecting a conversation: load messages & mark as read
  const handleSelectConv = async (convId: string) => {
    setActiveConvId(convId);
    setSendError("");
    if (token) {
      markConversationAsReadAll(token, convId)
        .then(() => {
          // Update local unreadCount to 0
          setConversations(prev =>
            prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c)
          );
        })
        .catch(() => {});
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !token) return;

    const content = inputText;
    setInputText("");
    setSendError("");

    try {
      const newMsg = await sendMessage(token, {
        conversationId: activeConvId,
        content,
      });
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Send error", err);
      setSendError("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleMuteToggle = async (conv: ConversationData) => {
    if (!token) return;
    try {
      if (conv.isMuted) {
        await unmuteConversation(token, conv._id);
      } else {
        await muteConversation(token, conv._id);
      }
      setConversations(prev =>
        prev.map(c => c._id === conv._id ? { ...c, isMuted: !c.isMuted } : c)
      );
    } catch (err) {
      console.warn("Mute toggle error:", err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = conv.isGroup
      ? (conv.name || "Group Chat")
      : (conv.participantInfo?.fullName || "");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConv = conversations.find(c => c._id === activeConvId);
  const glass = "bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]";

  const getOtherParticipant = (conv: ConversationData) => {
    if (!conv.participants || conv.participants.length === 0) return null;
    // For direct chats: find the participant who is NOT the current user
    const other = conv.participants.find(p => p._id !== (user?._id || user?.id));
    return other || conv.participants[0];
  };

  const getAvatar = (conv: ConversationData) => {
    if (conv.avatarUrl) return conv.avatarUrl.startsWith("http") ? conv.avatarUrl : `${AUTH_BASE_URL}${conv.avatarUrl}`;
    if (conv.isGroup) return "https://api.dicebear.com/7.x/shapes/svg?seed=" + conv._id;
    // Try participantInfo first, then participants array
    const other = conv.participantInfo || getOtherParticipant(conv);
    const seed = other?.fullName || conv.name || conv._id;
    const ava = other?.avatarUrl;
    if (ava) return ava.startsWith("http") ? ava : `${AUTH_BASE_URL}${ava}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const getConvName = (conv: ConversationData) => {
    if (conv.isGroup) return conv.name || "Group Chat";
    // For direct chats: use participantInfo or find other from participants
    const other = conv.participantInfo || getOtherParticipant(conv);
    return other?.fullName || conv.name || "Người dùng";
  };

  if (loading) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden text-white bg-slate-950">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-600/10 blur-[100px]" />

      <Header />

      <main className="flex-1 flex overflow-hidden lg:p-4 gap-4 max-w-[1600px] w-full mx-auto">
        {/* SIDEBAR (Conversations) */}
        <aside className={`w-full lg:w-[340px] flex flex-col rounded-3xl ${glass} overflow-hidden ${activeConvId ? "hidden lg:flex" : "flex"}`}>
          <div className="p-5 border-b border-white/10">
            <h1 className="text-xl font-bold mb-4 font-outfit tracking-wide">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Tìm kiếm cuộc trò chuyện..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-violet-500/50 transition text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">
                {searchQuery ? "Không tìm thấy cuộc trò chuyện" : "Chưa có tin nhắn nào"}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConv(conv._id)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition hover:bg-white/5 border-l-4 ${activeConvId === conv._id ? "bg-white/10 border-violet-500" : "border-transparent"}`}
                >
                  <div className="relative">
                    <img src={getAvatar(conv)} alt="avatar" className="w-12 h-12 rounded-full object-cover bg-white/10" />
                    {conv.unreadCount ? (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm truncate pr-2">{getConvName(conv)}</h3>
                      {conv.lastMessageTime && (
                        <span className="text-[10px] text-white/40 shrink-0">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate">
                      {typeof conv.lastMessage === 'string' ? conv.lastMessage : conv.lastMessage?.content || "Khởi tạo cuộc trò chuyện mới"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <section className={`flex-1 flex flex-col rounded-3xl ${glass} overflow-hidden ${!activeConvId ? "hidden lg:flex" : "flex"}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <button className="lg:hidden p-2 -ml-2 rounded-full hover:bg-white/10" onClick={() => setActiveConvId(null)}>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <img src={getAvatar(activeConv)} alt="avatar" className="w-10 h-10 rounded-full object-cover bg-white/10" />
                  <div>
                    <h2 className="font-semibold text-sm lg:text-base">{getConvName(activeConv)}</h2>
                    <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
                      {activeConv.isGroup ? `${activeConv.participants?.length || 0} thành viên` : "Đang hoạt động"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 text-white/60">
                  <button className="p-2 hover:text-white hover:bg-white/10 rounded-full transition"><Phone className="w-5 h-5" /></button>
                  <button className="p-2 hover:text-white hover:bg-white/10 rounded-full transition"><Video className="w-5 h-5" /></button>
                  <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
                  <button onClick={() => setIsInfoOpen(!isInfoOpen)} className={`p-2 hidden lg:block rounded-full transition ${isInfoOpen ? "bg-white/20 text-white" : "hover:bg-white/10 hover:text-white"}`}>
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="p-2 lg:hidden hover:text-white hover:bg-white/10 rounded-full transition"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                    <p>Hãy gửi lời chào đầu tiên!</p>
                  </div>
                ) : (
                   messages.filter(msg => msg != null && msg.senderId !== undefined).map((msg, index) => {
                     const isMe = (typeof msg.senderId === "object" && msg.senderId !== null)
                        ? msg.senderId._id === user?._id 
                        : msg.senderId === user?._id;
                     
                     const senderName = (typeof msg.senderId === "object" && msg.senderId !== null) ? msg.senderId.fullName : "User";
                     const senderAva = (typeof msg.senderId === "object" && msg.senderId !== null) ? msg.senderId.avatarUrl : undefined;

                     const showAvatar = activeConv.isGroup && !isMe;

                     return (
                       <div key={msg._id || index} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                          {showAvatar && (
                            <img 
                              src={senderAva ? (senderAva.startsWith("http") ? senderAva : `${AUTH_BASE_URL}${senderAva}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`} 
                              alt="ava" 
                              className="w-8 h-8 rounded-full shrink-0 self-end mb-1 bg-white/10"
                            />
                          )}
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {showAvatar && <span className="text-[10px] text-white/40 ml-1 mb-1">{senderName}</span>}
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                              ${isMe 
                                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm" 
                                : "bg-white/10 border border-white/5 text-white/90 rounded-bl-sm"}`
                            }>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-white/30 mt-1 mx-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                       </div>
                     )
                   })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white/[0.02] border-t border-white/10 shrink-0">
                {sendError && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 px-3 py-2 rounded-lg mb-2">{sendError}</p>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 relative shadow-inner">
                  <button type="button" className="p-2 text-white/40 hover:text-white transition shrink-0"><Smile className="w-5 h-5" /></button>
                  <button type="button" className="p-2 text-white/40 hover:text-white transition shrink-0"><Paperclip className="w-5 h-5" /></button>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Nhắn tin..."
                    className="flex-1 bg-transparent resize-none max-h-32 focus:outline-none text-sm py-2 px-1 custom-scrollbar text-white placeholder:text-white/30"
                    rows={1}
                  />
                  {inputText.trim() ? (
                    <button type="submit" className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition shrink-0 shadow-lg shadow-violet-500/25">
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button type="button" className="p-2 text-white/40 hover:text-white transition shrink-0">
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Clubverse Messaging</p>
              <p className="text-sm mt-2 opacity-70">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR (Group Info) */}
        {activeConv && isInfoOpen && (
          <aside className={`w-[280px] hidden xl:flex flex-col rounded-3xl ${glass} overflow-hidden shrink-0`}>
            <div className="p-6 flex flex-col items-center border-b border-white/10">
              <img src={getAvatar(activeConv)} alt="avatar" className="w-24 h-24 rounded-full object-cover bg-white/10 ring-4 ring-white/5 mb-4 shadow-xl" />
              <h2 className="font-bold text-lg text-center leading-tight mb-1">{getConvName(activeConv)}</h2>
              <p className="text-xs text-white/50">{activeConv.isGroup ? "Hội thoại nhóm CLB" : "Trò chuyện cá nhân"}</p>
              
              <div className="flex gap-4 mt-6">
                 <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><UserPlus className="w-4 h-4"/></div><span className="text-[10px]">Thêm</span></button>
                 <button 
                   onClick={() => activeConv && handleMuteToggle(activeConv)}
                   className={`flex flex-col items-center gap-1 transition ${activeConv?.isMuted ? "text-amber-400" : "text-white/60 hover:text-white"}`}
                 >
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><BellOff className="w-4 h-4"/></div>
                   <span className="text-[10px]">{activeConv?.isMuted ? "Bật âm" : "Tắt âm"}</span>
                 </button>
                 <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Search className="w-4 h-4"/></div><span className="text-[10px]">Tìm kiếm</span></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
               {/* Sections */}
               {activeConv.isGroup && (
                 <div className="mb-6">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Thành viên ({activeConv.participants?.length || 0})</h3>
                     <button className="text-violet-400 hover:text-violet-300 text-xs">Xem tất cả</button>
                   </div>
                   <div className="space-y-3">
                      {activeConv.participants?.map(p => (
                        <div key={p._id} className="flex items-center gap-3">
                           <img src={p.avatarUrl ? (p.avatarUrl.startsWith("http") ? p.avatarUrl : `${AUTH_BASE_URL}${p.avatarUrl}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.fullName}`} className="w-8 h-8 rounded-full bg-white/10" alt=""/>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium truncate text-white/90">{p.fullName}</p>
                             <p className="text-[10px] text-white/40">{p.isActive ? "Đang hoạt động" : "Offline"}</p>
                           </div>
                           {/* Only admin can remove */}
                           <button className="text-white/20 hover:text-red-400 transition" title="Xóa khỏi nhóm">
                              <Trash2 className="w-4 h-4"/>
                           </button>
                        </div>
                      ))}
                   </div>
                 </div>
               )}

               <div className="mb-6">
                   <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Thông tin cấu hình</h3>
                   <button className="w-full text-left py-2 text-sm text-white/70 hover:text-white flex items-center justify-between">Tin nhắn đã ghim <Pin className="w-4 h-4"/></button>
                   <button className="w-full text-left py-2 text-sm text-white/70 hover:text-white flex items-center justify-between">Ảnh và đa phương tiện <Paperclip className="w-4 h-4"/></button>
               </div>
            </div>
          </aside>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
