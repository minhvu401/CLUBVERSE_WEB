/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import { AUTH_BASE_URL } from "@/app/services/api/auth";
import {
  getApplicationById,
  approveApplication,
  rejectApplication,
  finalDecision,
} from "@/app/services/api/applications";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hash,
  Mail,
  MapPin,
  Phone,
  Users2,
  X,
  XCircle,
  NotebookPen,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type RawStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACCEPTED"
  | "DECLINED"
  | string;

type ClubInfo = {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  category?: string;
  description?: string;
};

type UserInfo = {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  school?: string;
  major?: string;
  year?: number;
  skills?: string[];
  interests?: string[];
  avatarUrl?: string;
};

type ApplicationDetail = {
  _id: string;
  clubId: ClubInfo;
  userId: UserInfo;
  reason?: string;
  status: RawStatus;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // optional fields backend có thể trả
  interviewDate?: string;
  interviewLocation?: string;
  interviewNote?: string;
  rejectionReason?: string;
};

function StatusBadge({ status }: { status: RawStatus }) {
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
      text: "Đã duyệt (chờ phản hồi)",
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
      text: "CLB từ chối",
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
      {children}
    </span>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("rounded-3xl", glass, className)}>{children}</div>;
}

/** ✅ simple modal */
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
              disabled={busy}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/[0.10]",
                busy && "opacity-60 cursor-not-allowed"
              )}
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

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

