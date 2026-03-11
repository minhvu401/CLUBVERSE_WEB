/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import { getAllPosts, likePost, unlikePost } from "@/app/services/api/post";

import {
  Search,
  Flame,
  Pin,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "relative border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.45)]";

/* =========================
   FORUM STYLE RIÊNG (SMALL)
========================= */
const forum = {
  card:
    "rounded-2xl overflow-hidden bg-white/[0.08] backdrop-blur-xl " +
    "border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.55)] " +
    "transition-all hover:-translate-y-[2px] hover:shadow-[0_26px_65px_rgba(0,0,0,0.75)]",

  avatar:
    "h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 " +
    "flex items-center justify-center text-sm font-black ring-1 ring-white/20",

  title:
    "text-lg font-extrabold leading-snug cursor-pointer " +
    "hover:text-fuchsia-300 transition",

  excerpt:
    "mt-2 text-sm text-white/70 leading-relaxed line-clamp-2",

  tag:
    "px-3 py-0.5 rounded-full text-[11px] font-semibold " +
    "bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 " +
    "border border-white/10 text-white/70",

  actionBtn:
    "flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-95",

  likeActive: "text-rose-400",
  likeIdle: "text-white/60 hover:text-rose-300",

  filterActive:
    "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow",
  filterIdle:
    "bg-white/5 text-white/60 hover:bg-white/10",
};
/* ========================= */

type Category = "all" | "announcement" | "qa" | "sharing";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  category: Exclude<Category, "all">;
  tags: string[];
  images?: string[];
  pinned?: boolean;
  hot?: boolean;
  stats: { likes: number };
  isLiked?: boolean;
  club?: {
    name: string;
    category?: string;
  };
};

function toForumPost(item: any): Post {
  return {
    id: item._id,
    title: item.title,
    excerpt: item.content,
    createdAt: new Date(item.createdAt).toLocaleString("vi-VN"),
    category: item.category ?? "sharing",
    tags: item.tags ?? [],
    images: item.images ?? [],
    pinned: Boolean(item.pinned),
    hot: Boolean(item.hot),
    isLiked: Boolean(item.isLiked),
    stats: {
      likes: Number(item.like ?? 0),
    },
    club: {
      name: item.clubId?.fullName ?? "CLB",
      category: item.clubId?.category,
    },
  };
}

export default function ForumUserPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [posts, setPosts] = useState<Post[]>([]);
  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    getAllPosts(token, { limit }).then((res) =>
      setPosts(res.map(toForumPost))
    );
  }, [token, page]);

  const handleLike = async (postId: string, isLiked?: boolean) => {
    if (!token || !user) return;
    if (isLiked) await unlikePost(token, postId);
    else await likePost(token, postId);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !isLiked,
              stats: {
                likes: p.stats.likes + (isLiked ? -1 : 1),
              },
            }
          : p
      )
    );
  };

  const categories = [
    { key: "all", label: "Tất cả" },
    { key: "announcement", label: "Thông báo" },
    { key: "qa", label: "Hỏi đáp" },
    { key: "sharing", label: "Chia sẻ" },
  ] as const;

  const filtered = useMemo(() => {
    const byCat =
      cat === "all" ? posts : posts.filter((p) => p.category === cat);
    const query = q.trim().toLowerCase();
    if (!query) return byCat;
    return byCat.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query)
    );
  }, [cat, q, posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">FORUM CÂU LẠC BỘ</h1>
          <p className="mt-1 text-xs text-white/60">
            Không gian chia sẻ dành riêng cho CLB
          </p>
        </div>

        {/* FILTER */}
        <div className={cn("mb-8 rounded-2xl p-4", glass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition",
                    cat === c.key
                      ? forum.filterActive
                      : forum.filterIdle
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm bài viết..."
                className="pl-9 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs outline-none w-56 placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* POSTS */}
        <section className="space-y-6">
          {filtered.map((p) => (
            <article key={p.id} className={forum.card}>
              <div className="flex items-center gap-3 px-5 pt-4">
                <div className={forum.avatar}>
                  {p.club?.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {p.club?.name}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {p.club?.category} • {p.createdAt}
                  </div>
                </div>

                {(p.pinned || p.hot) && (
                  <div className="flex gap-1">
                    {p.pinned && <Pin className="h-3.5 w-3.5 text-yellow-400" />}
                    {p.hot && <Flame className="h-3.5 w-3.5 text-rose-400" />}
                  </div>
                )}
              </div>

              <div className="px-5 pt-3">
                <h2
                  onClick={() => router.push(`/forum/post/${p.id}`)}
                  className={forum.title}
                >
                  {p.title}
                </h2>
                <p className={forum.excerpt}>{p.excerpt}</p>
              </div>

              {p.images && p.images.length > 0 && (
                <img
                  src={p.images[0]}
                  className="mt-5 w-full max-h-[420px] object-cover"
                  alt=""
                />
              )}

              {p.tags.length > 0 && (
                <div className="px-5 mt-3 flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className={forum.tag}>
                      #{tag.replace("#", "")}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 px-5 pb-4 flex items-center">
                <button
                  onClick={() => handleLike(p.id, p.isLiked)}
                  className={cn(
                    forum.actionBtn,
                    p.isLiked ? forum.likeActive : forum.likeIdle
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      p.isLiked && "fill-current"
                    )}
                  />
                  {p.stats.likes}
                </button>

                <button
                  onClick={() => router.push(`/forum/post/${p.id}`)}
                  className="ml-auto text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  Đọc →
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* PAGINATION */}
        <div className={cn("mt-10 rounded-2xl p-3", glass)}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60">Trang {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 grid place-items-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 grid place-items-center"
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
