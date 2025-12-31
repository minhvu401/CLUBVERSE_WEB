/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders/page";
import {
  getCurrentProfile,
  updateClubProfileInfo,
  uploadUserAvatar,
  deleteUserAvatar,
} from "@/app/services/api/users";
import type { ProfileResponse } from "@/app/services/api/auth";

import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";

import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function ClubProfileEditPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    if (user?.role?.toLowerCase() !== "club") return router.replace("/");
  }, [loading, token, user?.role, router]);

  useEffect(() => {
    if (loading || !token) return;

    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        const data = await getCurrentProfile(token);
        if (!cancelled) {
          setProfile(data);
          setFullName(data.fullName || "");
          setPhoneNumber(data.phoneNumber || "");
          setAvatarUrl(data.avatarUrl || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setSocialLinks(Array.isArray(data.socialLink) ? data.socialLink : []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setToast({
            type: "err",
            text: e?.message || "Không tải được thông tin",
          });
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, token]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "err", text: "File quá lớn. Tối đa 5MB" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setToast({ type: "err", text: "Vui lòng chọn file ảnh" });
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadUserAvatar(token, file);
      if (result?.url) {
        setAvatarUrl(result.url);
        setToast({ type: "ok", text: "Tải ảnh lên thành công" });
      }
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Tải ảnh lên thất bại" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!token) return;
    try {
      setUploadingAvatar(true);
      await deleteUserAvatar(token);
      setAvatarUrl("");
      setToast({ type: "ok", text: "Đã xóa ảnh đại diện" });
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Xóa ảnh thất bại" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, ""]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    setSocialLinks(updated);
  };

  const handleSave = async () => {
    if (!token) return;

    if (!fullName.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập tên câu lạc bộ" });
      return;
    }

    if (!phoneNumber.trim()) {
      setToast({ type: "err", text: "Vui lòng nhập số điện thoại" });
      return;
    }

    if (!category.trim()) {
      setToast({ type: "err", text: "Vui lòng chọn danh mục" });
      return;
    }

    try {
      setSaving(true);

      const filteredLinks = socialLinks.filter(
        (link) => link.trim().length > 0
      );

      await updateClubProfileInfo(token, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatarUrl || undefined,
        category: category.trim(),
        description: description.trim(),
        socialLink: filteredLinks.length > 0 ? filteredLinks : undefined,
      });

      setToast({ type: "ok", text: "Cập nhật thông tin thành công" });

      setTimeout(() => {
        router.push("/club/home");
      }, 1000);
    } catch (e: any) {
      setToast({ type: "err", text: e?.message || "Cập nhật thất bại" });
    } finally {
      setSaving(false);
    }
  };

  const buildAvatarUrl = (url?: string) => {
    if (!url)
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        fullName || "club"
      )}`;
    if (url.startsWith("http")) return url;
    return `https://clubverse.onrender.com${url}`;
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      {toast && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2">
          <div
            className={cn(
              "rounded-2xl border px-4 py-2 text-[0.78rem] backdrop-blur-xl shadow-lg",
              toast.type === "ok"
                ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
                : "border-rose-400/20 bg-rose-500/15 text-rose-50"
            )}
          >
            {toast.text}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 pb-14 pt-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">Club profile</div>
            <h1 className="mt-1 text-xl font-semibold text-white">
              Chỉnh sửa thông tin câu lạc bộ
            </h1>
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

        {fetching ? (
          <div
            className={cn(
              "rounded-3xl p-6 text-center text-sm text-white/70",
              glass
            )}
          >
            Đang tải thông tin...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar */}
            <section className={cn("rounded-3xl p-6", glass)}>
              <h2 className="text-sm font-semibold text-white">Ảnh đại diện</h2>
              <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/15 bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildAvatarUrl(avatarUrl)}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.10]">
                    <Upload className="h-4 w-4" />
                    Tải ảnh lên
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
                    >
                      <X className="h-4 w-4" />
                      Xóa ảnh
                    </button>
                  )}

                  <div className="text-xs text-white/55">
                    Ảnh JPG, PNG. Tối đa 5MB
                  </div>
                </div>
              </div>
            </section>

            {/* Basic Info */}
            <section className={cn("rounded-3xl p-6", glass)}>
              <h2 className="text-sm font-semibold text-white">
                Thông tin cơ bản
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-white/70">
                    Tên câu lạc bộ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Tech Innovators Club"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70">
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="VD: 0938111888"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70">
                    Danh mục <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option value="" className="bg-[#0b1038]">
                      -- Chọn danh mục --
                    </option>
                    <option value="Công nghệ" className="bg-[#0b1038]">
                      Công nghệ
                    </option>
                    <option value="Kinh doanh" className="bg-[#0b1038]">
                      Kinh doanh
                    </option>
                    <option value="Truyền thông" className="bg-[#0b1038]">
                      Truyền thông
                    </option>
                    <option value="Nghệ thuật" className="bg-[#0b1038]">
                      Nghệ thuật
                    </option>
                    <option value="Thể thao" className="bg-[#0b1038]">
                      Thể thao
                    </option>
                    <option value="Học thuật" className="bg-[#0b1038]">
                      Học thuật
                    </option>
                    <option value="Tình nguyện" className="bg-[#0b1038]">
                      Tình nguyện
                    </option>
                    <option value="Khác" className="bg-[#0b1038]">
                      Khác
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/70">Mô tả</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Giới thiệu về câu lạc bộ, sứ mệnh, hoạt động..."
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className={cn("rounded-3xl p-6", glass)}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Liên kết mạng xã hội
                </h2>
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.10]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm link
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {socialLinks.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm text-white/60">
                    Chưa có liên kết nào
                  </div>
                ) : (
                  socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-white/60" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) =>
                          handleSocialLinkChange(idx, e.target.value)
                        }
                        placeholder="https://facebook.com/..."
                        className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(idx)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="rounded-full border border-white/10 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploadingAvatar}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
