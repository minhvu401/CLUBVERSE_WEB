"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  ArrowLeft,
  Clock3,
} from "lucide-react";
import { getPostById, type PostItem } from "@/app/services/api/post";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function getPostText(p: PostItem) {
  return (p.content ?? p.description ?? (p as any).text ?? "").trim();
}

function Pill({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.72rem] text-white/80">
      <span className="text-white/70">{icon}</span>
      <span className="leading-none">{text}</span>
    </div>
  );
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { token, loading } = useAuth();

  const [post, setPost] = useState<PostItem | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !id) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        setError(null);

        const res = await getPostById(token, id);
        if (!cancelled) setPost(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Không tải được bài viết");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, id]);

  const created = useMemo(() => {
    if (!post?.createdAt) return "—";
    return new Date(post.createdAt).toLocaleString("vi-VN");
  }, [post?.createdAt]);

  const images = Array.isArray(post?.images) ? post!.images! : [];
  const text = post ? getPostText(post) : "";

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BG */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {loading ? (
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>
            Đang tải...
          </div>
        </main>
      ) : !token ? (
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 pb-16 pt-28">
          <div className={cn("rounded-3xl px-6 py-4 text-sm text-white/75", glass)}>
            Đang chuyển hướng...
          </div>
        </main>
      ) : (
        <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-20 pt-28">
          {/* TOP BAR */}
          <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-semibold">Chi tiết bài viết</h1>
                <p className="mt-1 text-[0.78rem] text-white/55">
                  Xem nội dung, ảnh và tương tác của bài viết
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.75rem] font-semibold text-white/85 hover:bg-white/[0.10]"
                >
                  <ArrowLeft size={16} />
                  Quay lại
                </button>

                <Link
                  href="/posts"
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.75rem] font-semibold text-white/85 hover:bg-white/[0.10]"
                >
                  Tất cả bài viết
                </Link>
              </div>
            </div>
          </section>

          {/* CONTENT */}
          {fetching ? (
            <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
              Đang tải bài viết...
            </div>
          ) : error ? (
            <div className={cn("rounded-3xl p-6", glass)}>
              <div className="text-sm font-semibold text-rose-100">Không tải được bài viết</div>
              <div className="mt-1 text-sm text-rose-200/90">{error}</div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.75rem] font-semibold text-white/85 hover:bg-white/[0.10]"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => router.refresh?.()}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-[0.75rem] font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : !post ? (
            <div className={cn("rounded-3xl p-6", glass)}>
              <div className="text-sm font-semibold text-white/90">Không có dữ liệu bài viết</div>
              <div className="mt-1 text-sm text-white/60">
                Bài viết có thể đã bị xóa hoặc bạn không có quyền xem.
              </div>
            </div>
          ) : (
            <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill icon={<Clock3 size={14} />} text={created} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Pill icon={<Heart size={14} />} text={post.likesCount ?? 0} />
                  <Pill icon={<MessageCircle size={14} />} text={post.commentsCount ?? 0} />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-white/85">
                  {text || "Bài viết chưa có nội dung."}
                </p>
              </div>

              {images.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt="post"
                      className="h-56 w-full rounded-2xl border border-white/10 object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 inline-flex items-center gap-2 text-[0.75rem] text-white/45">
                  <ImageIcon size={18} />
                  Không có ảnh
                </div>
              )}
            </article>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}
