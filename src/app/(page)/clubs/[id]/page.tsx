/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import { AUTH_BASE_URL } from "@/app/services/api/auth";

import {
  Users,
  CalendarDays,
  Star,
  Hash,
  Plus,
  X,
  Info,
  User,
  Code2,
  Lightbulb,
  Trophy,
  Network,
  Mail,
  Phone,
  MapPin,
  Rocket,
  Clock3,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type ApiStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACCEPTED" | "DECLINED" | string;

type ClubDetail = {
  _id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;

  school?: string;
  major?: string;
  year?: number;

  category?: string;
  description?: string;
  socialLink?: string[];
  rating?: number;

  posts?: Array<{ postId: string; title: string; createdAt: string; _id?: string }>;
};

type TabKey = "about" | "events" | "members";

// ✅ minimal type để check membership qua applications
type ClubInfo = { _id: string };
type MyApplication = {
  _id: string;
  clubId: ClubInfo | string;
  status: ApiStatus;
};

function upperStatus(s?: ApiStatus) {
  return String(s || "").toUpperCase();
}

function getAppClubId(a: MyApplication) {
  if (!a?.clubId) return "";
  if (typeof a.clubId === "string") return a.clubId;
  return String((a.clubId as any)?._id || "");
}

/** ✅ GET /applications/my-applications */
async function getMyApplications(accessToken: string) {
  const res = await fetch(`${AUTH_BASE_URL}/applications/my-applications`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Không lấy được applications (HTTP ${res.status})`);
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.applications)
    ? data.applications
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return list as MyApplication[];
}

function Pill({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.72rem] text-white/80">
      <span className="text-white/70">{icon}</span>
      <span className="leading-none">{text}</span>
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl", glass, className)}>{children}</div>;
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.75rem] transition",
        active ? "bg-white/10 text-white" : "text-white/65 hover:text-white hover:bg-white/[0.06]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            className={cn("h-4 w-4", filled ? "text-yellow-300 fill-yellow-300" : "text-white/25")}
          />
        );
      })}
    </div>
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
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
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

function RowStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-white/65">{label}</div>
      <div className="font-semibold text-white/85">{value}</div>
    </div>
  );
}

/** ✅ API: POST /applications { clubId, reason } */
async function applyToClub(accessToken: string, body: { clubId: string; reason: string }) {
  const res = await fetch(`${AUTH_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      (res.status === 400
        ? "Đã đăng ký hoặc đã là thành viên"
        : `Gửi đơn thất bại (HTTP ${res.status})`);
    throw new Error(msg);
  }

  return data;
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clubId = params?.id;

  const { token, loading } = useAuth() as any;

  const [tab, setTab] = useState<TabKey>("about");
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [applyOpen, setApplyOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ✅ membership state (FE validate)
  const [joinState, setJoinState] = useState<{
    checking: boolean;
    isMember: boolean; // ✅ đã trong CLB
    hasApplied: boolean; // ✅ đã có đơn
    status?: ApiStatus;
  }>({ checking: false, isMember: false, hasApplied: false });

  const fallback = useMemo<ClubDetail>(
    () => ({
      _id: clubId || "CLB-001",
      fullName: "CLB Công nghệ & Khởi nghiệp",
      category: "Technology",
      rating: 4.8,
      description:
        "CLB Công nghệ & Khởi nghiệp là một cộng đồng năng động dành cho những bạn trẻ đam mê công nghệ và mong muốn khởi nghiệp.\n\nTại đây, các thành viên sẽ có cơ hội tham gia các workshop, hackathon, networking events và nhiều hoạt động thú vị khác.",
      email: "techclub@university.edu.vn",
      phoneNumber: "+84 123 456 789",
      posts: [
        { postId: "p1", title: "Workshop AI & Machine Learning", createdAt: "" },
        { postId: "p2", title: "Hackathon 2024 - Kết quả", createdAt: "" },
      ],
    }),
    [clubId]
  );

  // ✅ fetch detail theo GET /users/{id}
  useEffect(() => {
    const run = async () => {
      try {
        setPageLoading(true);

        if (!clubId) {
          setClub(fallback);
          return;
        }

        if (!loading && !token) {
          setClub(fallback);
          setToast({ type: "err", text: "Cần đăng nhập để xem chi tiết CLB (API yêu cầu token)" });
          return;
        }

        if (!token) {
          setClub(fallback);
          return;
        }

        const res = await fetch(`${AUTH_BASE_URL}/users/${clubId}`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setClub(fallback);
          setToast({
            type: "err",
            text: data?.message || `Không lấy được detail (HTTP ${res.status})`,
          });
          return;
        }

        const u: ClubDetail = (data?.user ?? data) as ClubDetail;

        setClub({
          ...fallback,
          ...u,
          _id: u?._id || clubId,
          fullName: u?.fullName || fallback.fullName,
          description: u?.description || fallback.description,
          rating: typeof u?.rating === "number" ? u.rating : fallback.rating,
          posts: Array.isArray(u?.posts) ? u.posts : fallback.posts,
        });
      } catch (e: any) {
        setClub(fallback);
        setToast({ type: "err", text: e?.message || "Lỗi load detail CLB" });
      } finally {
        setPageLoading(false);
      }
    };

    run();
  }, [clubId, token, loading, fallback]);

  // ✅ FE check: đã trong CLB chưa (dựa trên applications)
  useEffect(() => {
    if (loading) return;

    if (!token || !clubId) {
      setJoinState({ checking: false, isMember: false, hasApplied: false });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setJoinState((p) => ({ ...p, checking: true }));

        const apps = await getMyApplications(token);
        if (cancelled) return;

        const found = apps.find((a) => getAppClubId(a) === String(clubId));
        if (!found) {
          setJoinState({ checking: false, isMember: false, hasApplied: false });
          return;
        }

        const st = upperStatus(found.status);
        const isMember = st === "ACCEPTED";

        setJoinState({
          checking: false,
          isMember,
          hasApplied: true,
          status: found.status,
        });
      } catch {
        if (!cancelled) setJoinState({ checking: false, isMember: false, hasApplied: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, clubId, loading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const ui = club ?? fallback;

  const stats = useMemo(() => {
    return {
      members: 1247,
      events: 24,
      projects: 18,
      rating: Number(ui?.rating ?? 4.8),
      code: "#FCA28",
    };
  }, [ui]);

  const upcoming = useMemo(
    () => [
      { day: "25", title: "Demo Day", time: "19:00 - 21:00", place: "Online" },
      { day: "28", title: "Workshop Blockchain", time: "14:00 - 16:30", place: "Lầu 4 - Lab Công nghệ" },
    ],
    []
  );

  const activities = useMemo(
    () => [
      {
        title: "Workshop Công nghệ",
        desc: "Học hỏi các công nghệ mới nhất từ các chuyên gia.",
        icon: <Code2 size={18} className="text-white/85" />,
      },
      {
        title: "Pitch Ideas",
        desc: "Chia sẻ và phát triển ý tưởng khởi nghiệp.",
        icon: <Lightbulb size={18} className="text-white/85" />,
      },
      {
        title: "Networking",
        desc: "Kết nối với startup, nhà đầu tư và mentor.",
        icon: <Network size={18} className="text-white/85" />,
      },
      {
        title: "Hackathon",
        desc: "Thi đấu và phát triển sản phẩm công nghệ.",
        icon: <Trophy size={18} className="text-white/85" />,
      },
    ],
    []
  );

  const members = useMemo(
    () => [
      { name: "Nguyễn Văn A", role: "Chủ nhiệm" },
      { name: "Trần Thị B", role: "Phó chủ nhiệm" },
      { name: "Lê Văn C", role: "Truyền thông" },
      { name: "Phạm Thị D", role: "Sự kiện" },
      { name: "Hoàng Văn E", role: "Thành viên" },
    ],
    []
  );

  // ✅ button config (REJECTED => enable "Nộp lại")
  const joinBtn = useMemo(() => {
    if (!token) {
      return {
        disabled: false,
        label: "Đăng nhập để tham gia",
        icon: <Plus size={16} />,
        cls:
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/85 hover:bg-white/[0.10]",
        onClick: () => router.push("/login"),
      };
    }

    if (joinState.checking) {
      return {
        disabled: true,
        label: "Đang kiểm tra...",
        icon: <Clock3 size={16} />,
        cls:
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/70 opacity-80 cursor-not-allowed",
        onClick: () => {},
      };
    }

    if (joinState.isMember) {
      return {
        disabled: true,
        label: "Đã là thành viên",
        icon: <BadgeCheck size={16} />,
        cls:
          "inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-5 py-2.5 text-[0.78rem] font-semibold text-emerald-50 cursor-not-allowed",
        onClick: () => {},
      };
    }

    if (joinState.hasApplied) {
      const st = upperStatus(joinState.status);

      // ✅ NEW: bị từ chối => cho nộp lại
      if (st === "REJECTED") {
        return {
          disabled: false,
          label: "Nộp lại",
          icon: <RotateCcw size={16} />,
          cls:
            "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-[0.78rem] font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400 active:scale-[0.99]",
          onClick: () => setApplyOpen(true),
        };
      }

      const label =
        st === "PENDING"
          ? "Đã gửi đơn (chờ duyệt)"
          : st === "APPROVED"
          ? "Đã duyệt (chờ phản hồi)"
          : "Đã gửi đơn";

      const icon = st === "APPROVED" ? <CheckCircle2 size={16} /> : <Clock3 size={16} />;

      return {
        disabled: true,
        label,
        icon,
        cls:
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/80 opacity-90 cursor-not-allowed",
        onClick: () => {},
      };
    }

    return {
      disabled: false,
      label: "Tham gia ngay",
      icon: <Plus size={16} />,
      cls:
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-[0.78rem] font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400 active:scale-[0.99]",
      onClick: () => setApplyOpen(true),
    };
  }, [token, joinState, router]);

  // ✅ SUBMIT APPLICATION (REJECTED => cho nộp lại)
  const handleApply = async () => {
    if (!clubId) {
      setToast({ type: "err", text: "Thiếu clubId" });
      return;
    }

    const st = upperStatus(joinState.status);

    // ✅ FE block nếu đã là member
    if (joinState.isMember) {
      setToast({ type: "err", text: "Bạn đã là thành viên CLB này." });
      setApplyOpen(false);
      return;
    }

    // ✅ chỉ chặn nếu đã có đơn và KHÔNG phải REJECTED
    if (joinState.hasApplied && st !== "REJECTED") {
      setToast({ type: "err", text: "Bạn đã gửi đơn cho CLB này rồi." });
      setApplyOpen(false);
      return;
    }

    if (!token) {
      setToast({ type: "err", text: "Bạn cần đăng nhập để gửi đơn" });
      router.push("/login");
      return;
    }

    const r = reason.trim();
    if (!r) {
      setToast({ type: "err", text: "Vui lòng nhập lý do tham gia" });
      return;
    }

    try {
      setSubmitting(true);

      const data = await applyToClub(token, { clubId, reason: r });

      setToast({ type: "ok", text: data?.message || "Gửi đơn thành công" });
      setApplyOpen(false);
      setReason("");

      // ✅ sau khi gửi đơn, cập nhật state (coi như PENDING)
      setJoinState({ checking: false, isMember: false, hasApplied: true, status: "PENDING" });
    } catch (e: any) {
      setToast({
        type: "err",
        text: e?.message || "Gửi đơn thất bại (có thể bạn đã đăng ký hoặc đã là thành viên).",
      });

      // ✅ nếu BE báo đã là member/đã đăng ký thì FE khóa lại
      const msg = String(e?.message || "").toLowerCase();
      if (msg.includes("thành viên") || msg.includes("member")) {
        setJoinState((p) => ({ ...p, isMember: true, hasApplied: true, status: p.status ?? "ACCEPTED" }));
      } else if (msg.includes("đã đăng ký") || msg.includes("đã gửi đơn")) {
        setJoinState((p) => ({ ...p, hasApplied: true, status: p.status ?? "PENDING" }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
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

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <section className={cn("relative overflow-hidden rounded-3xl", glass)}>
          <div className="absolute inset-0 opacity-[0.35] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_55%)]" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/80 to-indigo-500/70 shadow-[0_18px_55px_rgba(99,102,241,0.30)]">
                  <Rocket size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-wide md:text-2xl">
                    {pageLoading ? "Đang tải..." : ui.fullName || "—"}
                  </h1>
                  <p className="mt-1 max-w-2xl text-[0.8rem] text-white/65">
                    {ui.category
                      ? `Danh mục: ${ui.category}`
                      : "Nơi kết nối các bạn trẻ đam mê công nghệ và khởi nghiệp"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill icon={<Users size={14} />} text={`1247 thành viên`} />
                    <Pill icon={<CalendarDays size={14} />} text={`24 sự kiện`} />
                    <Pill
                      icon={<Star size={14} />}
                      text={
                        <span className="inline-flex items-center gap-2">
                          <span>{Number(ui?.rating ?? 4.8).toFixed(1)}/5</span>
                          <span className="text-white/50">đánh giá</span>
                        </span>
                      }
                    />
                    <Pill icon={<Hash size={14} />} text={"#FCA28"} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:justify-end">
                <button
                  type="button"
                  disabled={joinBtn.disabled}
                  onClick={joinBtn.onClick}
                  className={joinBtn.cls}
                >
                  {joinBtn.icon}
                  {joinBtn.label}
                </button>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 bg-black/20 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={tab === "about"}
                icon={<Info size={16} />}
                label="Giới thiệu"
                onClick={() => setTab("about")}
              />
              <TabButton
                active={tab === "events"}
                icon={<CalendarDays size={16} />}
                label="Sự kiện"
                onClick={() => setTab("events")}
              />
              <TabButton
                active={tab === "members"}
                icon={<User size={16} />}
                label="Thành viên"
                onClick={() => setTab("members")}
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {tab === "about" ? (
              <>
                <Card className="p-5 md:p-6">
                  <h2 className="text-sm font-semibold text-white/90">
                    Về {ui.fullName || "câu lạc bộ"}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[0.82rem] leading-relaxed text-white/65">
                    {ui.description || fallback.description}
                  </p>

                  <div className="mt-5">
                    <div className="text-[0.8rem] font-semibold text-white/85">Hoạt động chính</div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {activities.map((a) => (
                        <div key={a.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                              {a.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[0.82rem] font-semibold text-white/90">{a.title}</div>
                              <div className="mt-1 text-[0.74rem] text-white/60">{a.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6">
                  <h3 className="text-sm font-semibold text-white/90">Hoạt động gần đây</h3>

                  <div className="mt-4 space-y-3">
                    {(ui.posts?.length ? ui.posts : fallback.posts)?.map((p: any) => (
                      <div
                        key={p._id || p.postId}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/70 to-indigo-500/60">
                          <SparkIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[0.82rem] font-semibold text-white/90">{p.title}</div>
                          <div className="mt-1 text-[0.72rem] text-white/55">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                          </div>
                        </div>

                        <Link
                          href={`/forum`}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.72rem] text-white/75 hover:bg-white/[0.10]"
                        >
                          Xem
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : tab === "events" ? (
              <Card className="p-5 md:p-6">
                <h2 className="text-sm font-semibold text-white/90">Sự kiện của CLB</h2>

                <div className="mt-4 grid gap-3">
                  {upcoming.map((ev) => (
                    <div
                      key={ev.title}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/25">
                          <CalendarDays size={16} className="text-white/80" />
                        </div>
                        <div>
                          <div className="text-[0.82rem] font-semibold text-white/90">{ev.title}</div>
                          <div className="mt-1 text-[0.72rem] text-white/60">
                            {ev.time} • {ev.place}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/75">
                        {ev.day}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-5 md:p-6">
                <h2 className="text-sm font-semibold text-white/90">Danh sách thành viên</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {members.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[0.8rem] font-semibold">
                        {m.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(-2)
                          .map((x) => x[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[0.82rem] font-semibold text-white/90">{m.name}</div>
                        <div className="text-[0.72rem] text-white/60">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <div className="lg:sticky lg:top-24 space-y-5">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white/90">Thống kê CLB</h3>

                <div className="mt-4 space-y-2.5 text-[0.78rem]">
                  <RowStat label="Thành viên" value={1247} />
                  <RowStat label="Sự kiện đã tổ chức" value={24} />
                  <RowStat label="Dự án đã hoàn thành" value={18} />
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-white/65">Đánh giá</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/85 font-semibold">
                        {Number(ui?.rating ?? 4.8).toFixed(1)}
                      </span>
                      <Stars value={Number(ui?.rating ?? 4.8)} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white/90">Sự kiện sắp tới</h3>

                <div className="mt-4 space-y-3">
                  {upcoming.map((ev) => (
                    <div
                      key={ev.title}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/70 to-indigo-500/60">
                        <span className="text-[0.75rem] font-semibold">{ev.day}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.8rem] font-semibold text-white/90">{ev.title}</div>
                        <div className="mt-1 text-[0.72rem] text-white/60">{ev.time}</div>
                        <div className="mt-0.5 text-[0.72rem] text-white/55">{ev.place}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white/90">Thông tin liên hệ</h3>

                <div className="mt-4 space-y-3 text-[0.78rem]">
                  <div className="flex items-center gap-3 text-white/75">
                    <Mail size={16} className="text-white/60" />
                    <span className="truncate">{ui.email || fallback.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/75">
                    <Phone size={16} className="text-white/60" />
                    <span>{ui.phoneNumber || fallback.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/75">
                    <MapPin size={16} className="text-white/60" />
                    <span>Tòa nhà T1, Trường ĐH ABC</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Modal
        open={applyOpen}
        title="Gửi đơn tham gia câu lạc bộ"
        onClose={() => {
          if (!submitting) setApplyOpen(false);
        }}
      >
        {joinState.isMember ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-[0.8rem] text-emerald-50">
              Bạn đã là thành viên của <span className="font-semibold">{ui.fullName}</span>.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setApplyOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {upperStatus(joinState.status) === "REJECTED" ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-[0.78rem] text-rose-100">
                Đơn trước đó đã bị từ chối. Bạn có thể chỉnh lại lý do và <b>nộp lại</b>.
              </div>
            ) : null}

            <div className="text-[0.78rem] text-white/65">
              Hãy viết những lý do bạn muốn tham gia{" "}
              <span className="text-white/85 font-semibold">{ui.fullName}</span>.
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="VD: Em rất yêu thích công nghệ và muốn học hỏi thêm về lập trình web..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-[0.82rem] text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
            />

            {(() => {
              const st = upperStatus(joinState.status);
              const lockApply = joinState.hasApplied && st !== "REJECTED";

              return (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setApplyOpen(false)}
                    className={cn(
                      "rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]",
                      submitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    disabled={submitting || !reason.trim() || lockApply}
                    onClick={handleApply}
                    className={cn(
                      "rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-[0.78rem] font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400",
                      (submitting || !reason.trim() || lockApply) && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {submitting ? "Đang gửi..." : lockApply ? "Đã gửi đơn" : "Gửi đơn"}
                  </button>
                </div>
              );
            })()}

            {!loading && !token ? (
              <div className="text-[0.75rem] text-amber-200/90">* Bạn đang chưa đăng nhập.</div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 6.2L20 10l-6.6 1.8L12 18l-1.4-6.2L4 10l6.6-1.8L12 2z"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
