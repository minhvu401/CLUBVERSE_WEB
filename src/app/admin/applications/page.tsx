/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  approveApplication,
  demoClubs,
  finalDecision,
  getApplicationById,
  getClub,
  getClubApplications,
  rejectApplication,
  type ApiStatus,
  type FilterStatus,
  type MyApplication,
  type ApplicantProfile,
} from "@/app/services/api/applications";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  Hash,
  Loader2,
  Mail,
  Phone,
  Search,
  ThumbsDown,
  ThumbsUp,
  Users2,
  X,
  XCircle,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN");
}

function toInputDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pickApplicant(app: MyApplication): ApplicantProfile {
  if (!app.userId) return { _id: "" };
  if (typeof app.userId === "string") return { _id: app.userId };
  return app.userId;
}

function StatCard({
  title,
  value,
  icon,
  tone = "blue",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-sky-400/15 text-sky-200 border-sky-400/25",
    green: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    red: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    yellow: "bg-amber-400/15 text-amber-200 border-amber-400/25",
    purple: "bg-violet-400/15 text-violet-200 border-violet-400/25",
    gray: "bg-white/10 text-white/70 border-white/15",
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
            toneMap[tone]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("rounded-3xl", glass, className)}>{children}</div>;
}

function StatusBadge({ status }: { status: ApiStatus }) {
  const s = String(status || "").toUpperCase();
  const map: Record<
    string,
    { text: string; cls: string; dot: string; icon: React.ReactNode }
  > = {
    PENDING: {
      text: "Chờ duyệt",
      cls: "bg-amber-400/15 text-amber-200 border-amber-400/25",
      dot: "bg-amber-300",
      icon: <Clock3 className="h-4 w-4" />,
    },
    APPROVED: {
      text: "Đã duyệt",
      cls: "bg-sky-400/15 text-sky-200 border-sky-400/25",
      dot: "bg-sky-300",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    ACCEPTED: {
      text: "Đã chấp nhận",
      cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
      dot: "bg-emerald-300",
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    DECLINED: {
      text: "Đã từ chối (sau PV)",
      cls: "bg-white/10 text-white/70 border-white/15",
      dot: "bg-white/50",
      icon: <ThumbsDown className="h-4 w-4" />,
    },
    REJECTED: {
      text: "Từ chối",
      cls: "bg-rose-400/15 text-rose-200 border-rose-400/25",
      dot: "bg-rose-300",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const cfg = map[s] ?? map.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
        cfg.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
  maxWidth = "max-w-3xl",
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-90">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 w-[92vw] -translate-x-1/2 -translate-y-1/2 max-h-[92vh] overflow-y-auto",
          maxWidth
        )}
      >
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white/90">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/6 hover:bg-white/10"
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

const actionTitles: Record<"approve" | "reject" | "final", string> = {
  approve: "Phê duyệt & gửi lịch phỏng vấn",
  reject: "Từ chối ứng viên",
  final: "Quyết định cuối cùng",
};

export default function ClubAdminApplicationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const isAdmin = useMemo(
    () => String(user?.role || "").toLowerCase() === "admin",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isAdmin) return router.replace("/");
  }, [loading, token, isAdmin, router]);

  const clubIdFromProfile = useMemo(() => {
    const raw =
      (user as any)?.clubId ||
      (user as any)?.club?._id ||
      (user as any)?.managedClubId;
    return raw ? String(raw) : "";
  }, [user]);

  const isDemoMode = !clubIdFromProfile;
  const managedClub = useMemo(() => {
    if (clubIdFromProfile) return getClub(clubIdFromProfile);
    if (demoClubs.length) return demoClubs[0];
    return getClub(undefined);
  }, [clubIdFromProfile]);

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [q, setQ] = useState("");
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshApplications = useCallback(async () => {
    if (!token || !clubIdFromProfile) return;
    try {
      setFetching(true);
      setFetchErr(null);
      const list = await getClubApplications({
        accessToken: token,
        clubId: clubIdFromProfile,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setApps(list);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đơn đăng ký";
      setFetchErr(message);
      setApps([]);
    } finally {
      setFetching(false);
    }
  }, [token, clubIdFromProfile, statusFilter]);

  useEffect(() => {
    if (loading) return;
    if (!clubIdFromProfile) {
      setApps([]);
      setFetchErr(
        "Tài khoản chưa được gán CLB quản lý. Đang hiển thị dữ liệu demo."
      );
      return;
    }
    void refreshApplications();
  }, [loading, clubIdFromProfile, refreshApplications]);

  const stats = useMemo(() => {
    const count = (s: string) =>
      apps.filter((a) => String(a.status).toUpperCase() === s).length;
    return {
      pending: count("PENDING"),
      approved: count("APPROVED"),
      rejected: count("REJECTED"),
      accepted: count("ACCEPTED"),
      declined: count("DECLINED"),
      total: apps.length,
    };
  }, [apps]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return apps;

    return apps.filter((app) => {
      const applicant = pickApplicant(app);
      const club = getClub(app.clubId);

      return (
        String(app._id || "")
          .toLowerCase()
          .includes(query) ||
        String(app.reason || "")
          .toLowerCase()
          .includes(query) ||
        String(app.status || "")
          .toLowerCase()
          .includes(query) ||
        String(applicant.fullName || "")
          .toLowerCase()
          .includes(query) ||
        String(applicant.email || "")
          .toLowerCase()
          .includes(query) ||
        String(applicant.school || "")
          .toLowerCase()
          .includes(query) ||
        String(club.fullName || "")
          .toLowerCase()
          .includes(query) ||
        String(club.category || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [apps, q]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MyApplication | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  const openDetail = (app: MyApplication) => {
    setSelectedApp(app);
    setDetailErr(null);
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!detailOpen || !token || !selectedApp?._id) return;
    let cancelled = false;

    (async () => {
      try {
        setDetailLoading(true);
        setDetailErr(null);
        const fresh = await getApplicationById({
          accessToken: token,
          id: selectedApp._id,
        });
        if (!cancelled) setSelectedApp(fresh);
      } catch (error) {
        if (!cancelled) {
          setDetailErr(
            error instanceof Error
              ? error.message
              : "Không thể tải chi tiết đơn đăng ký"
          );
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detailOpen, token, selectedApp?._id]);

  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "final";
    app: MyApplication;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveForm, setApproveForm] = useState({
    interviewDate: "",
    interviewLocation: "",
    interviewNote: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [finalForm, setFinalForm] = useState<{
    decision: "accepted" | "declined";
    rejectionReason: string;
  }>({
    decision: "accepted",
    rejectionReason: "",
  });

  const openAction = (
    type: "approve" | "reject" | "final",
    app: MyApplication
  ) => {
    setActionModal({ type, app });
    setActionLoading(false);

    if (type === "approve") {
      setApproveForm({
        interviewDate: toInputDateTime(app.interviewDate),
        interviewLocation: app.interviewLocation || "",
        interviewNote: app.interviewNote || "",
      });
    }

    if (type === "reject") {
      setRejectReason(app.rejectionReason || "");
    }

    if (type === "final") {
      setFinalForm({ decision: "accepted", rejectionReason: "" });
    }
  };

  const closeAction = () => {
    setActionModal(null);
    setApproveForm({
      interviewDate: "",
      interviewLocation: "",
      interviewNote: "",
    });
    setRejectReason("");
    setFinalForm({ decision: "accepted", rejectionReason: "" });
    setActionLoading(false);
  };

  const handleApprove = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !actionModal?.app) return;
    if (!approveForm.interviewDate || !approveForm.interviewLocation) {
      setToast({
        type: "err",
        text: "Vui lòng nhập thời gian và địa điểm phỏng vấn",
      });
      return;
    }

    try {
      setActionLoading(true);
      await approveApplication({
        accessToken: token,
        id: actionModal.app._id,
        interviewDate: new Date(approveForm.interviewDate).toISOString(),
        interviewLocation: approveForm.interviewLocation,
        interviewNote: approveForm.interviewNote?.trim() || undefined,
      });
      setToast({ type: "ok", text: "Đã gửi lịch phỏng vấn" });
      closeAction();
      await refreshApplications();
    } catch (error) {
      setToast({
        type: "err",
        text:
          error instanceof Error ? error.message : "Không thể phê duyệt đơn",
      });
      setActionLoading(false);
    }
  };

  const handleReject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !actionModal?.app) return;
    if (!rejectReason.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập lý do từ chối" });
      return;
    }

    try {
      setActionLoading(true);
      await rejectApplication({
        accessToken: token,
        id: actionModal.app._id,
        rejectionReason: rejectReason.trim(),
      });
      setToast({ type: "ok", text: "Đã từ chối ứng viên" });
      closeAction();
      await refreshApplications();
    } catch (error) {
      setToast({
        type: "err",
        text: error instanceof Error ? error.message : "Không thể từ chối đơn",
      });
      setActionLoading(false);
    }
  };

  const handleFinalDecision = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !actionModal?.app) return;
    if (
      finalForm.decision === "declined" &&
      !finalForm.rejectionReason.trim()
    ) {
      setToast({ type: "err", text: "Vui lòng nhập lý do từ chối" });
      return;
    }

    try {
      setActionLoading(true);
      await finalDecision({
        accessToken: token,
        id: actionModal.app._id,
        decision: finalForm.decision,
        rejectionReason:
          finalForm.decision === "declined"
            ? finalForm.rejectionReason.trim()
            : undefined,
      });
      setToast({ type: "ok", text: "Đã cập nhật kết quả cuối" });
      closeAction();
      await refreshApplications();
    } catch (error) {
      setToast({
        type: "err",
        text:
          error instanceof Error ? error.message : "Không thể cập nhật kết quả",
      });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

        <Header />
        <main className="mx-auto max-w-7xl px-4 pt-10">
          <Card className="p-6 text-sm text-white/70">Đang tải...</Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {toast ? (
        <div className="fixed left-1/2 top-5 z-95 -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl border px-4 py-2 text-[0.78rem] backdrop-blur-xl shadow-lg",
              toast.type === "ok"
                ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
                : "border-rose-400/20 bg-rose-500/15 text-rose-50"
            )}
          >
            {toast.text}
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <div className="mb-6 space-y-2">
          <div className="text-sm text-white/60">Admin CLB</div>
          <h1 className="text-2xl font-semibold text-white">
            Quản Lý Đơn Đăng Ký
          </h1>
          <p className="text-sm text-white/65">
            Theo dõi trạng thái, gửi lịch phỏng vấn và đưa ra quyết định cuối
            cùng cho ứng viên của CLB.
          </p>
          <div className="text-xs text-white/70">
            Đang quản lý:{" "}
            <span className="font-semibold text-white">
              {managedClub.fullName}
            </span>
            {isDemoMode ? " (demo)" : ""}
          </div>
          {fetchErr ? (
            <div className="text-sm text-rose-200/90">{fetchErr}</div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <StatCard
            title="Chờ duyệt"
            value={stats.pending}
            tone="yellow"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <StatCard
            title="Đã duyệt"
            value={stats.approved}
            tone="blue"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            title="Đã từ chối"
            value={stats.rejected}
            tone="red"
            icon={<XCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Đã nhận"
            value={stats.accepted}
            tone="green"
            icon={<ThumbsUp className="h-5 w-5" />}
          />
          <StatCard
            title="Từ chối (PV)"
            value={stats.declined}
            tone="purple"
            icon={<ThumbsDown className="h-5 w-5" />}
          />
          <StatCard
            title="Tổng"
            value={stats.total}
            tone="gray"
            icon={<FileText className="h-5 w-5" />}
          />
        </div>

        <section className={cn("mt-6 rounded-3xl", glass)}>
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">
                Danh sách đơn đăng ký
              </div>
              <div className="mt-1 text-xs text-white/55">
                {fetching ? "Đang tải..." : `${filtered.length} đơn`}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Tìm theo ứng viên, CLB, trạng thái..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[260px]"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as FilterStatus)
                  }
                  className="appearance-none rounded-full border border-white/10 bg-white/6 px-4 py-2 pr-10 text-sm text-white/85 outline-none hover:bg-white/10"
                >
                  <option value="all" className="bg-[#0b1038]">
                    Tất cả
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
                    Đã nhận
                  </option>
                  <option value="DECLINED" className="bg-[#0b1038]">
                    Từ chối (PV)
                  </option>
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/4 p-5 text-sm text-white/70">
                {fetching ? "Đang tải..." : "Không có đơn nào phù hợp."}
              </div>
            ) : null}

            {filtered.map((app) => {
              const applicant = pickApplicant(app);
              const club = getClub(app.clubId);
              const status = String(app.status).toUpperCase();
              const canApprove = status === "PENDING";
              const canReject = status === "PENDING" || status === "APPROVED";
              const canFinal = status === "APPROVED";

              return (
                <div
                  key={app._id}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-white">
                          {applicant.fullName || "Không rõ tên"}
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="mt-1 text-xs text-white/55">
                        {applicant.school || "—"} • {applicant.major || "—"}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] text-white/80">
                          <Building2 className="h-4 w-4 text-white/60" />
                          {club.fullName || "—"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] text-white/80">
                          <Mail className="h-4 w-4 text-white/60" />
                          {applicant.email || "—"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] text-white/80">
                          <CalendarDays className="h-4 w-4 text-white/60" />
                          {fmtDate(app.submittedAt || app.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] text-white/80">
                          <Hash className="h-4 w-4 text-white/60" />
                          {app._id}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
                        <span className="font-semibold text-white/80">
                          Lý do:
                        </span>{" "}
                        {app.reason || "—"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-56">
                      <button
                        type="button"
                        onClick={() => openDetail(app)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[0.75rem] font-semibold text-white/85 hover:bg-white/12"
                      >
                        <Eye className="h-4 w-4" />
                        Chi tiết
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        {canApprove ? (
                          <button
                            type="button"
                            onClick={() => openAction("approve", app)}
                            className="rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-2 text-[0.68rem] font-semibold text-emerald-50 hover:bg-emerald-500/25"
                          >
                            Phê duyệt
                          </button>
                        ) : null}
                        {canReject ? (
                          <button
                            type="button"
                            onClick={() => openAction("reject", app)}
                            className="rounded-full border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-[0.68rem] font-semibold text-rose-50 hover:bg-rose-500/25"
                          >
                            Từ chối
                          </button>
                        ) : null}
                        {canFinal ? (
                          <button
                            type="button"
                            onClick={() => openAction("final", app)}
                            className="col-span-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[0.68rem] font-semibold text-white/85 hover:bg-white/10"
                          >
                            Quyết định cuối
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      <Modal
        open={detailOpen}
        title="Chi tiết đơn đăng ký"
        onClose={() => {
          setDetailOpen(false);
          setSelectedApp(null);
          setDetailErr(null);
        }}
      >
        {!selectedApp ? (
          <div className="text-sm text-white/70">—</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-white/90">
                  {pickApplicant(selectedApp).fullName || "Không rõ tên"}
                </div>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              {detailLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white/60" />
              ) : null}
            </div>
            {detailErr ? (
              <div className="text-sm text-rose-200/90">{detailErr}</div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Users2 className="h-4 w-4" />
                  Thông tin ứng viên
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Họ tên:</span>{" "}
                    {pickApplicant(selectedApp).fullName || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Email:</span>{" "}
                    {pickApplicant(selectedApp).email || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Phone:</span>{" "}
                    {pickApplicant(selectedApp).phoneNumber || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Trường:</span>{" "}
                    {pickApplicant(selectedApp).school || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Ngành:</span>{" "}
                    {pickApplicant(selectedApp).major || "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Building2 className="h-4 w-4" />
                  Thông tin CLB
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Tên CLB:</span>{" "}
                    {getClub(selectedApp.clubId).fullName || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Email:</span>{" "}
                    {getClub(selectedApp.clubId).email || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Danh mục:</span>{" "}
                    {getClub(selectedApp.clubId).category || "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-xs font-semibold text-white/80 mb-3">
                  ID & Thời gian
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-white/60" />
                    <span className="truncate font-mono text-xs text-white/75">
                      {selectedApp._id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Gửi lúc:</span>{" "}
                    {fmtDate(selectedApp.submittedAt || selectedApp.createdAt)}
                  </div>
                  <div>
                    <span className="text-white/60">Cập nhật:</span>{" "}
                    {fmtDate(selectedApp.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-xs font-semibold text-white/80 mb-3">
                  Trạng thái
                </div>
                <div className="space-y-2">
                  <StatusBadge status={selectedApp.status} />
                  <div className="text-xs text-white/60">
                    {(() => {
                      const status = String(selectedApp.status).toUpperCase();
                      if (status === "PENDING") return "Đang chờ CLB xử lý";
                      if (status === "APPROVED")
                        return "Đã gửi lịch/đang chờ ứng viên";
                      if (status === "ACCEPTED")
                        return "Ứng viên đã trở thành thành viên";
                      if (status === "DECLINED")
                        return "Ứng viên từ chối sau phỏng vấn";
                      if (status === "REJECTED") return "CLB đã từ chối";
                      return "";
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <div className="text-xs font-semibold text-white/80 mb-2">
                Lý do đăng ký
              </div>
              <div className="whitespace-pre-line text-sm text-white/75">
                {selectedApp.reason || "—"}
              </div>
            </div>

            {selectedApp.interviewDate ||
            selectedApp.interviewLocation ||
            selectedApp.interviewNote ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-100">
                  <AlertCircle className="h-4 w-4" />
                  Lịch phỏng vấn
                </div>
                <div className="space-y-1 text-sm text-white/75">
                  <div>
                    <span className="text-white/60">Thời gian:</span>{" "}
                    {fmtDate(selectedApp.interviewDate)}
                  </div>
                  <div>
                    <span className="text-white/60">Địa điểm:</span>{" "}
                    {selectedApp.interviewLocation || "—"}
                  </div>
                  {selectedApp.interviewNote ? (
                    <div>
                      <span className="text-white/60">Ghi chú:</span>{" "}
                      {selectedApp.interviewNote}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {String(selectedApp.status).toUpperCase() === "REJECTED" &&
            selectedApp.rejectionReason ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-100">
                  <XCircle className="h-4 w-4" />
                  Lý do từ chối
                </div>
                <div className="text-sm text-white/75">
                  {selectedApp.rejectionReason}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDetailOpen(false);
                  setSelectedApp(null);
                  setDetailErr(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(actionModal)}
        title={actionModal ? actionTitles[actionModal.type] : ""}
        onClose={closeAction}
        maxWidth="max-w-xl"
      >
        {!actionModal ? null : actionModal.type === "approve" ? (
          <form className="space-y-4" onSubmit={handleApprove}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">
                Thời gian phỏng vấn *
              </label>
              <input
                type="datetime-local"
                value={approveForm.interviewDate}
                onChange={(event) =>
                  setApproveForm((prev) => ({
                    ...prev,
                    interviewDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">
                Địa điểm *
              </label>
              <input
                type="text"
                value={approveForm.interviewLocation}
                onChange={(event) =>
                  setApproveForm((prev) => ({
                    ...prev,
                    interviewLocation: event.target.value,
                  }))
                }
                placeholder="Phòng 401, nhà A, cơ sở Thủ Đức..."
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">
                Ghi chú
              </label>
              <textarea
                value={approveForm.interviewNote}
                onChange={(event) =>
                  setApproveForm((prev) => ({
                    ...prev,
                    interviewNote: event.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                placeholder="Mang laptop, dress code smart casual..."
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAction}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/8"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-50 hover:bg-emerald-500/30 disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Gửi lịch
              </button>
            </div>
          </form>
        ) : actionModal.type === "reject" ? (
          <form className="space-y-4" onSubmit={handleReject}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">
                Lý do từ chối *
              </label>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                placeholder="Ví dụ: chưa phù hợp lịch sinh hoạt, thiếu kinh nghiệm..."
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAction}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/8"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-500/30 disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Từ chối
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleFinalDecision}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70">
                Kết quả *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      label: "Nhận vào CLB",
                      value: "accepted",
                      tone: "emerald",
                    },
                    {
                      label: "Ứng viên từ chối",
                      value: "declined",
                      tone: "white",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFinalForm((prev) => ({
                        ...prev,
                        decision: option.value,
                      }))
                    }
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold",
                      finalForm.decision === option.value
                        ? option.value === "accepted"
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-50"
                          : "border-white/40 bg-white/20 text-white"
                        : "border-white/10 bg-white/4 text-white/70"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {finalForm.decision === "declined" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/70">
                  Lý do (bắt buộc khi từ chối)
                </label>
                <textarea
                  value={finalForm.rejectionReason}
                  onChange={(event) =>
                    setFinalForm((prev) => ({
                      ...prev,
                      rejectionReason: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  placeholder="Ứng viên không xác nhận, không phù hợp định hướng..."
                />
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeAction}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/8"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Lưu kết quả
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
