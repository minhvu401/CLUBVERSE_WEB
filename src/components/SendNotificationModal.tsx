"use client";

import React, { useState } from "react";
import { X, Send, Users, Bell } from "lucide-react";
import {
  createNotification,
  type NotificationType,
} from "@/app/services/api/notifications";
import { getClubMembers } from "@/app/services/api/clubMembers";

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  /** "club" = gửi đến thành viên CLB, "system" = gửi thông báo hệ thống */
  mode: "club" | "system";
  clubId?: string;
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SendNotificationModal({
  open,
  onClose,
  token,
  mode,
  clubId,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const reset = () => {
    setTitle("");
    setMessage("");
    setTargetUserId("");
    setResult(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setResult({ ok: false, text: "Vui lòng nhập tiêu đề và nội dung" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      if (mode === "club" && clubId) {
        // Lấy danh sách thành viên CLB và gửi thông báo đến từng người
        const res = await getClubMembers(token, clubId);
        const members = res.members || [];

        if (!members.length) {
          setResult({ ok: false, text: "CLB chưa có thành viên nào" });
          return;
        }

        const results = await Promise.allSettled(
          members.map((m) =>
            createNotification(token, {
              userId: m.userId,
              title: title.trim(),
              message: message.trim(),
              type: "SYSTEM" as NotificationType,
              metadata: { clubId },
            }),
          ),
        );

        const succeeded = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        setResult({
          ok: true,
          text: `Đã gửi thông báo đến ${succeeded}/${members.length} thành viên`,
        });
        setTitle("");
        setMessage("");
      } else {
        // System mode – gửi đến userId cụ thể
        if (!targetUserId.trim()) {
          setResult({ ok: false, text: "Vui lòng nhập ID người nhận" });
          setLoading(false);
          return;
        }

        await createNotification(token, {
          userId: targetUserId.trim(),
          title: title.trim(),
          message: message.trim(),
          type: "SYSTEM",
        });

        setResult({ ok: true, text: "Đã gửi thông báo hệ thống thành công" });
        setTitle("");
        setMessage("");
        setTargetUserId("");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gửi thông báo thất bại";
      setResult({ ok: false, text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)] p-6 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl border",
                  mode === "club"
                    ? "bg-indigo-400/15 text-indigo-300 border-indigo-400/25"
                    : "bg-rose-400/15 text-rose-300 border-rose-400/25",
                )}
              >
                {mode === "club" ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {mode === "club"
                    ? "Gửi thông báo đến thành viên CLB"
                    : "Gửi thông báo hệ thống"}
                </div>
                <div className="text-[0.7rem] text-white/50 mt-0.5">
                  {mode === "club"
                    ? "Tất cả thành viên hiện tại sẽ nhận được thông báo"
                    : "Gửi thông báo SYSTEM đến người dùng cụ thể"}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {mode === "system" && (
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  ID người nhận <span className="text-rose-400">*</span>
                </label>
                <input
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/60 transition"
                  placeholder="Nhập userId của người nhận..."
                />
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 mb-1 block">
                Tiêu đề <span className="text-rose-400">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/60 transition"
                placeholder="Tiêu đề thông báo..."
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">
                Nội dung <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/60 transition resize-none"
                placeholder="Nội dung thông báo..."
              />
              <div className="text-right text-[0.65rem] text-white/30 mt-0.5">
                {message.length}/500
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={cn(
                "mt-3 rounded-xl px-3 py-2 text-xs",
                result.ok
                  ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
                  : "bg-rose-500/15 text-rose-200 border border-rose-400/20",
              )}
            >
              {result.text}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !message.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Đang gửi..." : "Gửi thông báo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
