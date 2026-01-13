/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  getPostById,
  updatePost,
  type PostCoreFields,
} from "@/app/services/api/post";
import { X, Hash, Loader2, ArrowLeft, Save } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { token, loading } = useAuth() as any;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        const post = await getPostById(token, postId);
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags || []);
      } catch (err: any) {
        setError(err.message || "Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [token, postId]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    setIsSubmitting(true);
    try {
      const postData: PostCoreFields = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      };

      await updatePost(token, postId, postData);
      router.push(`/club/forum/${postId}`);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật bài viết");
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-20">
          <div className={cn("rounded-3xl p-8 text-center", glass)}>
            <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
            <div className="text-white/60">Đang tải...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 pb-20">
        {/* Back button */}
        <button
          onClick={() => router.push(`/club/forum/${postId}`)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10] transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {/* Form */}
        <div className={cn("rounded-3xl p-6 md:p-8", glass)}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              Chỉnh sửa bài viết
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Cập nhật nội dung bài viết của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                maxLength={200}
              />
              <div className="mt-1 text-xs text-white/40 text-right">
                {title.length}/200
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Nội dung <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Viết nội dung bài viết của bạn..."
                rows={12}
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
              />
              <div className="mt-1 text-xs text-white/40 text-right">
                {content.length} ký tự
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Nhập tag và nhấn Enter..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10] transition text-sm font-semibold"
                >
                  Thêm
                </button>
              </div>

              {/* Tags list */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1 text-sm text-violet-200"
                    >
                      <Hash className="h-3.5 w-3.5" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/club/forum/${postId}`)}
                disabled={isSubmitting}
                className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/[0.10] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
