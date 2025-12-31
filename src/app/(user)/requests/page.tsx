/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/app/providers/AuthProviders/page";
import { AUTH_BASE_URL } from "@/app/services/api/auth";

import {
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  Users2,
  XCircle,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  FileText,
  Info,
  X,
  BadgeCheck,
  BadgeX,

  // ✅ sidebar icons
  Home,
  Users,
  User,
  MessageSquare,
  Inbox,
  Settings,
  LogOut,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

type ApiStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACCEPTED" | "DECLINED" | string;

type ClubInfo = {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  category?: string;
  description?: string;
};

type MyApplication = {
  _id: string;
  clubId: ClubInfo | string; // backend có thể populate hoặc chỉ id
  reason?: string;
  status: ApiStatus;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // approve có thể trả thêm
  interviewDate?: string;
  interviewLocation?: string;
  interviewNote?: string;

  // reject có thể trả thêm
  rejectionReason?: string;
};

type FilterStatus = "all" | "PENDING" | "APPROVED" | "REJECTED" | "ACCEPTED" | "DECLINED";

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

function getStatusCfg(status: ApiStatus) {
  const s = String(status || "").toUpperCase();

  const map: Record<string, { text: string; cls: string; dot: string; icon: React.ReactNode }> = {
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
      text: "Bạn đã chấp nhận",
      cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
      dot: "bg-emerald-300",
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    DECLINED: {
      text: "Bạn đã từ chối",
      cls: "bg-white/10 text-white/70 border-white/15",
      dot: "bg-white/50",
      icon: <BadgeX className="h-4 w-4" />,
    },
    REJECTED: {
      text: "CLB từ chối",
      cls: "bg-rose-400/15 text-rose-200 border-rose-400/25",
      dot: "bg-rose-300",
      icon: <XCircle className="h-4 w-4" />,
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
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone = "yellow",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "yellow" | "green" | "red" | "blue" | "gray";
}) {
  const toneMap: Record<string, string> = {
    yellow: "bg-yellow-400/15 text-yellow-200 border-yellow-400/25",
    green: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    red: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    blue: "bg-sky-400/15 text-sky-200 border-sky-400/25",
    gray: "bg-white/10 text-white/70 border-white/15",
  };

  return (
    <div className={cn("rounded-2xl px-5 py-4", glass)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-white/60">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>

        <div className={cn("h-9 w-9 rounded-xl grid place-items-center border", toneMap[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl", glass, className)}>{children}</div>;
}

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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white/90">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/[0.10]"
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

/** ✅ GET /applications/my-applications?status=... */
async function getMyApplications(params: { accessToken: string; status?: Exclude<FilterStatus, "all"> }) {
  const { accessToken, status } = params;

  const url =
    `${AUTH_BASE_URL}/applications/my-applications` +
    (status ? `?status=${encodeURIComponent(status)}` : "");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không lấy được danh sách đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  // backend có thể trả [] hoặc { applications: [] } hoặc { data: [] }
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.applications)
    ? data.applications
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return list as MyApplication[];
}

function getClub(obj: any): ClubInfo {
  if (!obj) return { _id: "", fullName: "—" };
  if (typeof obj === "string") return { _id: obj, fullName: "—" };
  return obj as ClubInfo;
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, token, loading, logout, updateUser } = useAuth() as any;

  // page này cho user/member
  const isUserRole = useMemo(() => String(user?.role || "").toLowerCase() === "user", [user?.role]);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isUserRole) return router.replace("/");
  }, [loading, token, isUserRole, router]);

  const shownAvatar = String(user?.avatarUrl || "");
  const fullName = String(user?.fullName || user?.name || "User");

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authToken");
      }

      if (typeof updateUser === "function") {
        updateUser({
          fullName: "",
          email: "",
          avatarUrl: "",
          phoneNumber: "",
          school: "",
          major: "",
          year: undefined,
        });
      }

      router.replace("/");
    } catch {
      // ignore
    }
  };

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [q, setQ] = useState("");

  const [apps, setApps] = useState<MyApplication[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // detail modal
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<MyApplication | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setFetchErr(null);

        const list = await getMyApplications({
          accessToken: token,
          status: statusFilter === "all" ? undefined : statusFilter,
        });

        if (!cancelled) setApps(list);
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
  }, [token, statusFilter, loading]);

  const stats = useMemo(() => {
    const count = (s: string) => apps.filter((a) => String(a.status).toUpperCase() === s).length;
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

    return apps.filter((a) => {
      const club = getClub(a.clubId);
      return (
        // ✅ bỏ search theo id
        String(a.reason || "").toLowerCase().includes(query) ||
        String(a.status || "").toLowerCase().includes(query) ||
        String(club.fullName || "").toLowerCase().includes(query) ||
        String(club.category || "").toLowerCase().includes(query)
      );
    });
  }, [apps, q]);

  const navItems = useMemo(
    () => [
      { icon: <Home size={16} />, label: "Trang chủ", href: "/homepage" },
      { icon: <Users size={16} />, label: "Câu lạc bộ", href: "/clubs" },
      { icon: <CalendarDays size={16} />, label: "Sự kiện", href: "/event" },
      { icon: <User size={16} />, label: "Hồ sơ của tôi", href: "/profile" },
      { icon: <MessageSquare size={16} />, label: "Tin nhắn", href: "/messages" },
      { icon: <Inbox size={16} />, label: "Đơn đã gửi", href: "/requests" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
          <aside className={cn("hidden w-72 shrink-0 rounded-3xl p-4 md:block", glass)}>
            <div className="h-12 rounded-2xl border border-white/10 bg-white/[0.04]" />
          </aside>

          <main className="min-w-0 flex-1">
            <Card className="p-6 text-sm text-white/70">Đang tải...</Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG giống profile */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

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

      {/* ✅ Layout giống Profile: aside + main */}
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <aside className={cn("hidden w-72 shrink-0 rounded-3xl p-4 md:block", glass)}>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="relative h-14 w-[250px] overflow-hidden">
                <Image src="/clubverse_logo_1.png" alt="Clubverse" fill priority className="object-contain object-left" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
              {shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shownAvatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-semibold">
                  {initials(fullName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{fullName || "—"}</p>
              <p className="text-[0.68rem] text-emerald-300/80">● Sinh viên</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5 text-[0.78rem]">
            {navItems.map((it) => {
              const active = pathname === it.href || (it.href !== "/" && pathname?.startsWith(it.href));
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                    active
                      ? "bg-gradient-to-r from-emerald-500/80 to-sky-500/60 text-slate-950 font-semibold"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className={cn("opacity-90", active && "text-slate-950")}>{it.icon}</span>
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4 space-y-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[0.78rem] text-white/70 hover:bg-white/[0.06] hover:text-white transition"
            >
              <Settings size={16} />
              Cài đặt
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[0.78rem] text-white/70 hover:bg-white/[0.06] hover:text-white transition"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl pb-14 pt-2">
            <div className="mb-5">
              <div className="text-sm text-white/60">My applications</div>
              <h1 className="mt-1 text-xl font-semibold text-white">Đơn Đã Gửi</h1>
              <p className="mt-1 text-sm text-white/60">
                Xem lại yêu cầu/ phản hồi từ câu lạc bộ và trạng thái đơn của bạn
              </p>
              {fetchErr ? <div className="mt-2 text-sm text-rose-200/90">{fetchErr}</div> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <StatCard title="Chờ duyệt" value={stats.pending} tone="yellow" icon={<Clock3 className="h-5 w-5" />} />
              <StatCard title="Đã duyệt" value={stats.approved} tone="blue" icon={<CheckCircle2 className="h-5 w-5" />} />
              <StatCard title="CLB từ chối" value={stats.rejected} tone="red" icon={<XCircle className="h-5 w-5" />} />
              <StatCard title="Bạn chấp nhận" value={stats.accepted} tone="green" icon={<BadgeCheck className="h-5 w-5" />} />
              <StatCard title="Bạn từ chối" value={stats.declined} tone="gray" icon={<BadgeX className="h-5 w-5" />} />
              <StatCard title="Tổng" value={stats.total} tone="blue" icon={<Users2 className="h-5 w-5" />} />
            </div>

            <section className={cn("mt-6 rounded-3xl", glass)}>
              <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Danh sách đơn</div>
                  <div className="mt-1 text-xs text-white/55">
                    {fetching ? "Đang tải..." : "Bạn có thể lọc trạng thái và xem chi tiết từng đơn"}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                    <Search className="h-4 w-4 text-white/60" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tìm theo tên CLB, lý do, trạng thái..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[260px]"
                    />
                  </div>

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
                        PENDING
                      </option>
                      <option value="APPROVED" className="bg-[#0b1038]">
                        APPROVED
                      </option>
                      <option value="REJECTED" className="bg-[#0b1038]">
                        REJECTED
                      </option>
                      <option value="ACCEPTED" className="bg-[#0b1038]">
                        ACCEPTED
                      </option>
                      <option value="DECLINED" className="bg-[#0b1038]">
                        DECLINED
                      </option>
                    </select>
                    <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
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
                  const club = getClub(a.clubId);
                  const hasInterview = !!a.interviewDate || !!a.interviewLocation || !!a.interviewNote;

                  return (
                    <div
                      key={a._id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold text-white">{club?.fullName || "Câu lạc bộ"}</div>
                            <StatusBadge status={a.status} />
                          </div>

                          <div className="mt-1 text-xs text-white/55">
                            {club?.category ? `Danh mục: ${club.category}` : "—"}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
                              <CalendarDays className="h-4 w-4 text-white/60" />
                              {fmtDate(a.submittedAt || a.createdAt)}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
                            <span className="text-white/80 font-semibold">Lý do:</span> {a.reason || "—"}
                          </p>

                          {hasInterview ? (
                            <div className="mt-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                                <Info className="h-4 w-4" />
                                Lịch phỏng vấn từ CLB
                              </div>
                              <div className="mt-2 text-sm text-white/75">
                                <div>
                                  <span className="text-white/60">Thời gian:</span>{" "}
                                  <span className="font-semibold text-white/90">{fmtDate(a.interviewDate)}</span>
                                </div>
                                <div className="mt-1">
                                  <span className="text-white/60">Địa điểm:</span>{" "}
                                  <span className="font-semibold text-white/90">{a.interviewLocation || "—"}</span>
                                </div>
                                {a.interviewNote ? (
                                  <div className="mt-1">
                                    <span className="text-white/60">Ghi chú:</span>{" "}
                                    <span className="text-white/85">{a.interviewNote}</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          {String(a.status).toUpperCase() === "REJECTED" && a.rejectionReason ? (
                            <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-rose-100">
                                <XCircle className="h-4 w-4" />
                                Lý do CLB từ chối
                              </div>
                              <div className="mt-2 text-sm text-white/75">{a.rejectionReason}</div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center justify-end gap-2 md:justify-start">
                          <button
                            type="button"
                            onClick={() => {
                              setPicked(a);
                              setOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.72rem] font-semibold text-white/85 hover:bg-white/[0.10]"
                          >
                            <FileText className="h-4 w-4" />
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Modal
        open={open}
        title="Chi tiết đơn"
        onClose={() => {
          setOpen(false);
          setPicked(null);
        }}
      >
        {!picked ? (
          <div className="text-sm text-white/70">—</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm font-semibold text-white/90">Câu lạc bộ</div>

              {(() => {
                const club = getClub(picked.clubId);
                return (
                  <div className="mt-3 space-y-2 text-sm text-white/75">
                    <div className="font-semibold text-white/90">{club.fullName || "—"}</div>

                    <div className="text-xs text-white/55">{club.category ? `Danh mục: ${club.category}` : "—"}</div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/60" />
                      <span className="truncate">{club.email || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white/60" />
                      <span className="truncate">{club.phoneNumber || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/60" />
                      <span className="truncate">—</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm font-semibold text-white/90">Thông tin đơn</div>

              <div className="mt-3 space-y-2 text-sm text-white/75">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={picked.status} />
                </div>

                <div className="pt-1">
                  <div className="text-xs text-white/60">Submitted</div>
                  <div className="font-semibold text-white/90">{fmtDate(picked.submittedAt || picked.createdAt)}</div>
                </div>

                <div className="pt-1">
                  <div className="text-xs text-white/60">Updated</div>
                  <div className="font-semibold text-white/90">{fmtDate(picked.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm font-semibold text-white/90">Lý do</div>
              <div className="mt-2 whitespace-pre-line text-sm text-white/75">{picked.reason || "—"}</div>
            </div>

            {picked.interviewDate || picked.interviewLocation || picked.interviewNote ? (
              <div className="md:col-span-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                  <Info className="h-4 w-4" />
                  Request từ CLB (lịch phỏng vấn)
                </div>
                <div className="mt-2 text-sm text-white/75">
                  <div>
                    <span className="text-white/60">Thời gian:</span>{" "}
                    <span className="font-semibold text-white/90">{fmtDate(picked.interviewDate)}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-white/60">Địa điểm:</span>{" "}
                    <span className="font-semibold text-white/90">{picked.interviewLocation || "—"}</span>
                  </div>
                  {picked.interviewNote ? (
                    <div className="mt-1">
                      <span className="text-white/60">Ghi chú:</span>{" "}
                      <span className="text-white/85">{picked.interviewNote}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {String(picked.status).toUpperCase() === "REJECTED" && picked.rejectionReason ? (
              <div className="md:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-100">
                  <XCircle className="h-4 w-4" />
                  Lý do CLB từ chối
                </div>
                <div className="mt-2 text-sm text-white/75">{picked.rejectionReason}</div>
              </div>
            ) : null}

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/85 hover:bg-white/[0.10]"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
