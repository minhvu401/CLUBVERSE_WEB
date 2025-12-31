"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MessageCircle,
  Heart,
  Image as ImageIcon,
  CalendarDays,
  Plus,
  X,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

import { getPosts, type PostItem, type SortBy } from "@/app/services/api/post";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function CornerGlow({
  tone = "violet",
}: {
  tone?: "violet" | "sky" | "emerald" | "amber" | "fuchsia";
}) {
  const toneMap: Record<string, string> = {
    violet: "from-violet-500/65 to-indigo-500/0",
    sky: "from-sky-400/65 to-indigo-500/0",
    emerald: "from-emerald-400/65 to-teal-500/0",
    amber: "from-amber-400/70 to-orange-500/0",
    fuchsia: "from-fuchsia-500/65 to-violet-500/0",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45",
        "bg-gradient-to-br",
        toneMap[tone] ?? toneMap.violet,
        "blur-[0.3px]"
      )}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: SortBy;
  onChange: (v: SortBy) => void;
  options: { label: string; value: SortBy }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortBy)}
        className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 pr-10 text-[0.75rem] text-white/85 outline-none hover:bg-white/[0.10]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-950">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
      />
    </div>
  );
}

function Pill({
  icon,
  text,
  onClear,
}: {
  icon?: React.ReactNode;
  text: string;
  onClear?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] text-white/80">
      {icon ? <span className="text-white/70">{icon}</span> : null}
      <span className="max-w-[240px] truncate">{text}</span>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/10"
          aria-label="Clear"
        >
          <X size={14} className="text-white/65" />
        </button>
      ) : null}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-4", glass)}>
      <CornerGlow tone="violet" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[0.7rem] text-white/60">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function getPostText(p: PostItem) {
  return (p.content ?? p.description ?? p.text ?? "").trim();
}

function avatarFallback(name?: string) {
  const n = (name || "U").trim();
  return n ? n[0]?.toUpperCase() : "U";
}

