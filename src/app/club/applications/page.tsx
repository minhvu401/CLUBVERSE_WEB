/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import { AUTH_BASE_URL } from "@/app/services/api/auth";
import {
  getClubApplications,
  approveApplication,
  rejectApplication,
} from "@/app/services/api/applications";
import { createNotification } from "@/app/services/api/notifications";
import SendNotificationModal from "@/components/SendNotificationModal";

import {
  CheckCircle2,
  Clock3,
  Filter,
  MoreHorizontal,
  Search,
  Users2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  MapPin,
  NotebookPen,
  Mail,
  Phone,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDateTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("vi-VN", { hour12: false });
}

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACCEPTED" | "DECLINED";

type Application = {
  id: string;
  userId?: string;
  name: string;
  meta: string;
  reason: string;
  status: AppStatus;
  avatar?: string;
  email?: string;
  phone?: string;
  interviewDate?: string;
  interviewLocation?: string;
};

function StatCard({
  title,
  value,
  icon,
  tone = "yellow",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "yellow" | "green" | "red" | "blue";
}) {
  const toneMap: Record<string, string> = {
    yellow: "bg-yellow-400/15 text-yellow-200 border-yellow-400/25",
    green: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    red: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    blue: "bg-sky-400/15 text-sky-200 border-sky-400/25",
  };

  return (
    <div className={cn("rounded-2xl px-5 py-4", glass)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-white/60">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>

        <div
          className={cn(
            "h-9 w-9 rounded-xl grid place-items-center border",
            toneMap[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const map: Record<AppStatus, { text: string; cls: string; dot: string }> = {
    PENDING: {
      text: "Chờ duyệt",
      cls: "bg-amber-400/15 text-amber-200 border-amber-400/25",
      dot: "bg-amber-300",
    },
    APPROVED: {
      text: "Đã duyệt",
      cls: "bg-sky-400/15 text-sky-200 border-sky-400/25",
      dot: "bg-sky-300",
    },
    ACCEPTED: {
      text: "Đã chấp nhận",
      cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
      dot: "bg-emerald-300",
    },
    DECLINED: {
      text: "Đã từ chối (sau PV)",
      cls: "bg-white/10 text-white/70 border-white/15",
      dot: "bg-white/50",
    },
    REJECTED: {
      text: "Từ chối",
      cls: "bg-rose-400/15 text-rose-200 border-rose-400/25",
      dot: "bg-rose-300",
    },
  };

  const cfg = map[status] || map.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
        cfg.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.text}
    </span>
  );
}

function ActionButton({
  children,
  tone,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  tone: "green" | "red" | "gray";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const map: Record<string, string> = {
    green:
      "bg-emerald-500/85 hover:bg-emerald-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.20)]",
    red: "bg-rose-500/85 hover:bg-rose-500 text-white shadow-[0_10px_25px_rgba(244,63,94,0.20)]",
    gray: "bg-white/10 hover:bg-white/15 text-white/85 border border-white/10",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] font-semibold transition",
        map[tone],
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !busy && onClose()}
        aria-hidden
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white/90">{title}</div>
            <button
              type="button"
              onClick={() => !busy && onClose()}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/[0.10]",
                busy && "opacity-60 cursor-not-allowed",
              )}
              disabled={busy}
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** ✅ Map response -> UI */
function mapAppFromApi(raw: any): Application {
  const s = String(raw?.status || "").toUpperCase();
  const status: AppStatus =
    s === "PENDING"
      ? "PENDING"
      : s === "APPROVED"
        ? "APPROVED"
        : s === "REJECTED"
          ? "REJECTED"
          : s === "ACCEPTED"
            ? "ACCEPTED"
            : s === "DECLINED"
              ? "DECLINED"
              : "PENDING";

  const u = raw?.userId ?? {};
  const name = u?.fullName ?? "Không rõ tên";
  const school = u?.school || "Chưa cập nhật";
  const major = u?.major || "Chưa cập nhật";
  const year = typeof u?.year === "number" ? `Năm ${u.year}` : null;
  const meta =
    [school, major, year].filter(Boolean).join(" • ") || "Chưa cập nhật";

  const avatar = u?.avatarUrl
    ? u.avatarUrl.startsWith("http")
      ? u.avatarUrl
      : `${AUTH_BASE_URL}${u.avatarUrl}`
    : undefined;

  return {
    id: String(raw?._id ?? raw?.id ?? ""),
    userId: typeof raw?.userId === "string" ? raw.userId : String(u?._id ?? ""),
    name,
    meta,
    reason: raw?.reason ?? "",
    status,
    avatar,
    email: u?.email,
    phone: u?.phoneNumber,
    interviewDate: raw?.interviewDate,
    interviewLocation: raw?.interviewLocation,
  };
}

export default function ClubApplicationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role],
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isClubRole) return router.replace("/");
  }, [loading, token, isClubRole, router]);

  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all");
  const [q, setQ] = useState("");

  const [apps, setApps] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const clubId = useMemo(() => {
    const raw =
      user?.clubId ||
      user?.club?._id ||
      user?.managedClubId ||
      user?._id ||
      user?.id;
    return raw ? String(raw) : "";
  }, [user]);

  // toast
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2300);
    return () => clearTimeout(t);
  }, [toast]);

  // send notification modal
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // approve modal
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState(""); // "YYYY-MM-DDTHH:mm"
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNote, setInterviewNote] = useState("");
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token || !clubId) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setFetchErr(null);

        const list = await getClubApplications({
          accessToken: token,
          clubId,
          status: statusFilter === "all" ? undefined : statusFilter,
        });

        const mapped = list.map(mapAppFromApi).filter((x: Application) => x.id);

        if (!cancelled) setApps(mapped);
      } catch (e: any) {
        if (!cancelled) {
          setFetchErr(e?.message || "Lỗi tải danh sách đơn");
          setApps([]);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, clubId, statusFilter, loading]);

  const stats = useMemo(() => {
    const pending = apps.filter((a) => a.status === "PENDING").length;
    const approved = apps.filter((a) => a.status === "APPROVED").length;
    const rejected = apps.filter((a) => a.status === "REJECTED").length;
    const total = apps.length;
    return { pending, approved, rejected, total };
  }, [apps]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return apps;

    return apps.filter((a) => {
      return (
        a.name.toLowerCase().includes(query) ||
        a.meta.toLowerCase().includes(query) ||
        a.reason.toLowerCase().includes(query) ||
        (a.email ?? "").toLowerCase().includes(query) ||
        (a.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [apps, q]);

  // open approve modal
  const openApprove = (id: string) => {
    setApproveId(id);
    setInterviewDate(""); // reset
    setInterviewLocation("");
    setInterviewNote("");
    setApproveOpen(true);
  };

  // open reject modal
  const openReject = (id: string) => {
    setRejectId(id);
    setRejectionReason("");
    setRejectOpen(true);
  };

  // submit approve
  const submitApprove = async () => {
    if (!token) {
      setToast({ type: "err", text: "Bạn cần đăng nhập" });
      router.replace("/login");
      return;
    }
    if (!approveId) return;

    if (!interviewDate) {
      setToast({ type: "err", text: "Vui lòng chọn thời gian phỏng vấn" });
      return;
    }
    if (!interviewLocation.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập địa điểm phỏng vấn" });
      return;
    }

    try {
      setSubmittingApprove(true);

      // input type=datetime-local => không có timezone
      // chuyển sang ISO chuẩn
      const iso = new Date(interviewDate).toISOString();

      const data = await approveApplication({
        accessToken: token,
        id: approveId,
        interviewDate: iso,
        interviewLocation: interviewLocation.trim(),
        interviewNote: interviewNote.trim(),
      });

      setApps((prev) =>
        prev.map((a) =>
          a.id === approveId ? { ...a, status: "APPROVED" } : a,
        ),
      );

      setToast({ type: "ok", text: data?.message || "Duyệt đơn thành công" });

      // Gửi thông báo cho ứng viên
      const approvedApp = apps.find((a) => a.id === approveId);
      if (approvedApp?.userId) {
        createNotification(token, {
          userId: approvedApp.userId,
          title: "Đơn đăng ký đã được duyệt ✓",
          message: `Chúc mừng! Đơn đăng ký của bạn đã được duyệt. Địa điểm phỏng vấn: ${interviewLocation.trim()}.`,
          type: "APPLICATION_STATUS",
          metadata: { applicationId: approveId },
        }).catch(() => null);
      }

      setApproveOpen(false);
      setApproveId(null);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Duyệt đơn thất bại" });
    } finally {
      setSubmittingApprove(false);
    }
  };

  // submit reject
  const submitReject = async () => {
    if (!token) {
      setToast({ type: "err", text: "Bạn cần đăng nhập" });
      router.replace("/login");
      return;
    }
    if (!rejectId) return;

    if (!rejectionReason.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập lý do từ chối" });
      return;
    }

    try {
      setSubmittingReject(true);

      const data = await rejectApplication({
        accessToken: token,
        id: rejectId,
        rejectionReason: rejectionReason.trim(),
      });

      setApps((prev) =>
        prev.map((a) => (a.id === rejectId ? { ...a, status: "REJECTED" } : a)),
      );

      setToast({ type: "ok", text: data?.message || "Từ chối đơn thành công" });

      // Gửi thông báo cho ứng viên
      const rejectedApp = apps.find((a) => a.id === rejectId);
      if (rejectedApp?.userId) {
        createNotification(token, {
          userId: rejectedApp.userId,
          title: "Kết quả đơn đăng ký",
          message: `Rất tiếc! Đơn đăng ký của bạn chưa được chấp nhận. Lý do: ${rejectionReason.trim()}`,
          type: "APPLICATION_STATUS",
          metadata: { applicationId: rejectId },
        }).catch(() => null);
      }

      setRejectOpen(false);
      setRejectId(null);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Từ chối đơn thất bại" });
    } finally {
      setSubmittingReject(false);
    }
  };

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

        <Header />
        <main className="mx-auto max-w-6xl px-4 pt-10">
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Đang tải...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {/* toast */}
      {toast ? (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl border px-4 py-2 text-[0.78rem] backdrop-blur-xl shadow-lg",
              toast.type === "ok"
                ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
                : "border-rose-400/20 bg-rose-500/15 text-rose-50",
            )}
          >
            {toast.text}
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">Quản lý đơn đăng ký</div>
            <h1 className="mt-1 text-xl font-semibold text-white">
              Đơn Gia Nhập Câu Lạc Bộ
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Xem xét và phê duyệt đơn đăng ký thành viên mới
            </p>
            {fetchErr ? (
              <div className="mt-2 text-sm text-rose-200/90">{fetchErr}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setNotifModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-indigo-500/80 hover:bg-indigo-500 px-4 py-2 text-[0.78rem] font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Gửi thông báo CLB
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            title="Đơn chờ duyệt"
            value={stats.pending}
            tone="yellow"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <StatCard
            title="Đã phê duyệt"
            value={stats.approved}
            tone="green"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            title="Từ chối"
            value={stats.rejected}
            tone="red"
            icon={<XCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Tổng đơn"
            value={stats.total}
            tone="blue"
            icon={<Users2 className="h-5 w-5" />}
          />
        </div>

        <section className={cn("mt-6 rounded-3xl", glass)}>
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">
                Đơn Đăng Ký Mới
              </div>
              <div className="mt-1 text-xs text-white/55">
                {fetching
                  ? "Đang tải danh sách..."
                  : "Danh sách đơn đăng ký cần xử lý"}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[220px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 pr-10 text-sm text-white/85 outline-none hover:bg-white/[0.10]"
                  >
                    <option value="all" className="bg-[#0b1038]">
                      Tất cả trạng thái
                    </option>
                    <option value="PENDING" className="bg-[#0b1038]">
                      Chờ duyệt
                    </option>
                    <option value="APPROVED" className="bg-[#0b1038]">
                      Đã duyệt
                    </option>
                    <option value="REJECTED" className="bg-[#0b1038]">
                      Từ chối
                    </option>
                    <option value="ACCEPTED" className="bg-[#0b1038]">
                      Đã chấp nhận
                    </option>
                    <option value="DECLINED" className="bg-[#0b1038]">
                      Đã từ chối (sau PV)
                    </option>
                  </select>
                  <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/70">
                {fetching ? "Đang tải..." : "Không có đơn nào."}
              </div>
            ) : null}

            {filtered.map((a) => {
              const interviewTime = fmtDateTime(a.interviewDate);
              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            a.avatar ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                              a.name
                          }
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-white">
                            {a.name}
                          </div>
                          <StatusBadge status={a.status} />
                        </div>

                        <div className="mt-1 text-xs text-white/55">
                          {a.meta}
                        </div>

                        <p className="mt-2 text-sm text-white/70 leading-relaxed">
                          {a.reason}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-white/60">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {a.email || "Chưa có email"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {a.phone || "Chưa có số"}
                          </span>
                        </div>

                        {(a.interviewLocation || interviewTime) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-white/60">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {interviewTime && <span>{interviewTime}</span>}
                            {a.interviewLocation && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {a.interviewLocation}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 md:justify-start">
                      {a.status === "PENDING" ? (
                        <>
                          <ActionButton
                            tone="green"
                            onClick={() => openApprove(a.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </ActionButton>

                          <ActionButton
                            tone="red"
                            onClick={() => openReject(a.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </ActionButton>

                          <ActionButton
                            tone="gray"
                            onClick={() =>
                              router.push(`/club/applications/${a.id}`)
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            Chi tiết
                          </ActionButton>
                        </>
                      ) : (
                        <ActionButton
                          tone="gray"
                          onClick={() =>
                            router.push(`/club/applications/${a.id}`)
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          Chi tiết
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length > 0 && (
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-white/55">
                  Hiển thị {filtered.length} đơn
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* ✅ MODAL DUYỆT */}
      <Modal
        open={approveOpen}
        title="Duyệt đơn & gửi lịch phỏng vấn"
        onClose={() => setApproveOpen(false)}
        busy={submittingApprove}
      >
        <div className="space-y-3">
          <div className="text-[0.78rem] text-white/65">
            Nhập lịch phỏng vấn để gửi cho ứng viên.
          </div>

          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-[0.75rem] text-white/70">
              <CalendarDays size={14} /> Thời gian
            </div>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white/90 outline-none focus:border-white/20"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-[0.75rem] text-white/70">
              <MapPin size={14} /> Địa điểm
            </div>
            <input
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              placeholder="VD: Phòng A101, Tòa nhà B"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-[0.75rem] text-white/70">
              <NotebookPen size={14} /> Ghi chú
            </div>
            <textarea
              rows={3}
              value={interviewNote}
              onChange={(e) => setInterviewNote(e.target.value)}
              placeholder="VD: Vui lòng mang theo CV và portfolio"
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={submittingApprove}
              onClick={() => setApproveOpen(false)}
              className={cn(
                "rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]",
                submittingApprove && "opacity-60 cursor-not-allowed",
              )}
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={submittingApprove}
              onClick={submitApprove}
              className={cn(
                "rounded-full bg-emerald-500/85 px-4 py-2 text-[0.78rem] font-semibold text-white hover:bg-emerald-500",
                submittingApprove && "opacity-60 cursor-not-allowed",
              )}
            >
              {submittingApprove ? "Đang duyệt..." : "Xác nhận duyệt"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Gửi thông báo CLB */}
      <SendNotificationModal
        open={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        token={token}
        mode="club"
        clubId={clubId}
      />

      {/* ✅ MODAL TỪ CHỐI */}
      <Modal
        open={rejectOpen}
        title="Từ chối đơn đăng ký"
        onClose={() => setRejectOpen(false)}
        busy={submittingReject}
      >
        <div className="space-y-3">
          <div className="text-[0.78rem] text-white/65">
            Nhập lý do từ chối để gửi cho ứng viên.
          </div>

          <textarea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder='VD: "Hồ sơ chưa phù hợp với yêu cầu của câu lạc bộ"'
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={submittingReject}
              onClick={() => setRejectOpen(false)}
              className={cn(
                "rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]",
                submittingReject && "opacity-60 cursor-not-allowed",
              )}
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={submittingReject}
              onClick={submitReject}
              className={cn(
                "rounded-full bg-rose-500/85 px-4 py-2 text-[0.78rem] font-semibold text-white hover:bg-rose-500",
                submittingReject && "opacity-60 cursor-not-allowed",
              )}
            >
              {submittingReject ? "Đang từ chối..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
