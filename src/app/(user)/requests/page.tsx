/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders";
import { toast } from "sonner";

import {
  getMyApplications,
  getApplicationById,
  getClub,
  type ApiStatus,
  type MyApplication,
  type FilterStatus,
} from "@/app/services/api/applications";

import {
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  X,
  BadgeCheck,
  BadgeX,
  ChevronRight,
  AlertCircle,
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
  return d.toLocaleString("vi-VN");
}

/* ================= status ================= */

function getStatusCfg(status: ApiStatus) {
  const s = String(status || "").toUpperCase();

  const map: Record<
    string,
    { text: string; cls: string; icon: React.ReactNode }
  > = {
    PENDING: {
      text: "Chờ duyệt",
      cls: "bg-amber-400/15 text-amber-200 border-amber-400/25",
      icon: <Clock3 size={14} />,
    },
    APPROVED: {
      text: "Đã duyệt",
      cls: "bg-sky-400/15 text-sky-200 border-sky-400/25",
      icon: <CheckCircle2 size={14} />,
    },
    ACCEPTED: {
      text: "Đã xác nhận",
      cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
      icon: <BadgeCheck size={14} />,
    },
    DECLINED: {
      text: "Đã từ chối",
      cls: "bg-white/10 text-white/70 border-white/15",
      icon: <BadgeX size={14} />,
    },
    REJECTED: {
      text: "Bị từ chối",
      cls: "bg-rose-400/15 text-rose-200 border-rose-400/25",
      icon: <XCircle size={14} />,
    },
  };

  return map[s] ?? map.PENDING;
}

