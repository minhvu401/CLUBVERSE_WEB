/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

// ✅ chỉnh path này theo nơi bạn đặt posts.ts
import { getPosts, type SortBy, type PostItem } from "@/app/services/api/post";

import {
  Search,
  Plus,
  Flame,
  Pin,
  MessageSquare,
  Eye,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  Hash,
  Users,
  ShieldCheck,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type Category = "all" | "announcement" | "qa" | "sharing";

type UIPost = {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string; role?: string; avatar?: string };
  createdAt: string;
  category: Exclude<Category, "all">;
  tags: string[];
  pinned?: boolean;
  hot?: boolean;
  stats: { likes: number; comments: number; views: number };
};

function stripHtml(input = "") {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatRelativeTimeVI(isoOrDate?: string) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return isoOrDate;

  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (day > 0) return `${day} ngày trước`;
  if (hour > 0) return `${hour} giờ trước`;
  if (min > 0) return `${min} phút trước`;
  return "Vừa xong";
}

function pickAuthorName(author: any) {
  if (!author) return "Ẩn danh";
  if (typeof author === "string") return author;
  return author.fullName || author.name || author.email || "Ẩn danh";
}

function pickAuthorAvatar(author: any) {
  if (!author || typeof author === "string") return undefined;
  return author.avatarUrl || author.avatar;
}

function mapCategory(raw?: string): Exclude<Category, "all"> {
  const c = String(raw || "").toLowerCase();
  if (c.includes("announce") || c.includes("thong") || c.includes("notice"))
    return "announcement";
  if (c.includes("qa") || c.includes("hoi") || c.includes("question"))
    return "qa";
  if (c.includes("share") || c.includes("chia") || c.includes("knowledge"))
    return "sharing";
  return "sharing";
}

function normalizeTags(tags: any): string[] {
  if (Array.isArray(tags)) return tags.filter(Boolean).map(String);
  if (typeof tags === "string")
    return tags
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  return [];
}

function CategoryPill({
  value,
  active,
  onClick,
}: {
  value: { key: Category; label: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-[0.78rem] font-semibold transition",
        "border border-white/10",
        active
          ? "bg-white/[0.10] text-white"
          : "bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white/90"
      )}
    >
      {value.label}
    </button>
  );
}

function Tag({
  text,
  tone = "violet",
}: {
  text: string;
  tone?: "violet" | "sky" | "fuchsia" | "emerald" | "amber";
}) {
  const map: Record<string, string> = {
    violet: "bg-violet-400/12 text-violet-200 border-violet-400/25",
    sky: "bg-sky-400/12 text-sky-200 border-sky-400/25",
    fuchsia: "bg-fuchsia-400/12 text-fuchsia-200 border-fuchsia-400/25",
    emerald: "bg-emerald-400/12 text-emerald-200 border-emerald-400/25",
    amber: "bg-amber-400/12 text-amber-200 border-amber-400/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.7rem] font-semibold",
        map[tone]
      )}
    >
      <Hash className="h-3.5 w-3.5 opacity-80" />
      {text}
    </span>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-white/55">
      {icon}
      {value}
    </span>
  );
}

