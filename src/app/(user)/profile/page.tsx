"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders";
import { toast } from "sonner";
import AppSidebar from "@/components/AppSidebar";

import Image from "next/image";
import {
  getProfile,
  updateStudentProfile,
  type ProfileResponse,
  type UpdateStudentProfileRequest,
  type UpdateStudentProfileResponse,
} from "@/app/services/api/auth";

import {
  Search,
  Bell,
  Home,
  Users,
  CalendarDays,
  User,
  MessageSquare,
  Inbox,
  Settings,
  Save,
  X,
  ArrowLeft,
  Plus,
  ChevronDown,
  Sparkles,
  LogOut,
  UploadCloud,
  ImageIcon,
  Check,
} from "lucide-react";

type Chip = { id: string; label: string };
type Slot = {
  start: string;
  end?: string;
  label?: string;
  tone: "green" | "purple" | "blue" | "red" | "gray";
};

type ProfileDraft = {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  school: string;
  major: string;
  year: string;
  skills: Chip[];
  interests: Chip[];
};

type ProfileApiPayload = ProfileResponse | { user?: ProfileResponse };

function getYearLabel(year?: number | null): string {
  if (!year) return "";
  return year >= 1 && year <= 4 ? `Năm ${year}` : "";
}

function profileToDraft(
  profile: ProfileResponse,
  seed: string = `${Date.now()}`
): ProfileDraft {
  return {
    fullName: profile.fullName ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    school: profile.school ?? "",
    major: profile.major ?? "",
    year: getYearLabel(profile.year),
    skills: (profile.skills ?? []).map((skill, idx) => ({
      id: `s-${seed}-${idx}`,
      label: skill,
    })),
    interests: (profile.interests ?? []).map((interest, idx) => ({
      id: `i-${seed}-${idx}`,
      label: interest,
    })),
  };
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

/** ✅ parse "Năm 1" / "1" => 1..4 */
function parseAcademicYear(v: string): number | null {
  const t = (v || "").trim();
  if (!t) return null;
  const m = t.match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (![1, 2, 3, 4].includes(n)) return null;
  return n;
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/6">
        {icon}
      </span>
      {title}
    </div>
  );
}

function ChipPill({
  label,
  onRemove,
  tone = "blue",
}: {
  label: string;
  onRemove?: () => void;
  tone?: "blue" | "purple" | "green" | "gray";
}) {
  const toneCls =
    tone === "purple"
      ? "bg-violet-500/15 text-violet-100 border-violet-400/20"
      : tone === "green"
      ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/20"
      : tone === "gray"
      ? "bg-white/10 text-white/80 border-white/10"
      : "bg-sky-500/15 text-sky-100 border-sky-400/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem]",
        toneCls
      )}
    >
      {label}
      {onRemove ? (
        <button
          onClick={onRemove}
          className="grid h-4 w-4 place-items-center rounded-full bg-white/10 hover:bg-white/15"
          aria-label="Remove"
          type="button"
        >
          <X size={12} />
        </button>
      ) : null}
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/6 pl-3 pr-10 py-2.5 text-[0.78rem] leading-tight text-white/90 outline-none transition focus:border-white/30 focus:bg-white/10"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-950">
            {o}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[0.72rem] font-medium text-white/65">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-[0.78rem] text-white/90 outline-none transition focus:border-white/30 focus:bg-white/10 placeholder:text-white/30",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      />
    </label>
  );
}

function SlotPill({ slot }: { slot: Slot }) {
  const tone =
    slot.tone === "green"
      ? "bg-emerald-500/25 border-emerald-400/20 text-emerald-50"
      : slot.tone === "purple"
      ? "bg-violet-500/25 border-violet-400/20 text-violet-50"
      : slot.tone === "red"
      ? "bg-rose-500/25 border-rose-400/20 text-rose-50"
      : slot.tone === "gray"
      ? "bg-white/10 border-white/10 text-white/75"
      : "bg-sky-500/25 border-sky-400/20 text-sky-50";

  const text = slot.label
    ? slot.label
    : slot.end
    ? `${slot.start} - ${slot.end}`
    : slot.start;
  return (
    <div className={cn("rounded-lg border px-2 py-1 text-[0.68rem]", tone)}>
      {text}
    </div>
  );
}

