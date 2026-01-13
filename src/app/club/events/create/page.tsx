/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import { createEvent, type EventCoreFields } from "@/app/services/api/events";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  ImagePlus,
  Loader2,
  Save,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function CreateEventPage() {
  const router = useRouter();
  const { token } = useAuth() as any;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !location.trim() || !time) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (!token) {
      setError("Vui lòng đăng nhập");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData: EventCoreFields = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        time: new Date(time).toISOString(),
        maxParticipants: maxParticipants
          ? parseInt(maxParticipants)
          : undefined,
      };

      await createEvent(token, eventData);
      router.push("/club/events");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo sự kiện");
      setIsSubmitting(false);
    }
  };

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
          onClick={() => router.push("/club/events")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {/* Form */}
        <div className={cn("rounded-3xl p-6 md:p-8", glass)}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Tạo sự kiện mới</h1>
            <p className="text-sm text-white/60 mt-1">
              Tạo sự kiện mới cho câu lạc bộ của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tên sự kiện <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Workshop: Lập trình Web cơ bản"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                maxLength={200}
              />
              <div className="mt-1 text-xs text-white/40 text-right">
                {title.length}/200
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Mô tả sự kiện <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa điểm <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Phòng A101, Tòa nhà B, FPTU Campus"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Time and Max Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thời gian <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Số người tham gia tối đa
                  </span>
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="VD: 50"
                  min="1"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {/* Images placeholder */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <span className="inline-flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Hình ảnh (Coming soon)
                </span>
              </label>
              <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                <ImagePlus className="h-10 w-10 text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/40">
                  Tính năng upload ảnh sẽ được cập nhật sớm
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/club/events")}
                disabled={isSubmitting}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  !description.trim() ||
                  !location.trim() ||
                  !time
                }
                className="flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Tạo sự kiện
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
