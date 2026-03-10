/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { X, Hash, Loader2, Sparkles, Upload, Trash2 } from "lucide-react";
import { createPost, type PostCoreFields } from "@/app/services/api/post";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  token: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
  token,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const files = e.target.files;
    if (!files) return;

    const newImages: { url: string; file: File }[] = [];
    let error = false;

    Array.from(files).forEach((file) => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Kích thước file không được vượt quá 5MB");
        error = true;
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setImageError("Chỉ chấp nhận file hình ảnh");
        error = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newImages.push({ url: result, file });
          if (newImages.length === Array.from(files).length && !error) {
            setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const img of images) {
      if (img.file) {
        try {
          const formData = new FormData();
          formData.append("file", img.file);

          const res = await fetch("/api/upload-post-image", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Upload ảnh thất bại");
          }

          const data = await res.json();
          uploadedUrls.push(data.url);
        } catch (err: any) {
          throw new Error(err.message || "Lỗi khi upload ảnh");
        }
      } else {
        // Nếu là URL cũ (từ edit), giữ lại
        uploadedUrls.push(img.url);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    setIsSubmitting(true);
    setUploadingImages(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      const postData: PostCoreFields = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await createPost(token, postData);

      // Reset form
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setImages([]);
      setImageError("");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo bài viết");
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8",
          glass
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">Tạo bài viết</h2>
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-sm text-white/60">
              Chia sẻ kiến thức với cộng đồng
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200/90">
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
              placeholder="Ví dụ: Mẹo học lập trình hiệu quả..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition"
              maxLength={200}
            />
            <div className="mt-1.5 text-xs text-white/40 text-right">
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
              placeholder="Viết nội dung bài viết của bạn tại đây..."
              rows={7}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition resize-none"
            />
            <div className="mt-1.5 text-xs text-white/40 text-right">
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
                placeholder="Thêm tag (nhấn Enter)..."
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white placeholder:text-white/35 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10] transition text-sm font-semibold"
              >
                Thêm
              </button>
            </div>

            {/* Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => {
                  const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
                  return (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1.5 text-xs font-semibold text-violet-200"
                    >
                      <Hash className="h-3 w-3" />
                      {cleanTag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Hình ảnh
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-input"
            />
            <label
              htmlFor="image-input"
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.03] p-6 cursor-pointer hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
            >
              <Upload className="h-8 w-8 text-cyan-400/60 mb-2" />
              <p className="text-sm font-medium text-white">
                Chọn ảnh hoặc kéo thả
              </p>
              <p className="text-xs text-white/40 mt-1">
                Tối đa 5 ảnh, mỗi ảnh tối đa 5MB
              </p>
            </label>

            {imageError && (
              <p className="mt-2 text-xs text-red-200/90">{imageError}</p>
            )}

            {/* Images preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] aspect-square"
                  >
                    <img
                      src={img.url}
                      alt={`preview-${idx}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      disabled={uploadingImages}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-lg bg-red-500/80 hover:bg-red-600 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.10] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages || !title.trim() || !content.trim()}
              className="flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isSubmitting || uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingImages ? "Đang upload ảnh..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Tạo bài viết
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
