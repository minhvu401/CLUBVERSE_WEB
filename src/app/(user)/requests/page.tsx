/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders/page";
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
  Users2,
  Search,
  FileText,
  X,
  BadgeCheck,
  BadgeX,
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

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <AppSidebar activeKey="requests" />

        <main className="flex-1 space-y-4">
          {/* title */}
          <div className={cn("rounded-3xl p-5", glass)}>
            <h1 className="text-lg font-semibold">Đơn đã gửi</h1>
            <p className="mt-1 text-xs text-white/55">
              Theo dõi trạng thái đăng ký câu lạc bộ
            </p>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Chờ duyệt" value={stats.pending} />
            <Stat label="Đã duyệt" value={stats.approved} />
            <Stat label="Bị từ chối" value={stats.rejected} />
            <Stat label="Tổng" value={stats.total} />
          </div>

          {/* list */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="text-sm font-semibold">Danh sách đơn</div>
              <div className="flex items-center gap-2">
                <Search size={14} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 p-5">
              {filtered.map((a) => {
                const club = getClub(a.clubId);
                return (
                  <div
                    key={a._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {club.fullName || "Câu lạc bộ"}
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <p className="mt-2 text-sm text-white/70 line-clamp-2">
                      {a.reason}
                    </p>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => openDetail(a._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs"
                      >
                        <FileText size={14} />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
          <div className="text-sm text-white/70">Đang tải...</div>
        ) : !detail ? null : (
          <div className="space-y-4 text-sm text-white/85">
            <StatusBadge status={detail.status} />

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

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              {detail.reason}
            </div>

            {(detail.interviewDate ||
              detail.interviewLocation ||
              detail.interviewNote) && (
              <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 p-4">
                <div className="font-semibold text-sky-200 mb-2">
                  Phản hồi từ CLB
                </div>
                <div>⏰ {fmtDate(detail.interviewDate)}</div>
                <div>📍 {detail.interviewLocation}</div>
                {detail.interviewNote && <div>📝 {detail.interviewNote}</div>}

                {detail.status === "APPROVED" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      disabled={responding !== null}
                      onClick={() => handleRespond("accept")}
                      className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950"
                    >
                      Xác nhận tham gia
                    </button>
                    <button
                      disabled={responding !== null}
                      onClick={() => handleRespond("decline")}
                      className="flex-1 rounded-full border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-200"
                    >
                      Từ chối lịch
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn("rounded-2xl p-4", glass)}>
      <div className="text-xs text-white/55">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
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
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-1 h-2.5 w-2.5 rounded-full",
          active ? "bg-sky-400" : "bg-white/30"
        )}
      />
      <div>
        <div className={active ? "font-semibold" : "text-white/50"}>
          {label}
        </div>
        <div className="text-xs text-white/50">{time}</div>
      </div>
    </div>
  );
}
