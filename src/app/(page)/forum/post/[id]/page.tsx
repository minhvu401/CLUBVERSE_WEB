/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import { getPostById, likePost, unlikePost } from "@/app/services/api/post";

import {
  ChevronLeft,
  Heart,
  CalendarClock,
  Image as ImageIcon,
  Users,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TagPill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/85">
      #{text}
    </span>
  );
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const { user, token, loading } = useAuth() as any;

  const id = String(params?.id || "");

  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const userId = user?._id || user?.id;

  const hasLiked = useMemo(() => {
    if (!userId || !post?.likedBy) return false;
    return post.likedBy.some((l: any) => l.userId === userId);
  }, [post?.likedBy, userId]);

  const handleLikeToggle = async () => {
    if (!token || !id || !userId || isLiking) return;

    try {
      setIsLiking(true);

      if (hasLiked) {
        await unlikePost(token, id);
        setPost((prev: any) => ({
          ...prev,
          like: Math.max(0, prev.like - 1),
          likedBy: prev.likedBy.filter((l: any) => l.userId !== userId),
        }));
      } else {
        await likePost(token, id);
        setPost((prev: any) => ({
          ...prev,
          like: prev.like + 1,
          likedBy: [...prev.likedBy, { userId }],
        }));
      }
    } catch {
      setError("Không thể thực hiện thao tác.");
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!id) return;

    (async () => {
      try {
        setLoadingPost(true);
        const data = await getPostById(token, id);
        setPost(data);
      } catch {
        setError("Không tải được bài viết.");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [loading, token, id, router]);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* TOP BAR */}
        <div className={cn("mb-6 rounded-2xl p-4", glass)}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {loadingPost && (
          <div className={cn("rounded-2xl p-6 font-semibold", glass)}>
            Đang tải bài viết…
          </div>
        )}

        {!loadingPost && post && (
          <article className={cn("rounded-3xl p-6 space-y-6", glass)}>
            {/* CLUB INFO */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold">
                {post.clubId?.fullName?.charAt(0) || "C"}
              </div>
              <div>
                <div className="text-sm font-semibold text-white/70">
                  Đăng bởi câu lạc bộ
                </div>
                <div className="text-base font-semibold">
                  {post.clubId?.fullName || "Câu lạc bộ"}
                </div>
              </div>
            </div>

            {/* TITLE */}
            <h1 className="text-xl font-semibold leading-snug">
              {post.title}
            </h1>

            {/* META */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-white/75">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                {fmtDate(post.createdAt)}
              </span>

              <button
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={cn(
                  "ml-auto flex items-center gap-2 rounded-full border px-3 py-1 transition",
                  hasLiked
                    ? "border-rose-400/40 bg-rose-400/20 text-rose-200"
                    : "border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
                )}
              >
                <Heart
                  className={cn("h-4 w-4", hasLiked && "fill-current")}
                />
                {post.like}
              </button>
            </div>

            {/* TAGS */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t: string) => (
                  <TagPill key={t} text={t} />
                ))}
              </div>
            )}

            {/* IMAGES */}
            {post.images?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
                  <ImageIcon className="h-4 w-4" />
                  Ảnh ({post.images.length})
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {post.images.map((src: string, i: number) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-60 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
              <div className="mb-2 text-sm font-semibold text-white/85">
                Nội dung
              </div>
              <div className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-white/80">
                {post.content}
              </div>
            </div>
          </article>
        )}

        {error && (
          <div className="mt-4 text-sm font-semibold text-rose-300">
            {error}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
