/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

// ✅ USER API
import { getAllPosts } from "@/app/services/api/post";

import {
  Search,
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

type Post = {
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

/* =========================
   MAP BACKEND → UI
========================= */
function toForumPost(item: any): Post {
  const created =
    item?.createdAt || item?.created_at || item?.createdDate || item?.time;

  const categoryRaw = String(item?.category || "sharing").toLowerCase();
  const category: Exclude<Category, "all"> =
    categoryRaw === "announcement"
      ? "announcement"
      : categoryRaw === "qa"
      ? "qa"
      : "sharing";

  return {
    id: String(item?.id ?? item?._id ?? ""),
    title: item?.title ?? "(No title)",
    excerpt: item?.excerpt ?? item?.content ?? "",
    author: {
      name: item?.author?.name ?? "Ẩn danh",
      role: item?.author?.role,
      avatar: item?.author?.avatar ?? "/default-avatar.png",
    },
    createdAt: created ? new Date(created).toLocaleString("vi-VN") : "",
    category,
    tags: Array.isArray(item?.tags) ? item.tags : [],
    pinned: Boolean(item?.pinned),
    hot: Boolean(item?.hot),
    stats: {
      likes: Number(item?.likes ?? 0),
      comments: Number(item?.comments ?? 0),
      views: Number(item?.views ?? 0),
    },
  };
}

export default function ForumUserPage() {
  const router = useRouter();
  const { token, loading } = useAuth() as any;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
  }, [loading, token, router]);

  const fetchPosts = async () => {
    if (!token) return;
    try {
      setLoadingPosts(true);
      setError(null);

      const res = await getAllPosts(token, {limit });
      setPosts((res || []).map(toForumPost));
    } catch (e: any) {
      setError(e?.message || "Không tải được bài viết");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  const categories = [
    { key: "all" as const, label: "Tất cả" },
    { key: "announcement" as const, label: "Thông báo" },
    { key: "qa" as const, label: "Hỏi đáp" },
    { key: "sharing" as const, label: "Chia sẻ" },
  ];

  const filtered = useMemo(() => {
    const byCat = cat === "all" ? posts : posts.filter((p) => p.category === cat);
    const query = q.trim().toLowerCase();
    if (!query) return byCat;

    return byCat.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.author.name.toLowerCase().includes(query) ||
        p.tags.join(" ").toLowerCase().includes(query)
    );
  }, [cat, q, posts]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* Title */}
        <div className="mb-6">
          <div className="text-sm text-white/60">Forum</div>
          <h1 className="text-xl font-semibold text-white">
            Diễn đàn cộng đồng
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Xem thông báo, hỏi đáp và chia sẻ từ các câu lạc bộ
          </p>
        </div>

        {/* Filter */}
        <div className={cn("rounded-3xl p-4 md:p-5", glass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.78rem] font-semibold transition border border-white/10",
                    cat === c.key
                      ? "bg-white/[0.10] text-white"
                      : "bg-white/[0.05] text-white/70 hover:bg-white/[0.08]"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="bg-transparent text-sm text-white outline-none placeholder:text-white/45 w-[260px]"
              />
              <Filter className="h-4 w-4 text-white/60" />
            </div>
          </div>
        </div>

        {/* Posts */}
        <section className="mt-6 space-y-4">
          {loadingPosts && (
            <div className={cn("rounded-3xl p-5", glass)}>
              Đang tải bài viết...
            </div>
          )}

          {error && (
            <div className={cn("rounded-3xl p-5 text-red-200", glass)}>
              {error}
            </div>
          )}

          {!loadingPosts &&
            !error &&
            filtered.map((p) => (
              <article
                key={p.id}
                className={cn("rounded-3xl p-5", glass)}
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex gap-2 flex-wrap">
                      {p.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1 text-[0.7rem] font-semibold">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                      {p.hot && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/12 px-3 py-1 text-[0.7rem] font-semibold">
                          <Flame className="h-3 w-3" /> Hot
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-semibold">
                        <Sparkles className="h-3 w-3" />
                        {p.category}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold truncate">
                      {p.title}
                    </h3>

                    <p className="mt-2 text-sm text-white/65 line-clamp-2">
                      {p.excerpt}
                    </p>

                    <div className="mt-3 flex gap-4 text-xs text-white/55">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {p.stats.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />{" "}
                        {p.stats.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {p.stats.views}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/forum/${p.id}`)}
                    className="h-fit rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold hover:bg-white/[0.10]"
                  >
                    Xem →
                  </button>
                </div>
              </article>
            ))}
        </section>

        {/* Pagination */}
        <div className={cn("mt-6 rounded-3xl p-4", glass)}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/55">Trang {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.06]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.06]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
