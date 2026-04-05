"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AppSidebar from "@/components/AppSidebar";
import { Search, Send, MoreVertical, Paperclip, Smile, Loader2, Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
} from "@/app/services/api/messages";
import { getMyClubs } from "@/app/services/api/users";
import { getClubApplications, type MyApplication } from "@/app/services/api/applications";
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

export default function MyMessagesContent() {
  const searchParams = useSearchParams();
  const { loading, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [newConversationUserId, setNewConversationUserId] = useState("");
  const [approvedApplicants, setApprovedApplicants] = useState<MyApplication[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

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
          participantId: conv.participantId ?? conv.participantInfo?._id ?? "",
          name: conv.participantInfo?.fullName || "Unknown",
          avatar: conv.participantInfo?.avatarUrl,
          lastMessage:
            typeof conv.lastMessage === "string"
              ? conv.lastMessage
              : conv.lastMessage?.content || "No messages yet",
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
        console.error(message);
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
      const selectedConversationId = selectedConversation?.id;
      const selectedConversationUnread = selectedConversation?.unread ?? 0;
      const selectedConversationName = selectedConversation?.name;

      if (!selectedConversationId || !token) return;

      setMessagesLoading(true);
      try {
        // Skip fetching for temp conversations
        if (selectedConversationId.startsWith("temp-")) {
          setMessagesLoading(false);
          return;
        }
        const messagesData = await getMessages(token, selectedConversationId);

        // Map API messages to UI format
        const mappedMessages: Message[] = messagesData.map((msg) => ({
          id: msg._id,
          content: msg.content,
          sender: msg.senderId === user?._id ? "user" : "other",
          timestamp: new Date(msg.createdAt),
          senderName: selectedConversationName,
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
        if (token && selectedConversationUnread > 0) {
          await markConversationAsRead(token, selectedConversationId);
          // Update unread count
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConversationId
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
  }, [selectedConversation?.id, selectedConversation?.unread, selectedConversation?.name, token, user?._id]);

  // Fetch user's clubs and approved applicants when modal opens
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!isNewConversationModalOpen || !token) return;

      setIsLoadingApplicants(true);
      try {
        // Get user's clubs
        const clubs = await getMyClubs(token, "active");

        // Get approved applicants from all user's clubs
        const allApplicants: MyApplication[] = [];
        for (const club of clubs) {
          try {
            const applicants = await getClubApplications({
              accessToken: token,
              clubId: club.clubId,
              status: "APPROVED",
            });
            allApplicants.push(...applicants);
          } catch (err) {
            console.warn(`Failed to fetch applicants for club ${club.clubId}:`, err);
          }
        }
        setApprovedApplicants(allApplicants);
      } catch (err) {
        console.error("Error fetching clubs/applicants:", err);
      } finally {
        setIsLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [isNewConversationModalOpen, token]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !token) return;

    setIsSendingMessage(true);
    try {
      console.log("Sending message to:", selectedConversation.id);
      console.log("Message content:", messageInput);
      
      const newMessage = await sendMessage(token, {
        conversationId: selectedConversation.id,
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
            participantId: conv.participantId ?? conv.participantInfo?._id ?? "",
            name: conv.participantInfo?.fullName || "Unknown",
            avatar: conv.participantInfo?.avatarUrl,
            lastMessage:
              typeof conv.lastMessage === "string"
                ? conv.lastMessage
                : conv.lastMessage?.content || "No messages yet",
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
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-semibold">Tin nhắn</h1>
                <button
                  onClick={() => setIsNewConversationModalOpen(true)}
                  className="p-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 transition"
                  title="Bắt đầu trò chuyện mới"
                >
                  <Plus size={20} className="text-emerald-400" />
                </button>
              </div>

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
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    {conv.avatar && (
                      <Image
                        src={conv.avatar}
                        alt={conv.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                        unoptimized
                      />
                    )}
                    {!conv.avatar && (
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold",
                          "bg-gradient-to-br from-indigo-500 to-purple-600"
                        )}
                      >
                        {initials(conv.name)}
                      </div>
                    )}
                    <span className="text-sm truncate">{conv.name}</span>
                    {conv.unread > 0 && (
                      <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-400/20 rounded-full px-2 py-0.5">
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
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    {selectedConversation.avatar && (
                      <Image
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                        unoptimized
                      />
                    )}
                    {!selectedConversation.avatar && (
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold",
                          "bg-gradient-to-br from-indigo-500 to-purple-600"
                        )}
                      >
                        {initials(selectedConversation.name)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{selectedConversation.name}</p>
                      <p className="text-xs text-white/60">
                        {selectedConversation.online ? "Hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-white/10 rounded-full transition">
                    <MoreVertical size={18} className="text-white/60" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="animate-spin text-white/40" size={24} />
                    </div>
                  ) : selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs rounded-2xl px-4 py-2",
                            msg.sender === "user"
                              ? "bg-emerald-500/20 border border-emerald-500/30 text-white"
                              : "bg-white/10 border border-white/10 text-white"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/40">
                      Chưa có tin nhắn nào
                    </div>
                  )}
                </div>

                {/* Messages Footer */}
                <div className="space-y-2 text-xs text-white/40 mb-4 text-center">
                  {selectedConversation.messages.length > 0 && (
                    <>
                      <p>
                        {selectedConversation.messages[selectedConversation.messages.length - 1].senderName}
                      </p>
                      <p>
                        {fmtTime(selectedConversation.messages[selectedConversation.messages.length - 1].timestamp)}
                      </p>
                    </>
                  )}
                </div>

                {/* Messages Area */}
                <div className="space-y-3">
                  {selectedConversation.messages.length > 0 &&
                    selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2 items-end",
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.sender !== "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0" />
                        )}

                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl max-w-sm",
                            msg.sender === "user"
                              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-100"
                              : "bg-white/10 border border-white/20 text-white"
                          )}
                        >
                          <p className="text-xs text-white/40">{msg.senderName}</p>
                          <p className="text-sm">{msg.content}</p>
                        </div>

                        {msg.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold shrink-0" />
                        )}
                      </div>
                    ))}
                </div>

                {/* Messages Time */}
                <div className="flex flex-col items-center gap-2">
                  {selectedConversation.messages.length > 0 && (
                    <>
                      <p className="text-xs text-white/40">
                        {selectedConversation.messages[selectedConversation.messages.length - 1].senderName}
                      </p>
                      <p className="text-xs text-white/40">
                        {fmtTime(selectedConversation.messages[selectedConversation.messages.length - 1].timestamp)}
                      </p>
                    </>
                  )}
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
                    className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !messageInput.trim()}
                    className="rounded-full p-2 hover:bg-emerald-500/20 transition disabled:opacity-50"
                  >
                    {isSendingMessage ? (
                      <Loader2 size={18} className="text-emerald-400 animate-spin" />
                    ) : (
                      <Send size={18} className="text-emerald-400" />
                    )}
                  </button>

                  <button className="rounded-full p-2 hover:bg-white/10 transition">
                    <Smile size={18} className="text-white/60" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn("rounded-3xl p-5 flex flex-col items-center justify-center flex-1", glass)}>
                <div className="text-center space-y-4">
                  <p className="text-white/60 text-lg">Chưa có cuộc trò chuyện nào</p>
                  <button
                    onClick={() => setIsNewConversationModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-sm font-semibold transition-all"
                  >
                    <Plus size={18} />
                    Bắt đầu trò chuyện mới
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* New Conversation Modal */}
        {isNewConversationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={cn("rounded-2xl w-full max-w-md p-6", glass)}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bắt đầu trò chuyện mới</h3>
                <button
                  onClick={() => {
                    setIsNewConversationModalOpen(false);
                    setNewConversationUserId("");
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-sm text-white/70">Chọn người nhận:</p>

                {isLoadingApplicants ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-white/40" size={24} />
                  </div>
                ) : approvedApplicants.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {approvedApplicants.map((applicant) => {
                      const applicantInfo = typeof applicant.userId === "string" 
                        ? { _id: applicant.userId, fullName: applicant.userId }
                        : applicant.userId || { _id: "", fullName: "Unknown" };
                      
                      return (
                        <button
                          key={applicant._id}
                          onClick={() => {
                            const userId = typeof applicant.userId === "string" 
                              ? applicant.userId 
                              : applicant.userId?._id || "";
                            const newConv: Conversation = {
                              id: `temp-${userId}`,
                              participantId: userId,
                              name: applicantInfo.fullName || "User",
                              lastMessage: "Bắt đầu cuộc trò chuyện",
                              lastMessageTime: new Date(),
                              unread: 0,
                              online: false,
                              messages: [],
                            };
                            setSelectedConversation(newConv);
                            setNewConversationUserId("");
                            setIsNewConversationModalOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-left"
                        >
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                            {initials(applicantInfo.fullName || "U")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{applicantInfo.fullName || "Unknown User"}</p>
                            <p className="text-xs text-white/50 truncate">Đã duyệt đơn</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-white/40 text-sm">Chưa có người duyệt đơn</p>
                  </div>
                )}

                {/* Manual input as fallback */}
                <div className="pt-4 border-t border-white/10">
                  <label className="text-sm text-white/70 mb-2 block">Hoặc nhập ID người nhận:</label>
                  <input
                    type="text"
                    placeholder="Nhập ID người dùng..."
                    value={newConversationUserId}
                    onChange={(e) => setNewConversationUserId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        if (newConversationUserId.trim()) {
                          const newConv: Conversation = {
                            id: `temp-${newConversationUserId}`,
                            participantId: newConversationUserId,
                            name: `User: ${newConversationUserId}`,
                            lastMessage: "Bắt đầu cuộc trò chuyện",
                            lastMessageTime: new Date(),
                            unread: 0,
                            online: false,
                            messages: [],
                          };
                          setSelectedConversation(newConv);
                          setNewConversationUserId("");
                          setIsNewConversationModalOpen(false);
                        }
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsNewConversationModalOpen(false);
                      setNewConversationUserId("");
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
