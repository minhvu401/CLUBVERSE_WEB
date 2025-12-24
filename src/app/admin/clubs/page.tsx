/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import { AUTH_BASE_URL } from "@/app/services/api/auth";

import {
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Users,
  TrendingUp,
  Activity,
  MoreHorizontal,
  Eye,
  Ban,
  UserCheck,
  Building2,
  Calendar,
  Mail,
  Phone,
  Hash,
  X,
  AlertCircle,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type ClubStatus = "active" | "inactive" | "pending";

type Club = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  category?: string;
  school?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  rating?: number;
  description?: string;
};

type FilterType = "all" | "active" | "inactive" | "verified" | "unverified";

function StatCard({
  title,
  value,
  icon,
  tone = "blue",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "red" | "yellow";
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-sky-400/15 text-sky-200 border-sky-400/25",
    green: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    red: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    yellow: "bg-amber-400/15 text-amber-200 border-amber-400/25",
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

function StatusBadge({ verified, active }: { verified: boolean; active: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/15 px-3 py-1 text-[0.72rem] font-semibold text-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
        Bị khóa
      </span>
    );
  }

  if (!verified) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/15 px-3 py-1 text-[0.72rem] font-semibold text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        Chưa xác thực
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/15 px-3 py-1 text-[0.72rem] font-semibold text-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      Hoạt động
    </span>
  );
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

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

/** ✅ GET /users?role=club */
async function getAllClubs(accessToken: string) {
  const res = await fetch(`${AUTH_BASE_URL}/users?role=club`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không lấy được danh sách CLB (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
}

/** ✅ PATCH /users/{id}/toggle-active */
async function toggleClubActive(accessToken: string, clubId: string) {
  const res = await fetch(`${AUTH_BASE_URL}/users/${clubId}/toggle-active`, {
    method: "PATCH",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không thể thay đổi trạng thái (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export default function AdminClubsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  // Check admin role
  const isAdmin = useMemo(() => String(user?.role || "").toLowerCase() === "admin", [user?.role]);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (!isAdmin) return router.replace("/");
  }, [loading, token, isAdmin, router]);

  const [filter, setFilter] = useState<FilterType>("all");
  const [q, setQ] = useState("");

  const [clubs, setClubs] = useState<Club[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Fetch clubs
  useEffect(() => {
    if (loading) return;
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setFetchErr(null);

        const list = await getAllClubs(token);

        if (!cancelled) setClubs(list as Club[]);
      } catch (e: any) {
        if (!cancelled) {
          setFetchErr(e?.message || "Lỗi tải danh sách CLB");
          setClubs([]);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, loading]);

  const stats = useMemo(() => {
    const total = clubs.length;
    const active = clubs.filter((c) => c.isActive).length;
    const verified = clubs.filter((c) => c.isVerified).length;
    const inactive = clubs.filter((c) => !c.isActive).length;

    return { total, active, verified, inactive };
  }, [clubs]);

  const filtered = useMemo(() => {
    let result = clubs;

    // Filter by status
    if (filter === "active") {
      result = result.filter((c) => c.isActive);
    } else if (filter === "inactive") {
      result = result.filter((c) => !c.isActive);
    } else if (filter === "verified") {
      result = result.filter((c) => c.isVerified);
    } else if (filter === "unverified") {
      result = result.filter((c) => !c.isVerified);
    }

    // Search
    const query = q.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (c) =>
          String(c.fullName || "").toLowerCase().includes(query) ||
          String(c.email || "").toLowerCase().includes(query) ||
          String(c.category || "").toLowerCase().includes(query) ||
          String(c.school || "").toLowerCase().includes(query) ||
          String(c._id || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [clubs, filter, q]);

  const handleToggleActive = async (club: Club) => {
    if (!token) return;

    try {
      const res = await toggleClubActive(token, club._id);

      setClubs((prev) =>
        prev.map((c) => (c._id === club._id ? { ...c, isActive: !c.isActive } : c))
      );

      setToast({
        type: "ok",
        text: res?.message || `${club.isActive ? "Khóa" : "Mở khóa"} CLB thành công`,
      });

      if (selectedClub?._id === club._id) {
        setSelectedClub((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      }
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Thao tác thất bại" });
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
        <main className="mx-auto max-w-7xl px-4 pt-10">
          <Card className="p-6 text-sm text-white/70">Đang tải...</Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

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

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-10">
        {/* Title */}
        <div className="mb-5">
          <div className="text-sm text-white/60">Admin Dashboard</div>
          <h1 className="mt-1 text-xl font-semibold text-white">Quản Lý Câu Lạc Bộ</h1>
          <p className="mt-1 text-sm text-white/60">
            Xem và quản lý tất cả các câu lạc bộ trong hệ thống
          </p>
          {fetchErr ? <div className="mt-2 text-sm text-rose-200/90">{fetchErr}</div> : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Tổng số CLB" value={stats.total} tone="blue" icon={<Building2 className="h-5 w-5" />} />
          <StatCard title="Hoạt động" value={stats.active} tone="green" icon={<Activity className="h-5 w-5" />} />
          <StatCard title="Đã xác thực" value={stats.verified} tone="green" icon={<CheckCircle className="h-5 w-5" />} />
          <StatCard title="Bị khóa" value={stats.inactive} tone="red" icon={<Ban className="h-5 w-5" />} />
        </div>

        {/* List */}
        <section className={cn("mt-6 rounded-3xl", glass)}>
          {/* Top bar */}
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Danh sách câu lạc bộ</div>
              <div className="mt-1 text-xs text-white/55">
                {fetching ? "Đang tải..." : `${filtered.length} CLB`}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên, email, danh mục..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[260px]"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="appearance-none rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 pr-10 text-sm text-white/85 outline-none hover:bg-white/[0.10]"
                >
                  <option value="all" className="bg-[#0b1038]">Tất cả</option>
                  <option value="active" className="bg-[#0b1038]">Hoạt động</option>
                  <option value="inactive" className="bg-[#0b1038]">Bị khóa</option>
                  <option value="verified" className="bg-[#0b1038]">Đã xác thực</option>
                  <option value="unverified" className="bg-[#0b1038]">Chưa xác thực</option>
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 p-5">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/70">
                {fetching ? "Đang tải..." : "Không có CLB nào."}
              </div>
            ) : null}

            {filtered.map((club) => (
              <div
                key={club._id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-white">
                        {club.fullName || "Không rõ tên"}
                      </div>
                      <StatusBadge verified={club.isVerified} active={club.isActive} />
                    </div>

                    <div className="mt-1 text-xs text-white/55">
                      {club.category ? `${club.category}` : "—"}
                      {club.school ? ` • ${club.school}` : ""}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
                        <Mail className="h-4 w-4 text-white/60" />
                        {club.email}
                      </span>

                      {club.phoneNumber ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
                          <Phone className="h-4 w-4 text-white/60" />
                          {club.phoneNumber}
                        </span>
                      ) : null}

                      {club.createdAt ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
                          <Calendar className="h-4 w-4 text-white/60" />
                          {fmtDate(club.createdAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex shrink-0 items-center justify-end gap-2 md:justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClub(club);
                        setDetailOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.72rem] font-semibold text-white/85 hover:bg-white/[0.10]"
                    >
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(club)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] font-semibold",
                        club.isActive
                          ? "border border-rose-400/25 bg-rose-400/15 text-rose-200 hover:bg-rose-400/20"
                          : "border border-emerald-400/25 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20"
                      )}
                    >
                      {club.isActive ? (
                        <>
                          <Ban className="h-4 w-4" />
                          Khóa
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Mở khóa
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        title="Chi tiết câu lạc bộ"
        onClose={() => {
          setDetailOpen(false);
          setSelectedClub(null);
        }}
      >
        {!selectedClub ? (
          <div className="text-sm text-white/70">—</div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-white/90">
                  {selectedClub.fullName}
                </div>
                <div className="mt-1">
                  <StatusBadge verified={selectedClub.isVerified} active={selectedClub.isActive} />
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Email</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Mail className="h-4 w-4 text-white/60" />
                  <span className="truncate">{selectedClub.email}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Số điện thoại</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span>{selectedClub.phoneNumber || "—"}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Danh mục</div>
                <div className="mt-2 text-sm text-white/85">{selectedClub.category || "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Trường</div>
                <div className="mt-2 text-sm text-white/85">{selectedClub.school || "—"}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">ID</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Hash className="h-4 w-4 text-white/60" />
                  <span className="truncate font-mono text-xs">{selectedClub._id}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Ngày tạo</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <span>{fmtDate(selectedClub.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedClub.description ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/60">Mô tả</div>
                <div className="mt-2 whitespace-pre-line text-sm text-white/75">
                  {selectedClub.description}
                </div>
              </div>
            ) : null}

            {/* Status Info */}
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                <AlertCircle className="h-4 w-4" />
                Trạng thái
              </div>
              <div className="mt-2 space-y-1 text-sm text-white/75">
                <div>
                  <span className="text-white/60">Xác thực:</span>{" "}
                  <span className="font-semibold">{selectedClub.isVerified ? "Đã xác thực" : "Chưa xác thực"}</span>
                </div>
                <div>
                  <span className="text-white/60">Hoạt động:</span>{" "}
                  <span className="font-semibold">{selectedClub.isActive ? "Đang hoạt động" : "Bị khóa"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleToggleActive(selectedClub)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                  selectedClub.isActive
                    ? "bg-rose-500/85 text-white hover:bg-rose-500"
                    : "bg-emerald-500/85 text-white hover:bg-emerald-500"
                )}
              >
                {selectedClub.isActive ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Khóa CLB
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Mở khóa CLB
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailOpen(false)}
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