function PostCard({
  post,
  likes,
  liked,
  onToggleLike,
  onOpen,
}: {
  post: PostItem;
  likes: number;
  liked: boolean;
  onToggleLike: () => void;
  onOpen: () => void;
}) {
  const text = getPostText(post) || "Bài viết chưa có nội dung.";
  const created = post.createdAt ? new Date(post.createdAt).toLocaleString("vi-VN") : "";

  const comments = post.commentsCount ?? 0;
  const images = Array.isArray(post.images) ? post.images : [];

  const clubName =
    typeof post.club === "object" && post.club?.name ? post.club.name : "Forum";

  const authorName =
    typeof post.author === "object" && post.author?.fullName
      ? post.author.fullName
      : typeof post.author === "string"
      ? post.author
      : "Thành viên";

  const authorAvatar =
    typeof post.author === "object" && (post.author as any)?.avatarUrl
      ? (post.author as any).avatarUrl
      : "";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/[0.05] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      )}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      <CornerGlow tone="violet" />

      {/* header image */}
      <div className="relative">
        {images.length > 0 ? (
          <div className="relative h-44 overflow-hidden border-b border-white/10 bg-black/20">
            <img
              src={images[0]}
              alt="post"
              className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-semibold text-white">
                  {clubName}
                </div>
                <div className="mt-0.5 text-[0.7rem] text-white/75">{created}</div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-[0.72rem] text-white/85">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
                  <Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-200" : ""} />
                  {likes}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
                  <MessageCircle size={14} /> {comments}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-28 border-b border-white/10 bg-black/20">
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-semibold text-white/90">
                  {clubName}
                </div>
                <div className="mt-0.5 text-[0.7rem] text-white/60">{created}</div>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-[0.72rem] text-white/70">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2 py-1">
                  <Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-200" : ""} />
                  {likes}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2 py-1">
                  <MessageCircle size={14} /> {comments}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* body */}
      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt="avatar"
                className="h-8 w-8 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-white/80">
                {avatarFallback(authorName)}
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-[0.78rem] font-semibold text-white/85">
                {authorName}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] text-white/70">
            <Sparkles size={14} className="text-violet-200" />
            {clubName}
          </span>
        </div>

        <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-[0.8rem] leading-relaxed text-white/75">
          {text}
        </p>

        {/* actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ LIKE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.72rem] font-semibold",
                liked
                  ? "border-rose-300/20 bg-rose-500/20 text-rose-100 hover:bg-rose-500/25"
                  : "border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
              )}
              aria-pressed={liked}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-200" : "text-white/75"} />
              Like · {likes}
            </button>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.72rem] text-white/70">
              <MessageCircle size={16} className="text-white/70" />
              Bình luận · {comments}
            </span>

            {images.length > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.72rem] text-white/70">
                <ImageIcon size={16} className="text-white/70" />
                Ảnh · {images.length}
              </span>
            ) : null}
          </div>

          <Link
            href={`/posts/${post._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-500/90 px-4 py-2 text-[0.72rem] font-semibold text-white hover:bg-violet-500"
          >
            Xem chi tiết
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] overflow-hidden">
      <div className="h-32 bg-white/10" />
      <div className="p-4">
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="mt-3 h-3 w-full rounded bg-white/10" />
        <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
        <div className="mt-4 h-9 w-full rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function ForumPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  // UI state
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  // paging
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);

  // data
  const [items, setItems] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ like local state
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [likesById, setLikesById] = useState<Record<string, number>>({});

  // reset khi đổi filter
  useEffect(() => {
    setItems([]);
    setSkip(0);
  }, [sortBy]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setError(null);

        const res = await getPosts(token, {
          sortBy,
          limit,
          skip,
        });

        if (cancelled) return;

        setTotal(res.total ?? 0);

        const nextPosts = res.posts ?? [];
        setItems((prev) => (skip === 0 ? nextPosts : [...prev, ...nextPosts]));

        // ✅ init likesById cho những post mới load (không ghi đè nếu user đã like/unlike)
        setLikesById((prev) => {
          const clone = { ...prev };
          nextPosts.forEach((p) => {
            if (clone[p._id] === undefined) clone[p._id] = p.likesCount ?? 0;
          });
          return clone;
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Không tải được bài viết");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, sortBy, limit, skip]);

  const filteredLocal = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((p) => getPostText(p).toLowerCase().includes(qq));
  }, [items, q]);

  const hasMore = items.length < total;

  const stats = useMemo(() => {
    const engagement = items.reduce((s, p) => {
      const likes = likesById[p._id] ?? (p.likesCount ?? 0);
      const comments = p.commentsCount ?? 0;
      return s + likes + comments;
    }, 0);

    return [
      {
        label: "Tổng bài",
        value: total.toLocaleString("vi-VN"),
        icon: <Sparkles className="h-5 w-5 text-violet-200" />,
      },
      {
        label: "Tương tác",
        value: engagement.toLocaleString("vi-VN"),
        icon: <Heart className="h-5 w-5 text-fuchsia-200" />,
      },
    ];
  }, [items, total, likesById]);

  const activeFilters = useMemo(() => {
    const arr: Array<{ key: string; text: string; icon: React.ReactNode; clear: () => void }> = [];
    if (q.trim()) {
      arr.push({
        key: "q",
        text: `Từ khóa: "${q.trim()}"`,
        icon: <Search size={14} />,
        clear: () => setQ(""),
      });
    }
    arr.push({
      key: "sort",
      text:
        sortBy === "popular"
          ? "Sắp xếp: Phổ biến"
          : sortBy === "oldest"
          ? "Sắp xếp: Cũ nhất"
          : "Sắp xếp: Mới nhất",
      icon: <ChevronDown size={14} />,
      clear: () => setSortBy("newest"),
    });
    return arr;
  }, [q, sortBy]);

  // ✅ toggle like (local optimistic)
  const toggleLike = (postId: string) => {
    setLikedById((prev) => {
      const nextLiked = !prev[postId];
      return { ...prev, [postId]: nextLiked };
    });

    setLikesById((prev) => {
      const cur = prev[postId] ?? 0;
      const isLiked = likedById[postId] ?? false; // current (before update)
      const next = isLiked ? Math.max(0, cur - 1) : cur + 1;
      return { ...prev, [postId]: next };
    });

    // 🔌 Nếu có API like/unlike sau này, hook ở đây:
    // await likePost(token!, postId) / await unlikePost(token!, postId)
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BG giữ nguyên */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {loading ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>Đang tải...</div>
        </main>
      ) : !token ? (
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>
            Đang chuyển hướng...
          </div>
        </main>
      ) : (
        <main className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-20 pt-28">
          {/* HERO */}
          <section className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8", glass)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold md:text-3xl">Forum</h1>
                  <p className="mt-1 text-[0.8rem] text-white/60 md:text-sm">
                    Lướt bài viết, tìm kiếm nhanh và mở chi tiết bằng 1 click.
                  </p>
                </div>

                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400 md:w-auto"
                  onClick={() => alert("Chưa làm create post 😄")}
                >
                  <Plus size={16} />
                  Tạo bài viết
                </button>
              </div>

              {/* FILTER BAR */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-white/70">
                      <SlidersHorizontal size={16} />
                      Bộ lọc:
                    </span>

                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                      <Search size={16} className="text-white/55" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Tìm theo nội dung bài viết..."
                        className="w-80 bg-transparent text-[0.78rem] text-white/85 placeholder:text-white/35 outline-none"
                      />
                      {q.trim() ? (
                        <button
                          type="button"
                          onClick={() => setQ("")}
                          className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"
                          aria-label="Clear search"
                        >
                          <X size={16} className="text-white/60" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-1 md:w-[240px]">
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { label: "Mới nhất", value: "newest" },
                        { label: "Cũ nhất", value: "oldest" },
                        { label: "Phổ biến", value: "popular" },
                      ]}
                    />
                  </div>
                </div>

                {/* active filters */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[0.72rem] text-white/45">Đang áp dụng:</span>
                  {activeFilters.map((f) => (
                    <Pill key={f.key} icon={f.icon} text={f.text} onClear={f.clear} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="grid gap-4 md:grid-cols-2">
            {stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
            ))}
          </section>

          {/* LIST */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Sparkles size={18} className="text-violet-200" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Bài viết</h2>
                  <p className="mt-0.5 text-[0.72rem] text-white/55">
                    Hiển thị {filteredLocal.length.toLocaleString("vi-VN")} /{" "}
                    {total.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <Link
                href="/posts"
                className="text-[0.72rem] font-semibold text-white/55 hover:text-white/80"
              >
                Đi tới /posts →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {fetching && items.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : error ? (
                <div className={cn("rounded-2xl p-4 text-sm text-red-200", glass)}>{error}</div>
              ) : filteredLocal.length === 0 ? (
                <div className={cn("rounded-2xl border border-white/10 bg-white/[0.05] p-6", glass)}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      <UserRound className="h-5 w-5 text-white/70" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/85">Không có bài viết phù hợp</div>
                      <div className="mt-1 text-[0.78rem] text-white/55">
                        Thử đổi từ khóa hoặc đổi sắp xếp.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                filteredLocal.map((p) => {
                  const liked = likedById[p._id] ?? false;
                  const likes = likesById[p._id] ?? (p.likesCount ?? 0);

                  return (
                    <PostCard
                      key={p._id}
                      post={p}
                      liked={liked}
                      likes={likes}
                      onToggleLike={() => toggleLike(p._id)}
                      onOpen={() => router.push(`/posts/${p._id}`)}
                    />
                  );
                })
              )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                disabled={items.length >= total || fetching}
                onClick={() => setSkip((s) => s + limit)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-6 py-2 text-[0.78rem] font-semibold",
                  items.length >= total || fetching
                    ? "cursor-not-allowed border-white/10 bg-white/[0.04] text-white/50"
                    : "border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/[0.10]"
                )}
              >
                {fetching ? "Đang tải..." : items.length < total ? "Xem thêm" : "Hết bài viết"}
              </button>
              <div className="text-[0.72rem] text-white/45">
                {items.length.toLocaleString("vi-VN")} đã tải · {total.toLocaleString("vi-VN")} tổng
              </div>
            </div>
          </section>

          {/* FAB */}
          <button
            className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500 text-white shadow-xl shadow-violet-500/30 hover:bg-violet-400"
            aria-label="Tạo nhanh"
            title="Tạo nhanh"
            onClick={() => alert("Chưa làm create post 😄")}
          >
            <Plus />
          </button>
        </main>
      )}

      <Footer />
    </div>
  );
}
