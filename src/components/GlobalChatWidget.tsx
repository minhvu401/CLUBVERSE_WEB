"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProviders";
import { useChatStore } from "@/app/store/chatStore";
import {
  getConversationById,
  getMessages,
  sendMessage,
  markConversationAsReadAll,
  type ConversationData,
  type MessageData,
} from "@/app/services/api/messages";
import { AUTH_BASE_URL } from "@/app/services/api/auth";
import { X, Minus, Send, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ChatBox({
  conversationId,
  minimized,
  onClose,
  onToggleMinimize,
  user,
  token,
}: {
  conversationId: string;
  minimized: boolean;
  onClose: () => void;
  onToggleMinimize: () => void;
  user: { _id?: string; id?: string; fullName?: string; avatarUrl?: string } | null;
  token: string;
}) {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation info
  useEffect(() => {
    if (!token || !conversationId) return;
    const fetchConv = async () => {
      try {
        const data = await getConversationById(token, conversationId);
        setConversation(data);
      } catch (err) {
        console.warn("Lỗi tải thông tin hội thoại:", err);
      }
    };
    fetchConv();
  }, [token, conversationId]);

  // Fetch messages with polling
  useEffect(() => {
    if (!token || !conversationId || minimized) return;

    const fetchMsgs = async () => {
      try {
        const data = await getMessages(token, conversationId);
        setMessages(data);
        setIsLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (err) {
        console.warn("Lỗi tải tin nhắn (có thể do mạng):", err);
      }
    };
    fetchMsgs();

    const interval = setInterval(fetchMsgs, 5000);
    return () => clearInterval(interval);
  }, [token, conversationId, minimized]);

  // Mark as read when chat opens
  useEffect(() => {
    if (!token || !conversationId || minimized) return;
    markConversationAsReadAll(token, conversationId).catch(() => {});
  }, [token, conversationId, minimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !token || !conversationId) return;

    try {
      const content = inputText;
      setInputText("");
      const newMsg = await sendMessage(token, {
        conversationId,
        content,
      });
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Send error", err);
    }
  };

  const getOtherParticipant = (conv: ConversationData) => {
    if (!conv.participants || conv.participants.length === 0) return null;
    const other = conv.participants.find((p) => p._id !== user?._id && p._id !== user?.id);
    return other || conv.participants[0];
  };

  const getAvatar = (conv: ConversationData) => {
    if (conv.avatarUrl) return conv.avatarUrl.startsWith("http") ? conv.avatarUrl : `${AUTH_BASE_URL}${conv.avatarUrl}`;
    if (conv.isGroup) return "https://api.dicebear.com/7.x/shapes/svg?seed=" + conv._id;
    const other = conv.participantInfo || getOtherParticipant(conv);
    const seed = other?.fullName || conv.name || conv._id;
    const ava = other?.avatarUrl;
    if (ava) return ava.startsWith("http") ? ava : `${AUTH_BASE_URL}${ava}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const getConvName = (conv: ConversationData) => {
    if (conv.isGroup) return conv.name || "Group Chat";
    const other = conv.participantInfo || getOtherParticipant(conv);
    return other?.fullName || conv.name || "Người dùng";
  };

  if (!conversation) {
    return (
      <div className="w-[320px] h-[400px] bg-slate-900 border border-white/10 rounded-t-xl shadow-2xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "w-[320px] bg-slate-900 border border-white/10 rounded-t-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
      minimized ? "h-[48px]" : "h-[450px]"
    )}>
      {/* Header */}
      <div 
        className="h-12 bg-indigo-950/80 hover:bg-indigo-900/80 border-b border-white/10 flex items-center justify-between px-3 cursor-pointer shrink-0"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <img src={getAvatar(conversation)} alt="avatar" className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-white text-sm font-semibold truncate leading-tight">{getConvName(conversation)}</h3>
            <p className="text-white/50 text-[10px] truncate leading-tight">
              {conversation.isGroup ? "Nhóm" : "Đang hoạt động"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button 
            className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white hover:bg-red-500/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div 
             className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#0B1120]"
             style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
             }}
          >
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                Hãy vẫy tay chào!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isObj = typeof msg.senderId === "object" && msg.senderId !== null;
                const isMe = isObj 
                  ? (msg.senderId as { _id: string; fullName: string })._id === user?._id 
                  : msg.senderId === user?._id;

                const senderName = isObj ? (msg.senderId as { fullName: string }).fullName : "User";
                const showAvatar = conversation.isGroup && !isMe;

                return (
                  <div key={msg._id || idx} className={cn("flex gap-2 max-w-[85%]", isMe ? "ml-auto" : "mr-auto")}>
                    {showAvatar && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 shrink-0 self-end mb-0.5 text-[8px] flex items-center justify-center font-bold">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={cn(
                        "px-3 py-2 text-sm rounded-2xl shadow-sm text-white max-w-full break-words whitespace-pre-wrap leading-snug",
                        isMe ? "bg-violet-600 rounded-br-sm" : "bg-white/10 rounded-bl-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 bg-slate-900 border-t border-white/10 shrink-0">
             <form onSubmit={handleSendMessage} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-1 py-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="p-1.5 text-violet-400 hover:text-violet-300 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
             </form>
          </div>
        </>
      )}
    </div>
  );
}

export default function GlobalChatWidget() {
  const { activeChats, closeChat, toggleMinimize } = useChatStore();
  const { user, token, loading } = useAuth() as { user: { _id?: string; id?: string }; token: string; loading: boolean };

  if (loading || !token) return null;
  if (activeChats.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 lg:right-10 z-[9999] flex items-end gap-3 pointer-events-none">
      {activeChats.map((chat) => (
        <div key={chat.id} className="pointer-events-auto">
          <ChatBox
            conversationId={chat.id}
            minimized={chat.minimized}
            onClose={() => closeChat(chat.id)}
            onToggleMinimize={() => toggleMinimize(chat.id)}
            user={user}
            token={token}
          />
        </div>
      ))}
    </div>
  );
}