function StatusBadge({ status }: { status: ApiStatus }) {
  const cfg = getStatusCfg(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
        cfg.cls
      )}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

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
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-6", glass)}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const isUserRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "user",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
    else if (!isUserRole) router.replace("/");
  }, [loading, token, isUserRole, router]);

  /* ===== list ===== */

  const [allApps, setAllApps] = useState<MyApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [q, setQ] = useState("");

  const fetchList = async () => {
    if (!token) return;
    try {
      const list = await getMyApplications({ accessToken: token });
      setAllApps(list);
    } catch (e: any) {
      toast.error(e?.message || "Không tải được danh sách đơn");
    }
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  /* ===== detail ===== */

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<MyApplication | null>(null);
  const [responding, setResponding] = useState<"accept" | "decline" | null>(null);

  const openDetail = async (id: string) => {
    if (!token) return;
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const data = await getApplicationById({ accessToken: token, id });
      setDetail(data);
    } catch (e: any) {
      toast.error(e?.message || "Không lấy được chi tiết đơn");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRespond = async (type: "accept" | "decline") => {
    if (!detail) return;

    try {
      setResponding(type);

      // 🚧 Giả lập API (sau này thay bằng API thật)
      await new Promise((r) => setTimeout(r, 600));

      toast.success(
        type === "accept"
          ? "Bạn đã xác nhận tham gia phỏng vấn"
          : "Bạn đã từ chối lịch phỏng vấn"
      );

      setDetailOpen(false);
      setDetail(null);

      // ✅ REFRESH LIST + STATS
      await fetchList();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setResponding(null);
    }
  };

  /* ===== stats ===== */

  const stats = useMemo(() => {
    const count = (s: string) =>
      allApps.filter((a) => String(a.status).toUpperCase() === s).length;

    return {
      total: allApps.length,
      pending: count("PENDING"),
      approved: count("APPROVED"),
      rejected: count("REJECTED"),
    };
  }, [allApps]);

  /* ===== filter ===== */

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return allApps.filter((a) => {
      const club = getClub(a.clubId);
      const matchText =
        String(a.reason || "").toLowerCase().includes(query) ||
        String(club.fullName || "").toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "all" ||
        String(a.status).toUpperCase() === statusFilter;

      return matchText && matchStatus;
    });
  }, [allApps, q, statusFilter]);

  if (loading) return null;

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <AppSidebar activeKey="requests" />

        <main className="flex-1 space-y-6">
          {/* Header */}
          <div className={cn("rounded-2xl p-6", glass)}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Đơn đã gửi
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Quản lý và theo dõi trạng thái đăng ký câu lạc bộ của bạn
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label="Chờ duyệt"
              value={stats.pending}
              icon={<Clock3 size={18} />}
              color="from-amber-400 to-amber-600"
            />
            <Stat
              label="Đã duyệt"
              value={stats.approved}
              icon={<CheckCircle2 size={18} />}
              color="from-sky-400 to-sky-600"
            />
            <Stat
              label="Bị từ chối"
              value={stats.rejected}
              icon={<XCircle size={18} />}
              color="from-rose-400 to-rose-600"
            />
            <Stat
              label="Tổng"
              value={stats.total}
              icon={<FileText size={18} />}
              color="from-violet-400 to-violet-600"
            />
          </div>

          {/* List Section */}
          <section className={cn("rounded-2xl overflow-hidden", glass)}>
            {/* Header with Search */}
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold">Danh sách đơn ({filtered.length})</h2>
                <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                  <Search size={16} className="text-white/40" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm kiếm câu lạc bộ..."
                    className="bg-transparent text-sm outline-none w-full placeholder-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-white/60">
                  {allApps.length === 0
                    ? "Bạn chưa gửi đơn nào"
                    : "Không tìm thấy đơn phù hợp"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filtered.map((a) => {
                  const club = getClub(a.clubId);
                  return (
                    <div
                      key={a._id}
                      onClick={() => openDetail(a._id)}
                      className="px-6 py-4 hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate">
                              {club.fullName || "Câu lạc bộ"}
                            </h3>
                            <StatusBadge status={a.status} />
                          </div>
                          <p className="text-sm text-white/60 line-clamp-1">
                            {a.reason || "Không có lý do"}
                          </p>
                          <div className="text-xs text-white/40 mt-2">
                            {fmtDate(a.submittedAt || a.createdAt)}
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-white/30 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      <Modal
        open={detailOpen}
        title="Chi tiết đơn đăng ký"
        onClose={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <Clock3 size={24} className="text-white/60" />
            </div>
            <p className="text-sm text-white/60 mt-3">Đang tải...</p>
          </div>
        ) : !detail ? null : (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-semibold">
                {getClub(detail.clubId).fullName}
              </h3>
              <StatusBadge status={detail.status} />
            </div>

            <div className="space-y-4">
              <TimelineItem
                label="Đã gửi đơn"
                time={fmtDate(detail.submittedAt || detail.createdAt)}
                active
              />
              <TimelineItem
                label="CLB phản hồi"
                time={
                  detail.respondedAt
                    ? fmtDate(detail.respondedAt)
                    : "Chưa phản hồi"
                }
                active={!!detail.respondedAt}
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">{detail.reason}</p>
            </div>

            {(detail.interviewDate ||
              detail.interviewLocation ||
              detail.interviewNote) && (
              <div className="rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 p-5">
                <div className="font-semibold text-sky-200 mb-4">
                  📋 Phản hồi từ CLB
                </div>
                <div className="space-y-3 text-sm">
                  {detail.interviewDate && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⏰</span>
                      <span>{fmtDate(detail.interviewDate)}</span>
                    </div>
                  )}
                  {detail.interviewLocation && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📍</span>
                      <span>{detail.interviewLocation}</span>
                    </div>
                  )}
                  {detail.interviewNote && (
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">📝</span>
                      <span className="text-white/70">{detail.interviewNote}</span>
                    </div>
                  )}
                </div>

                {detail.status === "APPROVED" && (
                  <div className="mt-5 flex gap-3">
                    <button
                      disabled={responding !== null}
                      onClick={() => handleRespond("accept")}
                      className={cn(
                        "flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                        responding === "accept"
                          ? "bg-emerald-500 text-white scale-95"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95"
                      )}
                    >
                      ✓ Xác nhận tham gia
                    </button>
                    <button
                      disabled={responding !== null}
                      onClick={() => handleRespond("decline")}
                      className={cn(
                        "flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                        responding === "decline"
                          ? "border border-rose-400 bg-rose-500/20 text-rose-200 scale-95"
                          : "border border-rose-400/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 active:scale-95"
                      )}
                    >
                      ✕ Từ chối lịch
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= small components ================= */

function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border border-white/10 bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.08] transition-all",
        "group cursor-pointer"
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-3 p-2 rounded-lg w-fit",
            color
              ? `bg-gradient-to-br ${color}`
              : "bg-gradient-to-br from-violet-400 to-violet-600"
          )}
        >
          <div className="text-white">{icon}</div>
        </div>
      )}
      <div className="text-xs text-white/55 font-medium">{label}</div>
      <div className="text-3xl font-bold mt-2 text-white group-hover:text-cyan-300 transition-colors">
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  time,
  active,
}: {
  label: string;
  time: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full transition-all",
            active ? "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-lg shadow-cyan-500/50" : "bg-white/20"
          )}
        />
      </div>
      <div className="pb-4 flex-1">
        <div className={cn("font-medium text-sm", active ? "text-white" : "text-white/50")}>
          {label}
        </div>
        <div className="text-xs text-white/40 mt-1">{time}</div>
      </div>
    </div>
  );
}
