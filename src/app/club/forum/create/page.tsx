/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders/page";

// ✅ chỉnh path import đúng với nơi bạn đặt posts.ts
import { createPost } from "@/app/services/api/post";
import { Plus, X, Hash, Image as ImageIcon, ArrowLeft, Loader2 } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function splitTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function CreatePostPage() {
  const router = useRouter();
  const { token, loading, user } = useAuth() as any;

  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
  }, [loading, token, router]);

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  // Nếu muốn chặn không phải club:
  // useEffect(() => {
  //   if (loading) return;
  //   if (token && !isClubRole) router.replace("/");
  // }, [loading, token, isClubRole, router]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");

  // images dạng URL theo swagger
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const tags = useMemo(() => splitTags(tagsText), [tagsText]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0 && !submitting;
  }, [title, content, submitting]);

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (images.includes(url)) return;
    setImages((prev) => [...prev, url]);
    setImageUrl("");
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((x) => x !== url));
  };

  const onSubmit = async () => {
    try {
      setError("");
      if (!token) return;

      const payload = {
        title: title.trim(),
        tags,
        content: content.trim(),
        images: images.length ? images : undefined,
      };

      setSubmitting(true);
      const created = await createPost(token, payload);

      alert("Tạo bài viết thành công!");
      // ✅ quay về forum (đổi đường dẫn nếu forum bạn nằm chỗ khác)
      router.push("/club/forum");
      // hoặc nếu bạn muốn mở detail:
      // router.push(`/club/forum/${created._id}`);
    } catch (e: any) {
      setError(e?.message || "Tạo bài viết thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* BG giống forum/home */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />


      <main className="mx-auto max-w-3xl px-4 pb-14 pt-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Forum</div>
            <h1 className="mt-1 text-xl font-semibold text-white">Tạo bài viết</h1>
            <p className="mt-1 text-sm text-white/60">
              Đăng bài viết mới cho cộng đồng (Club only).
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        <div className={cn("rounded-3xl p-5 md:p-6", glass)}>
          {error ? (
            <div className="mb-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
              {error}
            </div>
          ) : null}

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-white/85">Tiêu đề *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thông báo tuyển thành viên..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
            />
          </div>

          {/* Tags */}
          <div className="mt-5">
            <label className="text-sm font-semibold text-white/85">
              Tags (cách nhau bằng dấu phẩy)
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
              <Hash className="h-4 w-4 text-white/55" />
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="technology, education, club..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>

            {tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1 text-[0.75rem] font-semibold text-violet-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Content */}
          <div className="mt-5">
            <label className="text-sm font-semibold text-white/85">Nội dung *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung bài ở đây..."
              rows={8}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
            />
          </div>

          {/* Images */}
          <div className="mt-5">
            <label className="text-sm font-semibold text-white/85">
              Ảnh (URL) – theo swagger
            </label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <ImageIcon className="h-4 w-4 text-white/55" />
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 px-5 py-3 text-[0.78rem] font-semibold text-white/85 transition"
              >
                <Plus className="h-4 w-4" />
                Thêm ảnh
              </button>
            </div>

            {images.length ? (
              <div className="mt-3 space-y-2">
                {images.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-white/80">{url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/[0.10]"
                      title="Xóa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-white/50">Chưa thêm ảnh nào.</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/club/forum")}
              className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/85 hover:bg-white/[0.10] transition"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 transition",
                "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95",
                !canSubmit && "opacity-50 cursor-not-allowed hover:brightness-100 active:scale-100"
              )}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Đăng bài
            </button>
          </div>

          {!isClubRole ? (
            <div className="mt-4 text-xs text-white/45">
              (Gợi ý) Nếu API yêu cầu Club only, hãy đảm bảo tài khoản đang đăng nhập là role Club.
            </div>
          ) : null}
        </div>
      </main>


    </div>
  );
}