/** ✅ ENHANCED: Upload Avatar UI - Beautiful & Professional */
function AvatarUploadBox({
  shownAvatar,
  fileName,
  fileSizeMB,
  onPick,
  onClear,
  overSize,
}: {
  shownAvatar: string;
  fileName: string;
  fileSizeMB: string;
  onPick: () => void;
  onClear: () => void;
  overSize: boolean;
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-[0.72rem] font-medium text-white/65">
        Ảnh đại diện
      </label>
      <div className="rounded-xl border-2 border-dashed border-white/15 bg-white/4 p-4 transition hover:border-white/25 hover:bg-white/6">
        <div className="flex items-center gap-4">
          {/* Preview thumbnail */}
          {shownAvatar ? (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
              <img
                src={shownAvatar}
                alt="preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
              <ImageIcon size={32} className="text-white/40" />
            </div>
          )}

          {/* Upload info */}
          <div className="flex-1 space-y-2">
            {fileName ? (
              <>
                <p className="text-[0.75rem] font-semibold text-white/90">
                  {fileName}
                </p>
                <p
                  className={cn(
                    "text-[0.7rem]",
                    overSize ? "text-rose-400" : "text-white/60"
                  )}
                >
                  {fileSizeMB} MB {overSize && "⚠️ Vượt quá 2MB"}
                </p>
              </>
            ) : (
              <p className="text-[0.75rem] text-white/60">
                Chưa chọn ảnh. Nhấn "Chọn ảnh" để thêm
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={onPick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/80 px-3 py-1.5 text-[0.7rem] font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              <UploadCloud size={14} />
              <span className="hidden sm:inline">Chọn ảnh</span>
            </button>
            {fileName && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold text-white/85 transition hover:bg-white/15"
              >
                <X size={14} />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const { token, loading, updateUser, logout } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement | null>(null);
  const isPremium = Boolean((useAuth() as any)?.user?.isPremium);

  // ✅ avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [skills, setSkills] = useState<Chip[]>([]);
  const [interests, setInterests] = useState<Chip[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [snapshot, setSnapshot] = useState<ProfileDraft | null>(null);
  const [profileId, setProfileId] = useState<string>("");

  // ✅ url avatar hiển thị: ưu tiên preview (file vừa chọn)
  const shownAvatar = avatarPreview || avatarUrl;

  // ✅ redirect khi chưa login (nhưng không redirect lúc đang logout)
  useEffect(() => {
    if (!loading && !token && !loggingOut) router.push("/login");
  }, [loading, token, router, loggingOut]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      if (typeof logout === "function") {
        await logout();
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authToken");
        }
      }

      if (typeof updateUser === "function") {
        updateUser({
          fullName: "",
          email: "",
          avatarUrl: "",
          phoneNumber: "",
          school: "",
          major: "",
          year: undefined,
        });
      }

      router.replace("/");
    } finally {
      setTimeout(() => setLoggingOut(false), 0);
    }
  };

  // ✅ cleanup preview blob
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // ✅ Upload API call
  const uploadAvatar = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload-avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload avatar thất bại");
    return data.url as string;
  };

  // ✅ chọn ảnh + preview
  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const MAX = 2 * 1024 * 1024; // 2MB
    if (f.size > MAX) {
      toast.error("Ảnh tối đa 2MB");
      return;
    }

    setAvatarFile(f);

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const clearAvatarPick = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const run = async () => {
      if (loading || !token) return;

      try {
        setPageLoading(true);

        const raw = (await getProfile(token)) as ProfileApiPayload;
        const profile =
          "user" in raw && raw.user ? raw.user : (raw as ProfileResponse);
        const next = profileToDraft(profile, profile._id);

        setFullName(next.fullName);
        setEmail(next.email);
        setPhoneNumber(next.phoneNumber);
        setAvatarUrl(next.avatarUrl);
        setSchool(next.school);
        setMajor(next.major);
        setYear(next.year);
        setSkills(next.skills);
        setInterests(next.interests);
        setSnapshot(next);
        setProfileId(profile._id);

        clearAvatarPick();

        updateUser({
          fullName: next.fullName,
          email: next.email,
          avatarUrl: next.avatarUrl,
          phoneNumber: next.phoneNumber,
          school: next.school,
          major: next.major,
          year:
            typeof profile.year === "number" &&
            profile.year >= 1 &&
            profile.year <= 4
              ? profile.year
              : undefined,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Không load được profile";
        toast.error(message);
      } finally {
        setPageLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token, updateUser]);

  const addSkill = () => {
    const t = skillInput.trim();
    if (!t) return;
    if (skills.some((s) => s.label.toLowerCase() === t.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [{ id: `s-${Date.now()}`, label: t }, ...prev]);
    setSkillInput("");
  };

  const addInterest = () => {
    const t = interestInput.trim();
    if (!t) return;
    if (interests.some((s) => s.label.toLowerCase() === t.toLowerCase())) {
      setInterestInput("");
      return;
    }
    setInterests((prev) => [{ id: `i-${Date.now()}`, label: t }, ...prev]);
    setInterestInput("");
  };

  const handleCancel = () => {
    if (!snapshot) return;
    setFullName(snapshot.fullName);
    setEmail(snapshot.email);
    setPhoneNumber(snapshot.phoneNumber);
    setAvatarUrl(snapshot.avatarUrl);
    setSchool(snapshot.school);
    setMajor(snapshot.major);
    setYear(snapshot.year);
    setSkills(snapshot.skills);
    setInterests(snapshot.interests);

    clearAvatarPick();

    toast.success("Hoàn tác", { description: "Đã hoàn tác thay đổi" });
  };

  const handleSave = async () => {
    if (!token) return;

    if (!fullName.trim()) return toast.error("Vui lòng nhập fullName");
    if (!phoneNumber.trim()) return toast.error("Vui lòng nhập phoneNumber");
    if (!school.trim()) return toast.error("Vui lòng nhập school");
    if (!major.trim()) return toast.error("Vui lòng nhập major");

    const y = parseAcademicYear(year);
    if (!y) return toast.error("Vui lòng chọn Năm 1 - Năm 4");

    try {
      setSaving(true);

      let finalAvatarUrl = avatarUrl.trim() || "";
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile);
      }

      const payload: UpdateStudentProfileRequest = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: finalAvatarUrl,
        school: school.trim(),
        major: major.trim(),
        year: y,
        skills: skills.map((x) => x.label.trim()).filter(Boolean),
        interests: interests.map((x) => x.label.trim()).filter(Boolean),
      };

      const res = await updateStudentProfile(token, payload);
      const fallbackData = (
        res as UpdateStudentProfileResponse & {
          data?: ProfileResponse;
        }
      ).data;
      const updatedProfile = res.user ?? fallbackData ?? null;

      toast.success("Thành công", {
        description: res?.message || "Cập nhật thành công",
      });

      const resolvedProfile: ProfileResponse = updatedProfile ?? {
        _id: profileId || "local-profile",
        email,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        avatarUrl: payload.avatarUrl,
        school: payload.school,
        major: payload.major,
        year: payload.year,
        skills: payload.skills,
        interests: payload.interests,
      };

      setProfileId(resolvedProfile._id);

      const updatedYearNum =
        typeof resolvedProfile.year === "number" && resolvedProfile.year >= 1
          ? resolvedProfile.year
          : payload.year;

      updateUser({
        fullName: resolvedProfile.fullName ?? payload.fullName,
        email: resolvedProfile.email ?? email,
        avatarUrl: resolvedProfile.avatarUrl ?? payload.avatarUrl,
        phoneNumber: resolvedProfile.phoneNumber ?? payload.phoneNumber,
        school: resolvedProfile.school ?? payload.school,
        major: resolvedProfile.major ?? payload.major,
        year:
          updatedYearNum >= 1 && updatedYearNum <= 4
            ? updatedYearNum
            : undefined,
      });

      const next = profileToDraft(resolvedProfile, resolvedProfile._id);

      setFullName(next.fullName);
      setEmail(next.email);
      setPhoneNumber(next.phoneNumber);
      setAvatarUrl(next.avatarUrl);
      setSchool(next.school);
      setMajor(next.major);
      setYear(next.year);
      setSkills(next.skills);
      setInterests(next.interests);
      setSnapshot(next);

      clearAvatarPick();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Cập nhật thất bại";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const yearOptions = useMemo(() => ["Năm 1", "Năm 2", "Năm 3", "Năm 4"], []);

  const pickedName = avatarFile?.name ?? "";
  const pickedSizeMB = avatarFile
    ? (avatarFile.size / 1024 / 1024).toFixed(2)
    : "0";
  const overSize = avatarFile ? avatarFile.size > 2 * 1024 * 1024 : false;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <AppSidebar activeKey="profile" />

        <main className="min-w-0 flex-1">
          <div className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/homepage")}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[0.75rem] font-medium text-white/85 transition hover:bg-white/10"
                >
                  <ArrowLeft size={14} />
                  Về trang chủ
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                  <p className="mt-1 text-[0.75rem] text-white/55">
                    Cập nhật và quản lý thông tin sinh viên của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 transition hover:bg-white/10">
                  <Search size={16} className="text-white/55" />
                  <input
                    placeholder="Tìm kiếm..."
                    className="w-44 bg-transparent text-[0.78rem] text-white/85 placeholder:text-white/35 outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/6 transition hover:bg-white/10"
                >
                  <Bell size={16} />
                </button>
              </div>
            </div>

            {/* Profile Header Card */}
            <div
              className={cn(
                "mt-6 rounded-2xl p-6",
                "border border-white/10 bg-white/4"
              )}
            >
              <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6 md:items-start">
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/10 bg-white/6 transition hover:border-white/20 hover:shadow-lg"
                  >
                    <div className="relative h-full w-full">
                      {shownAvatar ? (
                        <img
                          src={shownAvatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-bold text-white/60">
                          {initials(fullName || "User")}
                        </div>
                      )}

                      {/* Premium Badge */}
                      {isPremium && (
                        <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-2 py-1 text-[0.6rem] font-bold text-white shadow-lg">
                          <Sparkles size={12} />
                          Premium
                        </div>
                      )}
                    </div>
                  </button>

                  {avatarMenuOpen && (
                    <div className="absolute left-1/2 z-50 mt-2 w-40 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900/95 p-1 backdrop-blur-sm shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          window.open(shownAvatar, "_blank");
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/85 transition hover:bg-white/10"
                      >
                        👁️ Xem avatar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/85 transition hover:bg-white/10"
                      >
                        🔁 Đổi avatar
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xl font-bold">{fullName || "Chưa đặt tên"}</p>
                    <p className="mt-1 text-[0.75rem] text-white/55">
                      {major || "—"}
                    </p>
                  </div>

                  {/* Info Tags */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {school && (
                      <div className="flex items-center gap-1.5 rounded-full bg-white/6 border border-white/10 px-3 py-1.5 text-[0.7rem]">
                        <Home size={12} />
                        {school}
                      </div>
                    )}
                    {year && (
                      <div className="flex items-center gap-1.5 rounded-full bg-white/6 border border-white/10 px-3 py-1.5 text-[0.7rem]">
                        <User size={12} />
                        {year}
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[0.7rem] font-semibold text-white/70 uppercase tracking-wide">Kỹ năng</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((skill) => (
                          <ChipPill
                            key={skill.id}
                            label={skill.label}
                            tone="blue"
                          />
                        ))}
                        {skills.length > 4 && (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/6 px-2.5 py-1 text-[0.65rem] text-white/70 font-medium">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {interests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[0.7rem] font-semibold text-white/70 uppercase tracking-wide">Sở thích</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.slice(0, 4).map((interest) => (
                          <ChipPill
                            key={interest.id}
                            label={interest.label}
                            tone="purple"
                          />
                        ))}
                        {interests.length > 4 && (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/6 px-2.5 py-1 text-[0.65rem] text-white/70 font-medium">
                            +{interests.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {pageLoading && (
                <p className="mt-4 text-center text-[0.75rem] text-white/55 animate-pulse">
                  Đang tải profile...
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            {/* Personal Info Section */}
            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <SectionTitle
                icon={<User size={16} />}
                title="Thông tin cá nhân"
              />

              <div className="mt-5 border-t border-white/10 pt-5" />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field
                  label="Họ và tên"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Nhập họ và tên"
                />
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  disabled
                />

                <Field
                  label="Số điện thoại"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Ví dụ: 0123456789"
                />
                <Field
                  label="Trường"
                  value={school}
                  onChange={setSchool}
                  placeholder="Ví dụ: FPTU"
                />

                <Field
                  label="Chuyên ngành"
                  value={major}
                  onChange={setMajor}
                  placeholder="Ví dụ: Software Engineering"
                />

                <Select
                  value={year}
                  onChange={setYear}
                  placeholder="Chọn năm học"
                  options={yearOptions}
                />

                {/* Avatar Uploader */}
                <AvatarUploadBox
                  shownAvatar={shownAvatar}
                  fileName={pickedName}
                  fileSizeMB={pickedSizeMB}
                  overSize={overSize}
                  onPick={() => fileInputRef.current?.click()}
                  onClear={clearAvatarPick}
                />

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onPickAvatar}
                  className="hidden"
                />
              </div>
            </section>

            {/* Skills & Interests Section */}
            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <SectionTitle
                icon={<Sparkles size={16} />}
                title="Kỹ năng & Sở thích"
              />

              <div className="mt-5 border-t border-white/10 pt-5" />

              <div className="mt-4 space-y-7">
                {/* Skills */}
                <div className="space-y-3">
                  <p className="text-[0.78rem] font-semibold text-white/85">
                    Kỹ năng
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 ? (
                      <p className="text-[0.7rem] text-white/50 italic">
                        Chưa thêm kỹ năng nào
                      </p>
                    ) : (
                      skills.map((c) => (
                        <ChipPill
                          key={c.id}
                          label={c.label}
                          tone="blue"
                          onRemove={() =>
                            setSkills((prev) =>
                              prev.filter((x) => x.id !== c.id)
                            )
                          }
                        />
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Thêm kỹ năng mới... (Enter để thêm)"
                      className="flex-1 rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-[0.78rem] text-white/90 outline-none transition focus:border-white/30 focus:bg-white/10 placeholder:text-white/30"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/80 px-4 py-2.5 text-[0.75rem] font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Thêm</span>
                    </button>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <p className="text-[0.78rem] font-semibold text-white/85">
                    Sở thích
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {interests.length === 0 ? (
                      <p className="text-[0.7rem] text-white/50 italic">
                        Chưa thêm sở thích nào
                      </p>
                    ) : (
                      interests.map((c) => (
                        <ChipPill
                          key={c.id}
                          label={c.label}
                          tone="purple"
                          onRemove={() =>
                            setInterests((prev) =>
                              prev.filter((x) => x.id !== c.id)
                            )
                          }
                        />
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Thêm sở thích mới... (Enter để thêm)"
                      className="flex-1 rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-[0.78rem] text-white/90 outline-none transition focus:border-white/30 focus:bg-white/10 placeholder:text-white/30"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-500/80 px-4 py-2.5 text-[0.75rem] font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Thêm</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || pageLoading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/6 px-6 py-2.5 text-[0.78rem] font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10",
                  (saving || pageLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                <X size={16} />
                Hoàn tác
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || pageLoading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-2.5 text-[0.78rem] font-semibold text-slate-950 shadow-lg transition hover:shadow-xl hover:from-sky-400 hover:to-cyan-400",
                  (saving || pageLoading) && "opacity-70 cursor-not-allowed"
                )}
              >
                <Check size={16} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
