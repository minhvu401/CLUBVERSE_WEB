"use client";

import React, { useState, useEffect } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Search, Send, MoreVertical, Paperclip, Smile, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  type ConversationData,
  type MessageData,
} from "@/app/services/api/messages";
import { useAuth } from "@/app/providers/AuthProviders";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function fmtTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ================= types ================= */

interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: Date;
  senderName?: string;
}

interface Conversation {
  id: string;
  participantId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  online: boolean;
  messages: Message[];
}



/* ================= page ================= */

export default function MyMessagesPage() {
  const searchParams = useSearchParams();
  const { loading, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Get token on mount
  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  // Auto-select conversation if clubId is in query params
  useEffect(() => {
    const clubId = searchParams.get("clubId");
    const clubName = searchParams.get("clubName")
      ? decodeURIComponent(searchParams.get("clubName")!)
      : undefined;
    if (clubId && conversations.length >= 0) {
      const clubConversation = conversations.find(
        (conv) => conv.participantId === clubId
      );
      if (clubConversation) {
        setSelectedConversation(clubConversation);
      } else if (conversations.length > 0) {
        // Nếu chưa có conversation với club này, tạo conversation tạm thời
        // API sendMessage sẽ tạo conversation thực khi gửi tin nhắn đầu tiên
        const tempConversation: Conversation = {
          id: `temp-${clubId}`,
          participantId: clubId,
          name: clubName || `Club ID: ${clubId}`,
          lastMessage: "Bắt đầu cuộc trò chuyện",
          lastMessageTime: new Date(),
          unread: 0,
          online: true,
          messages: [],
        };
        setSelectedConversation(tempConversation);
      }
    }
  }, [searchParams, conversations]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!token) {
          setIsLoading(false);
          return;
        }

        const data = await getConversations(token);

        // Map API data to UI format
        const mappedConversations: Conversation[] = data.map((conv) => ({
          id: conv._id,
          participantId: conv.participantId,
          name: conv.participantInfo?.fullName || "Unknown",
          avatar: conv.participantInfo?.avatarUrl,
          lastMessage: conv.lastMessage || "No messages yet",
          lastMessageTime: conv.lastMessageTime
            ? new Date(conv.lastMessageTime)
            : new Date(),
          unread: conv.unreadCount || 0,
          online: conv.participantInfo?.isActive ?? false,
          messages: [],
        }));

        setConversations(mappedConversations);
        if (mappedConversations.length > 0) {
          setSelectedConversation(mappedConversations[0]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch conversations";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && token) {
      fetchConversations();
    }
  }, [loading, token]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !token) return;

      setMessagesLoading(true);
      try {
        const messagesData = await getMessages(token, selectedConversation.id);

        // Map API messages to UI format
        const mappedMessages: Message[] = messagesData.map((msg) => ({
          id: msg._id,
          content: msg.content,
          sender: msg.senderId === user?._id ? "user" : "other",
          timestamp: new Date(msg.createdAt),
          senderName: selectedConversation.name,
        }));

        // Update the selected conversation with messages
        setSelectedConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: mappedMessages,
          };
        });

        // Mark conversation as read
        if (token && selectedConversation.unread > 0) {
          await markConversationAsRead(token, selectedConversation.id);
          // Update unread count
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConversation.id
                ? { ...conv, unread: 0 }
                : conv
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?.id, token, user?._id]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !token) return;

    setIsSendingMessage(true);
    try {
      console.log("Sending message to:", selectedConversation.participantId);
      console.log("Message content:", messageInput);
      
      const newMessage = await sendMessage(token, {
        recipientId: selectedConversation.participantId,
        content: messageInput,
      });

      console.log("Message response:", newMessage);

      if (newMessage) {
        // Add the new message to the conversation
        const mappedMessage: Message = {
          id: newMessage._id,
          content: newMessage.content,
          sender: "user",
          timestamp: new Date(newMessage.createdAt),
          senderName: "You",
        };

        setSelectedConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, mappedMessage],
            lastMessage: newMessage.content,
            lastMessageTime: new Date(newMessage.createdAt),
          };
        });

        // Update conversation in list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: newMessage.content,
                  lastMessageTime: new Date(newMessage.createdAt),
                }
              : conv
          )
        );

        setMessageInput("");

        // Nếu là conversation tạm thời, fetch lại conversations để cập nhật
        if (selectedConversation.id.startsWith("temp-")) {
          console.log("Fetching conversations after creating temp message...");
          const updatedConvs = await getConversations(token);
          console.log("Updated conversations:", updatedConvs);
          
          const mappedConversations: Conversation[] = updatedConvs.map((conv) => ({
            id: conv._id,
            participantId: conv.participantId,
            name: conv.participantInfo?.fullName || "Unknown",
            avatar: conv.participantInfo?.avatarUrl,
            lastMessage: conv.lastMessage || "No messages yet",
            lastMessageTime: conv.lastMessageTime
              ? new Date(conv.lastMessageTime)
              : new Date(),
            unread: conv.unreadCount || 0,
            online: conv.participantInfo?.isActive ?? false,
            messages: [],
          }));
          setConversations(mappedConversations);

          // Select conversation thực vừa tạo
          const realConversation = mappedConversations.find(
            (conv) => conv.participantId === selectedConversation.participantId
          );
          if (realConversation) {
            setSelectedConversation(realConversation);
          } else {
            console.warn("Could not find real conversation after sending message");
          }
        }
      } else {
        console.warn("sendMessage returned undefined");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to send message:", errorMsg);
      alert(`❌ Lỗi gửi tin nhắn: ${errorMsg}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

        <div className="mx-auto flex flex-1 max-w-7xl gap-4 px-4 py-6 flex-col">
          <div className="flex gap-4">
            <AppSidebar activeKey="messages" />

            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Header with Search */}
              <div className={cn("rounded-3xl p-4 mb-4", glass)}>
                <h1 className="text-lg font-semibold mb-3">Tin nhắn</h1>
                <div className="h-10 rounded-xl bg-white/10 animate-pulse" />
              </div>

              {/* Conversations Tabs Skeleton */}
              <div className={cn("rounded-3xl p-3 mb-4 overflow-x-auto", glass)}>
                <div className="flex gap-2 pb-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 animate-pulse h-10 w-28"
                    />
                  ))}
                </div>
              </div>

              {/* Chat Area Skeleton */}
              <div className={cn("rounded-3xl p-5 flex flex-col flex-1 overflow-hidden", glass)}>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse shrink-0" />
                      <div className="h-8 w-32 rounded-2xl bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex flex-1 max-w-7xl gap-4 px-4 py-6 flex-col">
        <div className="flex gap-4">
          <AppSidebar activeKey="messages" />

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Search */}
            <div className={cn("rounded-3xl p-4 mb-4", glass)}>
              <h1 className="text-lg font-semibold mb-3">Tin nhắn</h1>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/6 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Conversations Tabs */}
            <div className={cn("rounded-3xl p-3 mb-4 overflow-x-auto", glass)}>
              <div className="flex gap-2 pb-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "shrink-0 flex items-center gap-2 rounded-full px-4 py-2 transition border",
                      selectedConversation?.id === conv.id
                        ? "bg-gradient-to-r from-emerald-500/40 to-sky-500/40 border-emerald-500/50"
                        : "bg-white/6 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
                      selectedConversation?.id === conv.id
                        ? "bg-gradient-to-br from-emerald-500/60 to-sky-500/60"
                        : "bg-white/20"
                    )}>
                      {initials(conv.name)}
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-white/20" />
                      )}
                    </div>

                    {/* Name */}
                    <span className="text-sm font-medium truncate max-w-[100px]">{conv.name}</span>

                    {/* Unread Badge */}
                    {conv.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-emerald-500/80 text-xs font-bold px-2 py-0.5">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
              {selectedConversation ? (
              <div className={cn("rounded-3xl p-5 flex flex-col flex-1 overflow-hidden", glass)}>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-sm">
                      {initials(selectedConversation.name)}
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white/20" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{selectedConversation.name}</p>
                      <p className="text-xs text-white/60">
                        {selectedConversation.online ? "Đang hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                  </div>

                  <button className="rounded-full p-2 hover:bg-white/10 transition">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex gap-3", msg.sender === "user" && "flex-row-reverse")}
                    >
                      {msg.sender === "other" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                          {initials(msg.senderName || selectedConversation.name)}
                        </div>
                      )}

                      <div className={cn("flex flex-col gap-1", msg.sender === "user" && "items-end")}>
                        <div
                          className={cn(
                            "max-w-xs rounded-2xl px-4 py-2 text-sm",
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-emerald-500/40 to-sky-500/40 border border-emerald-500/30 text-white"
                              : "bg-white/10 border border-white/10 text-white/90"
                          )}
                        >
                          {msg.content}
                        </div>
                        <p className="text-xs text-white/40">{fmtTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <button className="rounded-full p-2 hover:bg-white/10 transition">
                    <Paperclip size={18} className="text-white/60" />
                  </button>

                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-white/6 border border-white/10 rounded-full px-4 py-2 text-sm placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  />

                  <button className="rounded-full p-2 hover:bg-white/10 transition">
                    <Smile size={18} className="text-white/60" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !messageInput.trim()}
                    className="rounded-full bg-gradient-to-r from-emerald-500/80 to-sky-500/60 p-2 hover:from-emerald-500 hover:to-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} className="text-slate-950" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn("rounded-3xl p-5 flex items-center justify-center flex-1", glass)}>
                <p className="text-white/60">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