/** ✅ build avatar url ("/uploads/.." -> base + path) */
function buildAvatarUrl(raw?: string, name?: string) {
  if (!raw)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      name || "user"
    )}`;
  if (raw.startsWith("http")) return raw;
  return `${AUTH_BASE_URL}${raw}`;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const applicationId = params?.id;

  const { user, token, loading } = useAuth() as any;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ✅ toast
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2300);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isClubRole) return router.replace("/");
  }, [loading, token, isClubRole, router]);

  useEffect(() => {
    if (loading) return;
    if (!token || !applicationId) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setErr(null);

        const res = await getApplicationById({
          accessToken: token,
          id: applicationId,
        });
        if (!cancelled) setData(res as any);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Lỗi tải chi tiết đơn");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, applicationId, loading]);

  const club = data?.clubId;
  const applicant = data?.userId;

  const statusUpper = useMemo(
    () => String(data?.status || "").toUpperCase(),
    [data?.status]
  );
  const canAction = statusUpper === "PENDING";
  const canFinalDecision = statusUpper === "APPROVED";

  // ✅ approve modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState(""); // datetime-local
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNote, setInterviewNote] = useState("");
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // ✅ reject modal state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // ✅ final decision modal state
  const [finalOpen, setFinalOpen] = useState(false);
  const [finalDecisionType, setFinalDecisionType] = useState<
    "accepted" | "declined"
  >("accepted");
  const [finalRejectionReason, setFinalRejectionReason] = useState("");
  const [submittingFinal, setSubmittingFinal] = useState(false);

  const onApprove = async () => {
    if (!token || !applicationId) return;

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

      // datetime-local -> ISO
      const iso = new Date(interviewDate).toISOString();

      const res = await approveApplication({
        accessToken: token,
        id: applicationId,
        interviewDate: iso,
        interviewLocation: interviewLocation.trim(),
        interviewNote: interviewNote.trim(),
      });

      // update UI ngay (khỏi refetch)
      setData((prev) =>
        prev
          ? ({
              ...prev,
              status: "APPROVED",
              interviewDate: iso,
              interviewLocation: interviewLocation.trim(),
              interviewNote: interviewNote.trim(),
              updatedAt: new Date().toISOString(),
            } as any)
          : prev
      );

      setToast({ type: "ok", text: res?.message || "Duyệt đơn thành công" });
      setApproveOpen(false);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Duyệt đơn thất bại" });
    } finally {
      setSubmittingApprove(false);
    }
  };

  const onReject = async () => {
    if (!token || !applicationId) return;

    if (!rejectionReason.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập lý do từ chối" });
      return;
    }

    try {
      setSubmittingReject(true);

      const res = await rejectApplication({
        accessToken: token,
        id: applicationId,
        rejectionReason: rejectionReason.trim(),
      });

      setData((prev) =>
        prev
          ? ({
              ...prev,
              status: "REJECTED",
              rejectionReason: rejectionReason.trim(),
              updatedAt: new Date().toISOString(),
            } as any)
          : prev
      );

      setToast({ type: "ok", text: res?.message || "Từ chối đơn thành công" });
      setRejectOpen(false);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Từ chối đơn thất bại" });
    } finally {
      setSubmittingReject(false);
    }
  };

  const onFinalDecision = async () => {
    if (!token || !applicationId) return;

    if (finalDecisionType === "declined" && !finalRejectionReason.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập lý do từ chối" });
      return;
    }

    try {
      setSubmittingFinal(true);

      const res = await finalDecision({
        accessToken: token,
        id: applicationId,
        decision: finalDecisionType,
        rejectionReason:
          finalDecisionType === "declined"
            ? finalRejectionReason.trim()
            : undefined,
      });

      setData((prev) =>
        prev
          ? ({
              ...prev,
              status:
                finalDecisionType === "accepted" ? "ACCEPTED" : "DECLINED",
              rejectionReason:
                finalDecisionType === "declined"
                  ? finalRejectionReason.trim()
                  : prev.rejectionReason,
              updatedAt: new Date().toISOString(),
            } as any)
          : prev
      );

      setToast({ type: "ok", text: res?.message || "Quyết định thành công" });
      setFinalOpen(false);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Quyết định thất bại" });
    } finally {
      setSubmittingFinal(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {/* Toast */}
      {toast ? (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2">
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

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Application detail</div>
            <h1 className="mt-1 text-xl font-semibold text-white">
              Chi Tiết Đơn Đăng Ký
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Xem thông tin sinh viên và nội dung đơn đăng ký
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {fetching ? (
          <Card className="p-6 text-sm text-white/70">Đang tải...</Card>
        ) : err ? (
          <Card className="p-6 text-sm text-rose-200/90">{err}</Card>
        ) : !data ? (
          <Card className="p-6 text-sm text-white/70">Không có dữ liệu.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT */}
            <div className="space-y-5 lg:col-span-2">
              {/* HERO APPLICANT */}
              <Card className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={buildAvatarUrl(
                          applicant?.avatarUrl,
                          applicant?.fullName
                        )}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-white">
                          {applicant?.fullName || "Không rõ tên"}
                        </h2>
                        <StatusBadge status={data.status} />
                      </div>

                      <div className="mt-1 text-sm text-white/60">
                        {applicant?.school || "—"} • {applicant?.major || "—"}
                        {typeof applicant?.year === "number"
                          ? ` • Năm ${applicant.year}`
                          : ""}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip>
                          <Hash className="mr-2 inline h-4 w-4 text-white/60" />
                          {data._id}
                        </Chip>
                        <Chip>
                          <CalendarDays className="mr-2 inline h-4 w-4 text-white/60" />
                          {fmtDate(data.submittedAt || data.createdAt)}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Email</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                      <Mail className="h-4 w-4 text-white/60" />
                      <span className="truncate">
                        {applicant?.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Số điện thoại</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                      <Phone className="h-4 w-4 text-white/60" />
                      <span className="truncate">
                        {applicant?.phoneNumber || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Kỹ năng</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(applicant?.skills?.length
                        ? applicant.skills
                        : ["—"]
                      ).map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Sở thích</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(applicant?.interests?.length
                        ? applicant.interests
                        : ["—"]
                      ).map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs text-white/60">Lý do đăng ký</div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/85">
                    {data.reason || "—"}
                  </p>
                </div>
              </Card>

              {/* REASON */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-white">
                  Lý do đăng ký
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {data.reason || "—"}
                </p>
              </Card>

              {/* INTERVIEW DETAILS (if approved) */}
              {data.interviewDate && (
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-white">
                    Thông tin phỏng vấn
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-white/60" />
                      <div>
                        <div className="text-xs text-white/60">Thời gian</div>
                        <div className="mt-1 text-sm text-white/85">
                          {fmtDate(data.interviewDate)}
                        </div>
                      </div>
                    </div>
                    {data.interviewLocation && (
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-white/60" />
                        <div>
                          <div className="text-xs text-white/60">Địa điểm</div>
                          <div className="mt-1 text-sm text-white/85">
                            {data.interviewLocation}
                          </div>
                        </div>
                      </div>
                    )}
                    {data.interviewNote && (
                      <div className="flex items-start gap-3">
                        <NotebookPen className="mt-0.5 h-4 w-4 text-white/60" />
                        <div>
                          <div className="text-xs text-white/60">Ghi chú</div>
                          <div className="mt-1 text-sm text-white/85 whitespace-pre-line">
                            {data.interviewNote}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* REJECTION REASON (if rejected) */}
              {data.rejectionReason && (
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-white">
                    Lý do từ chối
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
                    {data.rejectionReason}
                  </p>
                </Card>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              <div className="lg:sticky lg:top-24 space-y-5">
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-white">
                    Thông tin câu lạc bộ
                  </h3>

                  <div className="mt-4 space-y-3 text-sm text-white/75">
                    <div className="flex items-start gap-2">
                      <Users2 className="mt-0.5 h-4 w-4 text-white/60" />
                      <div className="min-w-0">
                        <div className="font-semibold text-white/90">
                          {club?.fullName || "—"}
                        </div>
                        <div className="text-xs text-white/55">
                          {club?.category ? `Danh mục: ${club.category}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/60" />
                      <span className="truncate">{club?.email || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white/60" />
                      <span className="truncate">
                        {club?.phoneNumber || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/60" />
                      <span className="truncate">—</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-white">
                    Thời gian
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-white/70">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Submitted</span>
                      <span className="text-white/85 font-semibold">
                        {fmtDate(data.submittedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Created</span>
                      <span className="text-white/85 font-semibold">
                        {fmtDate(data.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Updated</span>
                      <span className="text-white/85 font-semibold">
                        {fmtDate(data.updatedAt)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* ACTIONS (✅ gắn API approve/reject) */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-white">
                    Hành động
                  </h3>

                  {!canAction && !canFinalDecision ? (
                    <div className="mt-3 text-sm text-white/60">
                      Đơn đã được xử lý. Không thể duyệt/từ chối lại.
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2">
                    {canAction ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-emerald-500/85 text-white hover:bg-emerald-500"
                          onClick={() => {
                            setInterviewDate("");
                            setInterviewLocation("");
                            setInterviewNote("");
                            setApproveOpen(true);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Duyệt
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-rose-500/85 text-white hover:bg-rose-500"
                          onClick={() => {
                            setRejectionReason("");
                            setRejectOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </>
                    ) : canFinalDecision ? (
                      <>
                        <div className="mb-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-xs text-sky-100">
                          Đơn đã được duyệt. Bạn có thể đưa ra quyết định cuối
                          cùng sau phỏng vấn.
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-emerald-500/85 text-white hover:bg-emerald-500"
                          onClick={() => {
                            setFinalDecisionType("accepted");
                            setFinalRejectionReason("");
                            setFinalOpen(true);
                          }}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Chấp nhận
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-rose-500/85 text-white hover:bg-rose-500"
                          onClick={() => {
                            setFinalDecisionType("declined");
                            setFinalRejectionReason("");
                            setFinalOpen(true);
                          }}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Từ chối
                        </button>
                      </>
                    ) : null}

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.10]"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Về danh sách
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ✅ MODAL APPROVE */}
      <Modal
        open={approveOpen}
        title="Duyệt đơn & gửi lịch phỏng vấn"
        onClose={() => setApproveOpen(false)}
        busy={submittingApprove}
      >
        <div className="space-y-3">
          <div className="text-[0.78rem] text-white/65">
            Nhập lịch phỏng vấn để gửi cho sinh viên.
          </div>

          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-[0.75rem] text-white/70">
              <CalendarDays size={14} /> Thời gian phỏng vấn
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
                submittingApprove && "opacity-60 cursor-not-allowed"
              )}
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={submittingApprove}
              onClick={onApprove}
              className={cn(
                "rounded-full bg-emerald-500/85 px-4 py-2 text-[0.78rem] font-semibold text-white hover:bg-emerald-500",
                submittingApprove && "opacity-60 cursor-not-allowed"
              )}
            >
              {submittingApprove ? "Đang duyệt..." : "Xác nhận duyệt"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ MODAL REJECT */}
      <Modal
        open={rejectOpen}
        title="Từ chối đơn đăng ký"
        onClose={() => setRejectOpen(false)}
        busy={submittingReject}
      >
        <div className="space-y-3">
          <div className="text-[0.78rem] text-white/65">
            Nhập lý do từ chối để gửi cho sinh viên.
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
                submittingReject && "opacity-60 cursor-not-allowed"
              )}
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={submittingReject}
              onClick={onReject}
              className={cn(
                "rounded-full bg-rose-500/85 px-4 py-2 text-[0.78rem] font-semibold text-white hover:bg-rose-500",
                submittingReject && "opacity-60 cursor-not-allowed"
              )}
            >
              {submittingReject ? "Đang từ chối..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ MODAL FINAL DECISION */}
      <Modal
        open={finalOpen}
        title={
          finalDecisionType === "accepted"
            ? "Chấp nhận ứng viên"
            : "Từ chối ứng viên sau phỏng vấn"
        }
        onClose={() => setFinalOpen(false)}
        busy={submittingFinal}
      >
        <div className="space-y-3">
          <div className="text-[0.78rem] text-white/65">
            {finalDecisionType === "accepted"
              ? "Xác nhận chấp nhận ứng viên vào câu lạc bộ. Họ sẽ trở thành thành viên chính thức."
              : "Nhập lý do từ chối sau phỏng vấn để gửi cho ứng viên."}
          </div>

          {finalDecisionType === "declined" && (
            <textarea
              rows={4}
              value={finalRejectionReason}
              onChange={(e) => setFinalRejectionReason(e.target.value)}
              placeholder='VD: "Ứng viên chưa đạt yêu cầu về kỹ năng"'
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={submittingFinal}
              onClick={() => setFinalOpen(false)}
              className={cn(
                "rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]",
                submittingFinal && "opacity-60 cursor-not-allowed"
              )}
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={submittingFinal}
              onClick={onFinalDecision}
              className={cn(
                "rounded-full px-4 py-2 text-[0.78rem] font-semibold text-white",
                finalDecisionType === "accepted"
                  ? "bg-emerald-500/85 hover:bg-emerald-500"
                  : "bg-rose-500/85 hover:bg-rose-500",
                submittingFinal && "opacity-60 cursor-not-allowed"
              )}
            >
              {submittingFinal
                ? "Đang xử lý..."
                : finalDecisionType === "accepted"
                ? "Xác nhận chấp nhận"
                : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