export default function ForumPage() {
  const router = useRouter();
  const params = useParams() as { clubId?: string };
  const { user, token, loading } = useAuth() as any;

  // nếu bạn muốn forum chỉ cho club => bật guard này
  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    // nếu forum chỉ dành cho club:
    // if (!isClubRole) return router.replace("/");
  }, [loading, token, isClubRole, router]);

  const categories = [
    { key: "all" as const, label: "Tất cả" },
    { key: "announcement" as const, label: "Thông báo" },
    { key: "qa" as const, label: "Hỏi đáp" },
    { key: "sharing" as const, label: "Chia sẻ" },
  ];

  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");

  // ====== API state ======
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [limit, setLimit] = useState<number>(6);
  const [page, setPage] = useState<number>(1);

  const [apiPosts, setApiPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorPosts, setErrorPosts] = useState<string>("");

  const clubId = useMemo(() => {
    // ưu tiên lấy từ URL /.../[clubId]
    const fromParams = params?.clubId;
    // fallback từ user (tùy backend bạn lưu field nào)
    const fromUser =
      user?.clubId || user?.club?._id || user?.club?.id || user?.club;
    return fromParams || fromUser || undefined;
  }, [params?.clubId, user?.clubId, user?.club, user]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const run = async () => {
      try {
        setLoadingPosts(true);
        setErrorPosts("");

        const skip = (page - 1) * limit;

        const res = await getPosts(token, {
          clubId,
          sortBy,
          limit,
          skip,
        });

        if (cancelled) return;

        setApiPosts(res.posts || []);
        setTotal(res.total || 0);
      } catch (e: any) {
        if (cancelled) return;
        setErrorPosts(e?.message || "Không thể tải bài viết");
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, clubId, sortBy, limit, page]);

  // reset page khi đổi sort/limit
  useEffect(() => {
    setPage(1);
  }, [sortBy, limit, clubId]);

  const uiPosts: UIPost[] = useMemo(() => {
    return apiPosts.map((p) => {
      const id = (p._id || p.id || Math.random().toString(36)).toString();
      const content =
        p.description || p.content || p.text || "Chưa có nội dung";
      const excerpt = stripHtml(content).slice(0, 180);

      return {
        id,
        title: p.title || "Bài viết",
        excerpt,
        author: {
          name: pickAuthorName(p.author),
          // nếu backend có role thì map vào đây
          role:
            typeof p.author === "object"
              ? (p.author?.role as string) || undefined
              : undefined,
          avatar: pickAuthorAvatar(p.author),
        },
        createdAt: formatRelativeTimeVI(p.createdAt),
        category: mapCategory(p.category),
        tags: normalizeTags(p.tags),
        pinned: Boolean(p.pinned ?? p.isPinned),
        hot: Boolean(p.hot ?? p.isHot),
        stats: {
          likes: Number(p.likesCount || 0),
          comments: Number(p.commentsCount || 0),
          views: Number(p.viewsCount || 0),
        },
      };
    });
  }, [apiPosts]);

  const filtered = useMemo(() => {
    const byCat =
      cat === "all" ? uiPosts : uiPosts.filter((p) => p.category === cat);

    const query = q.trim().toLowerCase();
    if (!query) return byCat;

    return byCat.filter((p) => {
      return (
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.author.name.toLowerCase().includes(query) ||
        p.tags.join(" ").toLowerCase().includes(query)
      );
    });
  }, [cat, q, uiPosts]);

  const tagStats = useMemo(() => {
    const map = new Map<string, number>();
    uiPosts.forEach((p) =>
      p.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [uiPosts]);

  const totalPages = useMemo(() => {
    const t = Math.max(0, total);
    return Math.max(1, Math.ceil(t / limit));
  }, [total, limit]);

  const pageNumbers = useMemo(() => {
    // hiển thị tối đa 5 trang gần trang hiện tại
    const max = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + max - 1);
    const s2 = Math.max(1, end - max + 1);
    const arr: number[] = [];
    for (let i = s2; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  const onlineMembers = [
    {
      name: "Nguyễn Văn A",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Phạm Thị D",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BG giống /club/home */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* Title */}
        <div className="mb-6">
          <div className="text-sm text-white/60">Forum</div>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Diễn đàn</h1>
              <p className="mt-1 text-sm text-white/60">
                Nơi trao đổi thông báo, hỏi đáp và chia sẻ kiến thức trong cộng
                đồng.
              </p>
              {clubId ? (
                <div className="mt-1 text-xs text-white/45">
                  clubId: {String(clubId)}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => router.push("/club/forum/create")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              Tạo bài viết
            </button>
          </div>
        </div>

        {/* Top controls */}
        <div className={cn("rounded-3xl p-4 md:p-5", glass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryPill
                  key={c.key}
                  value={c}
                  active={cat === c.key}
                  onClick={() => setCat(c.key)}
                />
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm bài viết, tag, tác giả..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[280px]"
                />
              </div>

              {/* sort */}
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10]">
                <Filter className="h-4 w-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-transparent outline-none text-sm text-white/85"
                >
                  <option className="text-black" value="newest">
                    Mới nhất
                  </option>
                  <option className="text-black" value="oldest">
                    Cũ nhất
                  </option>
                  <option className="text-black" value="popular">
                    Phổ biến
                  </option>
                </select>

                <span className="mx-2 h-4 w-px bg-white/10" />

                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-transparent outline-none text-sm text-white/85"
                  title="Số bài mỗi trang"
                >
                  {[6, 10, 15, 20].map((n) => (
                    <option className="text-black" key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Posts list */}
          <section className="lg:col-span-2 space-y-3">
            {loadingPosts ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-white/70">
                  Đang tải bài viết...
                </div>
              </div>
            ) : errorPosts ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm font-semibold text-amber-200">
                  Không tải được bài viết
                </div>
                <div className="mt-1 text-sm text-white/65">{errorPosts}</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-white/70">
                  Không có bài viết nào phù hợp.
                </div>
              </div>
            ) : (
              filtered.map((p) => (
                <article
                  key={p.id}
                  className={cn(
                    "relative overflow-hidden rounded-3xl p-5",
                    glass
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_10%,rgba(59,130,246,0.10),transparent_60%)]" />

                  <div className="relative">
                    {/* header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {p.pinned ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1 text-[0.7rem] font-semibold text-violet-200">
                              <Pin className="h-3.5 w-3.5" />
                              Pinned
                            </span>
                          ) : null}

                          {p.hot ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/12 px-3 py-1 text-[0.7rem] font-semibold text-amber-200">
                              <Flame className="h-3.5 w-3.5" />
                              Hot
                            </span>
                          ) : null}

                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-semibold text-white/75">
                            <Sparkles className="h-3.5 w-3.5 text-white/70" />
                            {p.category === "announcement"
                              ? "Thông báo"
                              : p.category === "qa"
                              ? "Hỏi đáp"
                              : "Chia sẻ"}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate text-base font-semibold text-white">
                          {p.title}
                        </h3>

                        <p className="mt-2 text-sm text-white/65 leading-relaxed line-clamp-2">
                          {p.excerpt}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.tags.slice(0, 3).map((t, i) => (
                            <Tag
                              key={`${p.id}-${t}-${i}`}
                              text={t}
                              tone={
                                i === 0
                                  ? "violet"
                                  : i === 1
                                  ? "sky"
                                  : "fuchsia"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                        title="Khác"
                      >
                        <span className="text-lg leading-none">⋯</span>
                      </button>
                    </div>

                    {/* footer row */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                          <img
                            src={p.author.avatar || "/default-avatar.png"}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-white">
                              {p.author.name}
                            </span>
                            {p.author.role ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-200">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                {p.author.role}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0.5 text-[0.72rem] text-white/55">
                            {p.createdAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Stat
                          icon={<Heart className="h-4 w-4" />}
                          value={p.stats.likes}
                        />
                        <Stat
                          icon={<MessageSquare className="h-4 w-4" />}
                          value={p.stats.comments}
                        />
                        <Stat
                          icon={<Eye className="h-4 w-4" />}
                          value={p.stats.views}
                        />

                        <button
                          type="button"
                          onClick={() => alert(`Demo: mở bài viết ${p.id}`)}
                          className="rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 px-4 py-2 text-[0.72rem] font-semibold text-white/85 transition"
                        >
                          Xem bài →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}

            {/* Pagination */}
            <div className={cn("rounded-3xl p-4", glass)}>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/55">
                  Trang {page} / {totalPages} • Tổng: {total}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]",
                      page <= 1 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-9 w-9 rounded-xl border text-xs font-semibold transition",
                        p === page
                          ? "border-white/15 bg-white/[0.10] text-white"
                          : "border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/[0.10]"
                      )}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]",
                      page >= totalPages && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Quick actions */}
            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Plus className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Tạo nhanh</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Đăng bài, thông báo, hỏi đáp
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Demo: tạo bài viết")}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
              >
                Tạo bài viết
              </button>

              <button
                type="button"
                onClick={() => alert("Demo: tạo thông báo")}
                className="mt-2 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/85 hover:bg-white/[0.10] transition"
              >
                Tạo thông báo
              </button>
            </div>

            {/* Top tags */}
            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Hash className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Top Tags</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Những chủ đề nổi bật
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tagStats.length === 0 ? (
                  <div className="text-sm text-white/55">Chưa có tag.</div>
                ) : (
                  tagStats.map(([t, count], i) => (
                    <span
                      key={t}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
                        i % 3 === 0
                          ? "border-violet-400/25 bg-violet-400/12 text-violet-200"
                          : i % 3 === 1
                          ? "border-sky-400/25 bg-sky-400/12 text-sky-200"
                          : "border-fuchsia-400/25 bg-fuchsia-400/12 text-fuchsia-200"
                      )}
                    >
                      #{t}
                      <span className="text-white/55 font-semibold">
                        ({count})
                      </span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Rules */}
            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <ShieldCheck className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Quy tắc diễn đàn</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Giữ môi trường thảo luận tích cực
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-white/65 leading-relaxed">
                <li>• Tôn trọng mọi người, không công kích cá nhân.</li>
                <li>• Không spam, không đăng nội dung không liên quan.</li>
                <li>• Khi hỏi đáp: cung cấp log/ảnh lỗi rõ ràng.</li>
              </ul>
            </div>

            {/* Online members */}
            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Users className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Online</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Thành viên đang hoạt động
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {onlineMembers.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        <img
                          src={m.avatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="truncate text-sm font-semibold text-white">
                        {m.name}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[0.72rem] font-semibold text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Online
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
