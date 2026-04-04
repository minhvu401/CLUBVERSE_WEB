/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getPostById,
  likePost,
  unlikePost,
  deletePost,
  type PostItem,
} from "@/app/services/api/post";
import {
  Heart,
  MessageSquare, 
  Eye,
  ArrowLeft,
  Edit,
  Trash2,
  Hash,
  Calendar,
  User,
  Loader2,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { user, token, loading } = useAuth() as any;

  const [post, setPost] = useState<PostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token || !postId) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const data = await getPostById(token, postId);
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [token, postId]);

  // Helper to determine if user liked the post
  const checkIsLiked = (p: PostItem) => {
    if (typeof p.isLiked === 'boolean') return p.isLiked;
    const uid = user?._id || user?.id;
    if (p.likedBy && Array.isArray(p.likedBy)) {
      return p.likedBy.some(l => l.userId === uid);
    }
    if (p.likes && Array.isArray(p.likes)) {
      return p.likes.includes(uid);
    }
    return false;
  };

  const handleLike = async () => {
    if (!token || !post) return;

    const isCurrentlyLiked = checkIsLiked(post);

    try {
      if (isCurrentlyLiked) {
        await unlikePost(token, post._id);
      } else {
        await likePost(token, post._id);
      }

      setPost({
        ...post,
        isLiked: !isCurrentlyLiked,
        likeCount: (post.likeCount || 0) + (isCurrentlyLiked ? -1 : 1),
      });
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi thích bài viết");
    }
  };

  const handleDelete = async () => {
    if (!token || !post) return;

    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này không?"
    );
    if (!confirm) return;

    setIsDeleting(true);
    try {
      await deletePost(token, post._id);
      router.push("/club/forum");
    } catch (err: any) {
      alert(err.message || "Không thể xóa bài viết");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
            <div className="text-white/60">Đang tải bài viết...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <div className="text-red-200 mb-4">
              {error || "Không tìm thấy bài viết"}
            </div>
            <button
              onClick={() => router.push("/club/forum")}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/85 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại diễn đàn
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCurrentlyLiked = checkIsLiked(post);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => router.push("/club/forum")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10] transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại diễn đàn
        </button>

        {/* Post content */}
        <article className={cn("rounded-3xl p-6 md:p-8", glass)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_10%,rgba(59,130,246,0.10),transparent_60%)]" />

          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {post.title}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thành viên CLB
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/club/forum/${post._id}/edit`)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10] transition"
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition disabled:opacity-50"
                  title="Xóa"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold",
                      i % 3 === 0
                        ? "border-violet-400/25 bg-violet-400/12 text-violet-200"
                        : i % 3 === 1
                        ? "border-sky-400/25 bg-sky-400/12 text-sky-200"
                        : "border-fuchsia-400/25 bg-fuchsia-400/12 text-fuchsia-200"
                    )}
                  >
                    <Hash className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-white/85 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Images (if any) */}
            {post.images && post.images.length > 0 && (
              <div
                className={cn(
                  "grid gap-4 mb-8",
                  post.images.length === 1
                    ? "grid-cols-1" // Full width when 1 image
                    : "grid-cols-1 md:grid-cols-2" // 2 columns when multiple images
                )}
              >
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-white/10"
                  >
                    <Image
                      src={img}
                      unoptimized={img.includes("127.0.0.1")}
                      alt={`Image ${idx + 1}`}
                      width={1200}
                      height={800}
                      className={cn(
                        "w-full h-auto object-cover",
                        post.images?.length === 1 ? "max-h-[600px]" : "max-h-[300px]"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition group"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition",
                      isCurrentlyLiked && "fill-red-500 text-red-500"
                    )}
                  />
                  <span className="font-semibold">{Math.max(post.likeCount || 0, post.likes?.length || 0, post.likedBy?.length || 0) || (isCurrentlyLiked ? 1 : 0)}</span>
                  <span className="text-sm">Lượt thích</span>
                </button>

                <div className="inline-flex items-center gap-2 text-white/60">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">0</span>
                  <span className="text-sm">Bình luận</span>
                </div>

                <div className="inline-flex items-center gap-2 text-white/60">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">0</span>
                  <span className="text-sm">Lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments section (placeholder) */}
        <div className={cn("rounded-3xl p-6 md:p-8 mt-6", glass)}>
          <h3 className="text-xl font-bold text-white mb-4">
            Bình luận (Coming soon)
          </h3>
          <p className="text-white/60 text-sm">
            Tính năng bình luận sẽ được cập nhật trong phiên bản tiếp theo.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
