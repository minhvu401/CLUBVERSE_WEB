/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";

import { getPostById, type PostItem } from "@/app/services/api/post";

import { ChevronLeft, Heart, CalendarClock, Image as ImageIcon } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TagPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.72rem] font-semibold text-white/80">
      #{text}
    </span>
  );
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };

  const { user, token, loading } = useAuth() as any;

  const id = useMemo(() => String(params?.id || ""), [params?.id]);

  const [post, setPost] = useState<PostItem | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState<string>("");

  const clubName = user?.fullName || user?.name || "CLB";

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!id) return;

    (async () => {
      try {
        setError("");
        setLoadingPost(true);

        const data = await getPostById(token, id);
        setPost(data || null);
      } catch (e: any) {
        console.error("getPostById failed:", e);
        setPost(null);
        setError(e?.message || "Không tải được bài viết.");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [loading, token, id, router]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG giống forum */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />


      <main className="mx-auto max-w-4xl px-4 pb-14 pt-10">
        {/* Top bar */}
        <div className={cn("rounded-3xl p-4 md:p-5", glass)}>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.10]"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>

            <div className="text-xs text-white/55">
              {post?.updatedAt ? `Cập nhật: ${fmtDate(post.updatedAt)}` : ""}
            </div>
          </div>

          {error ? <div className="mt-3 text-sm text-rose-200/90">{error}</div> : null}
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {loadingPost ? (
            <div className={cn("rounded-3xl p-6", glass)}>
              <div className="text-sm text-white/70">Đang tải bài viết…</div>
            </div>
          ) : null}

          {!loadingPost && post ? (
            <article className={cn("relative overflow-hidden rounded-3xl p-6", glass)}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_10%,rgba(59,130,246,0.10),transparent_60%)]" />

              <div className="relative">
                <div className="flex flex-col gap-3">
                  <h1 className="text-xl font-semibold text-white">
                    {post.title || "(Không có tiêu đề)"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
                      <CalendarClock className="h-4 w-4" />
                      {fmtDate(post.createdAt)}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
                      <Heart className="h-4 w-4" />
                      {post.likeCount ?? post.likes?.length ?? 0} like
                    </span>

                    <span className="text-white/60">•</span>
                    <span className="font-semibold text-white/85">{clubName}</span>
                  </div>

                  {Array.isArray(post.tags) && post.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.tags.map((t) => (
                        <TagPill key={t} text={t} />
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Images */}
                {Array.isArray(post.images) && post.images.length > 0 ? (
                  <div className="mt-6">
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                      <ImageIcon className="h-4 w-4" />
                      Ảnh ({post.images.length})
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {post.images.map((src, idx) => (
                        <div
                          key={`${src}-${idx}`}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                        >
                          <img
                            src={src}
                            alt={`image-${idx}`}
                            className="h-64 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Content */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-sm font-semibold text-white/85">Nội dung</div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                    {post.content || "Chưa có nội dung."}
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {!loadingPost && !post && !error ? (
            <div className={cn("rounded-3xl p-6", glass)}>
              <div className="text-sm text-white/70">Không tìm thấy bài viết.</div>
            </div>
          ) : null}
        </div>
      </main>

    </div>
  );
}
