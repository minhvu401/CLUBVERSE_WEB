/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  Users,
  CalendarDays,
  ShieldCheck,
  FileText,
  X,
  UserCircle2,
} from "lucide-react";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ================= types ================= */

interface ClubMember {
  id: string;
  fullName: string;
  role: "member" | "admin";
  joinedAt: string;
}

interface MyClub {
  id: string;
  name: string;
  category: string;
  role: "member" | "admin";
  joinedAt: string;
  description?: string;
  members: ClubMember[];
}

/* ================= mock data ================= */

const MOCK_CLUBS: MyClub[] = [
  {
    id: "club-1",
    name: "CLB Công nghệ",
    category: "Học thuật",
    role: "member",
    joinedAt: "2025-10-12",
    description: "Nơi giao lưu và học tập về công nghệ, lập trình",
    members: [
      {
        id: "u1",
        fullName: "Nguyễn Văn A",
        role: "admin",
        joinedAt: "2025-09-01",
      },
      {
        id: "u2",
        fullName: "Trần Thị B",
        role: "member",
        joinedAt: "2025-10-12",
      },
    ],
  },
  {
    id: "club-2",
    name: "CLB Truyền thông",
    category: "Kỹ năng",
    role: "admin",
    joinedAt: "2025-09-01",
    description: "Quản lý nội dung, sự kiện và truyền thông CLB",
    members: [
      {
        id: "u3",
        fullName: "Lê Văn C",
        role: "admin",
        joinedAt: "2025-08-15",
      },
      {
        id: "u4",
        fullName: "Phạm Thị D",
        role: "member",
        joinedAt: "2025-09-10",
      },
    ],
  },
];

/* ================= modal ================= */

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */

export default function MyClubsPage() {
  const { loading } = useAuth();

  const [clubs] = useState<MyClub[]>(MOCK_CLUBS);
  const [openClub, setOpenClub] = useState<MyClub | null>(null);
  const [openMembers, setOpenMembers] = useState<MyClub | null>(null);

  if (loading) return null;

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <AppSidebar activeKey="my-clubs" />

        <main className="flex-1 space-y-4">
          {/* title */}
          <div className={cn("rounded-3xl p-5", glass)}>
            <h1 className="text-lg font-semibold">Câu lạc bộ của tôi</h1>
            <p className="mt-1 text-xs text-white/55">
              Các câu lạc bộ bạn đang tham gia
            </p>
          </div>

          {/* list */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="space-y-3 p-5">
              {clubs.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{c.name}</div>

                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem]">
                      {c.category}
                    </span>

                    {c.role === "admin" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-[0.65rem] font-semibold text-emerald-200">
                        <ShieldCheck size={12} />
                        Ban chủ nhiệm
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      Tham gia: {fmtDate(c.joinedAt)}
                    </span>

                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {c.members.length} thành viên
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setOpenMembers(c)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs"
                    >
                      <Users size={14} />
                      Thành viên
                    </button>

                    <button
                      onClick={() => setOpenClub(c)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs"
                    >
                      <FileText size={14} />
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* club detail modal */}
      <Modal
        open={!!openClub}
        title="Thông tin câu lạc bộ"
        onClose={() => setOpenClub(null)}
      >
        {openClub && (
          <div className="space-y-2 text-sm text-white/80">
            <div className="font-semibold text-white">{openClub.name}</div>
            <div>📂 Danh mục: {openClub.category}</div>
            <div>📅 Ngày tham gia: {fmtDate(openClub.joinedAt)}</div>
            {openClub.description && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                {openClub.description}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* members modal */}
      <Modal
        open={!!openMembers}
        title="Danh sách thành viên"
        onClose={() => setOpenMembers(null)}
      >
        {openMembers && (
          <div className="space-y-3">
            {openMembers.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-500/30 font-semibold text-slate-950">
                  {initials(m.fullName)}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.fullName}</div>
                  <div className="text-xs text-white/60">
                    Tham gia: {fmtDate(m.joinedAt)}
                  </div>
                </div>

                {m.role === "admin" && (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[0.65rem] font-semibold text-emerald-200">
                    Quản lý
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
