/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  MessageCircle,
  Users,
  SendHorizonal,
  Circle,
} from "lucide-react";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* ================= mock data (nâng cấp) ================= */

type ChatType = "club" | "user";

interface ChatItem {
  id: string;
  type: ChatType;
  name: string;
  lastMessage?: string;
  online?: boolean;
  unread?: number;
}

interface Message {
  id: string;
  sender: "me" | "other";
  content: string;
  time: string;
}

const MOCK_CHATS: ChatItem[] = [
  {
    id: "club-1",
    type: "club",
    name: "CLB Công nghệ",
    lastMessage: "Nhớ tham gia họp tối nay",
    unread: 2,
  },
  {
    id: "club-2",
    type: "club",
    name: "CLB Truyền thông",
    lastMessage: "Đã duyệt đơn của bạn",
  },
  {
    id: "user-1",
    type: "user",
    name: "Nguyễn Văn A",
    online: true,
    lastMessage: "Ok bạn nha",
    unread: 1,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "other",
    content: "Chào bạn, mình từ CLB Công nghệ",
    time: "09:00",
  },
  {
    id: "m2",
    sender: "me",
    content: "Dạ em chào anh/chị ạ",
    time: "09:01",
  },
  {
    id: "m3",
    sender: "other",
    content: "Tối nay CLB họp lúc 19h nhé",
    time: "09:02",
  },
];

/* ================= page ================= */

export default function MessagesPage() {
  const { loading } = useAuth();

  const [chats, setChats] = useState<ChatItem[]>(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(
    MOCK_CHATS[0]
  );
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");

  if (loading) return null;

  const handleSelectChat = (chat: ChatItem) => {
    setSelectedChat(chat);

    // reset unread
    setChats((prev) =>
      prev.map((c) =>
        c.id === chat.id ? { ...c, unread: 0 } : c
      )
    );
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "me",
        content: input,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        {/* SIDEBAR */}
        <AppSidebar activeKey="messages" />

        <main className="flex flex-1 gap-4">
          {/* LEFT: chat list */}
          <aside className={cn("w-72 shrink-0 rounded-3xl", glass)}>
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">
              Tin nhắn
            </div>

            <div className="space-y-1 p-2">
              {chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectChat(c)}
                  className={cn(
                    "relative w-full rounded-xl px-3 py-2 text-left text-sm transition",
                    selectedChat?.id === c.id
                      ? "bg-sky-500 text-slate-950"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {c.type === "club" ? (
                      <Users size={16} />
                    ) : (
                      <MessageCircle size={16} />
                    )}
                    {c.name}

                    {c.online && (
                      <Circle
                        size={8}
                        className="ml-auto fill-emerald-400 text-emerald-400"
                      />
                    )}
                  </div>

                  <div className="mt-1 text-xs opacity-70 line-clamp-1">
                    {c.lastMessage || "—"}
                  </div>

                  {c.unread ? (
                    <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 text-[0.65rem] font-semibold text-white">
                      {c.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: chat box */}
          <section className={cn("flex flex-1 flex-col rounded-3xl", glass)}>
            {/* header */}
            <div className="border-b border-white/10 px-5 py-3 text-sm font-semibold">
              {selectedChat?.name}
              <span className="ml-2 text-xs opacity-60">
                ({selectedChat?.type === "club" ? "Nhóm CLB" : "Cá nhân"})
              </span>
            </div>

            {/* messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                    m.sender === "me"
                      ? "ml-auto bg-sky-500 text-slate-950"
                      : "bg-white/10"
                  )}
                >
                  <div>{m.content}</div>
                  <div className="mt-1 text-[0.65rem] opacity-70">
                    {m.time}
                  </div>
                </div>
              ))}
            </div>

            {/* input */}
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/50"
              />
              <button
                onClick={handleSend}
                className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-slate-950"
              >
                <SendHorizonal size={16} />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
