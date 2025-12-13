"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProviders/page";
import Image from "next/image";
import { getProfile, updateStudentProfile, type ProfileResponse } from "@/app/services/api/auth";

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
  Plus,
  ChevronDown,
  Sparkles,
} from "lucide-react";

type Chip = { id: string; label: string };
type Slot = {
  start: string;
  end?: string;
  label?: string;
  tone: "green" | "purple" | "blue" | "red" | "gray";
};

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

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
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
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem]", toneCls)}>
      {label}
      {onRemove ? (
        <button
          onClick={onRemove}
          className="grid h-4 w-4 place-items-center rounded-full bg-white/10 hover:bg-white/[0.15]"
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
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.78rem] text-white/90 outline-none focus:border-white/20"
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
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
      />
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
      <span className="text-[0.72rem] text-white/60">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.78rem] text-white/90 outline-none focus:border-white/20",
          disabled && "opacity-70"
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

  const text = slot.label ? slot.label : slot.end ? `${slot.start} - ${slot.end}` : slot.start;
  return <div className={cn("rounded-lg border px-2 py-1 text-[0.68rem]", tone)}>{text}</div>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { token, loading, updateUser } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  const [skills, setSkills] = useState<Chip[]>([]);
  const [interests, setInterests] = useState<Chip[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!token) return;

      try {
        setPageLoading(true);

        const raw = await getProfile(token);
        const p: ProfileResponse = (raw as any)?.user ?? (raw as any);

        const next = {
          fullName: p.fullName ?? "",
          email: p.email ?? "",
          phoneNumber: (p as any).phoneNumber ?? "",
          avatarUrl: (p as any).avatarUrl ?? "",
          school: (p as any).school ?? "",
          major: (p as any).major ?? "",
          year: (p as any).year ? String((p as any).year) : "",
          skills: ((p as any).skills ?? []).map((s: string, idx: number) => ({ id: `s-${idx}`, label: s })),
          interests: ((p as any).interests ?? []).map((s: string, idx: number) => ({ id: `i-${idx}`, label: s })),
        };

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

        updateUser({
          fullName: next.fullName,
          email: next.email,
          avatarUrl: next.avatarUrl,
          phoneNumber: next.phoneNumber,
          school: next.school,
          major: next.major,
          year: next.year ? Number(next.year) : undefined,
        });
      } catch (e: any) {
        setToast({ type: "err", text: e?.message ?? "Không load được profile" });
      } finally {
        setPageLoading(false);
      }
    };

    run();
  }, [loading, token, updateUser]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

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
    setToast({ type: "ok", text: "Đã hoàn tác thay đổi" });
  };

  const handleSave = async () => {
    if (!token) return;

    if (!fullName.trim()) return setToast({ type: "err", text: "Vui lòng nhập fullName" });
if (!phoneNumber.trim()) return setToast({ type: "err", text: "Vui lòng nhập phoneNumber" });
if (!school.trim()) return setToast({ type: "err", text: "Vui lòng nhập school" });
    if (!major.trim()) return setToast({ type: "err", text: "Vui lòng nhập major" });
    if (!year || Number.isNaN(Number(year))) return setToast({ type: "err", text: "Year phải là số" });

    try {
      setSaving(true);

      const payload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatarUrl.trim() || "",
        school: school.trim(),
        major: major.trim(),
        year: Number(year),
        skills: skills.map((x) => x.label.trim()).filter(Boolean),
        interests: interests.map((x) => x.label.trim()).filter(Boolean),
      };

      const res: any = await updateStudentProfile(token, payload);
      const updated: any = res?.user ?? res?.data ?? null;

      setToast({ type: "ok", text: res?.message || "Cập nhật thành công" });

      updateUser({
        fullName: updated?.fullName ?? payload.fullName,
        email: updated?.email ?? email,
        avatarUrl: updated?.avatarUrl ?? payload.avatarUrl,
        phoneNumber: updated?.phoneNumber ?? payload.phoneNumber,
        school: updated?.school ?? payload.school,
        major: updated?.major ?? payload.major,
        year: updated?.year ?? payload.year,
      });

      const next = {
        fullName: updated?.fullName ?? payload.fullName,
        email: updated?.email ?? email,
        phoneNumber: updated?.phoneNumber ?? payload.phoneNumber,
        avatarUrl: updated?.avatarUrl ?? payload.avatarUrl,
        school: updated?.school ?? payload.school,
        major: updated?.major ?? payload.major,
        year: String(updated?.year ?? payload.year),
        skills: (updated?.skills ?? payload.skills).map((s: string, idx: number) => ({
          id: `s-${idx}-${Date.now()}`,
          label: s,
        })),
        interests: (updated?.interests ?? payload.interests).map((s: string, idx: number) => ({
          id: `i-${idx}-${Date.now()}`,
          label: s,
        })),
      };

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
    } catch (e: any) {
      setToast({ type: "err", text: e?.message ?? "Cập nhật thất bại" });
    } finally {
      setSaving(false);
    }
  };

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: string[] = [];
    for (let y = now - 6; y <= now + 6; y++) arr.push(String(y));
    return arr;
  }, []);

  const days = useMemo(
    () => [
      { key: "t2", label: "Thứ 2" },
      { key: "t3", label: "Thứ 3" },
      { key: "t4", label: "Thứ 4" },
      { key: "t5", label: "Thứ 5" },
      { key: "t6", label: "Thứ 6" },
      { key: "t7", label: "Thứ 7" },
      { key: "cn", label: "Chủ nhật" },
    ],
    []
  );

  const availability: Record<string, Slot[]> = useMemo(
    () => ({
      t2: [
        { start: "8:00", end: "12:00", tone: "green" },
        { start: "14:00", end: "17:00", tone: "blue" },
      ],
      t3: [{ start: "9:00", end: "16:00", tone: "green" }],
      t4: [{ start: "13:00", end: "16:00", tone: "purple" }],
      t5: [
        { start: "10:00", end: "12:00", tone: "purple" },
        { start: "15:00", end: "18:00", tone: "blue" },
      ],
      t6: [{ start: "8:00", end: "17:00", tone: "green" }],
      t7: [{ label: "Cả ngày", start: "Cả ngày", tone: "red" }],
      cn: [{ label: "Cả ngày", start: "Cả ngày", tone: "red" }],
    }),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      {toast ? (
        <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2">
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
      ) : null}

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <aside className={cn("hidden w-72 shrink-0 rounded-3xl p-4 md:block", glass)}>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
  <div className="relative h-14 w-[250px] overflow-hidden">
    <Image
      src="/clubverse_logo_1.png"     // đổi đúng tên file bạn bỏ vào /public
      alt="Clubverse"
      fill
      priority
      className="object-contain object-left"
    />
  </div>
</div>
          </div>

          {/* ✅ FIX: Avatar ở panel bên trái */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-semibold">
                  {initials(fullName || "User")}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{fullName || "—"}</p>
              <p className="text-[0.68rem] text-emerald-300/80">● Sinh viên</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5 text-[0.78rem]">
            {[
              { icon: <Home size={16} />, label: "Trang chủ", href: "/homepage" },
              { icon: <Users size={16} />, label: "Câu lạc bộ", href: "/clubs" },
              { icon: <CalendarDays size={16} />, label: "Sự kiện", href: "/events" },
              { icon: <User size={16} />, label: "Hồ sơ của tôi", href: "/profile", active: true },
              { icon: <MessageSquare size={16} />, label: "Tin nhắn", href: "/messages" },
              { icon: <Inbox size={16} />, label: "Đơn đã gửi", href: "/requests" },
            ].map((it) => (
              <Link
                key={it.label}
                href={it.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                  it.active
                    ? "bg-gradient-to-r from-emerald-500/80 to-sky-500/60 text-slate-950 font-semibold"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <span className={cn("opacity-90", it.active && "text-slate-950")}>{it.icon}</span>
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[0.78rem] text-white/70 hover:bg-white/[0.06] hover:text-white transition"
            >
              <Settings size={16} />
              Cài đặt
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className={cn("rounded-3xl p-5 md:p-6", glass)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-semibold">Hồ sơ cá nhân</h1>
                <p className="mt-1 text-[0.75rem] text-white/55">Cập nhật thông tin sinh viên</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                  <Search size={16} className="text-white/55" />
                  <input
                    placeholder="Tìm kiếm..."
                    className="w-44 bg-transparent text-[0.78rem] text-white/85 placeholder:text-white/35 outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/[0.10]"
                >
                  <Bell size={16} />
                </button>
              </div>
            </div>

            <div className={cn("mt-5 rounded-2xl p-5", "border border-white/10 bg-white/[0.04]")}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-lg font-semibold">
                      {initials(fullName || "User")}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{fullName || "—"}</p>
                  <p className="text-[0.72rem] text-white/55">{major || "—"}</p>
                </div>
              </div>

              {pageLoading ? (
                <p className="mt-3 text-center text-[0.75rem] text-white/55">Đang tải profile...</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <SectionTitle icon={<User size={16} />} title="Thông tin cá nhân" />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Field label="Họ và tên" value={fullName} onChange={setFullName} />
                <Field label="Email" value={email} onChange={setEmail} type="email" disabled />

                <Field label="Số điện thoại" value={phoneNumber} onChange={setPhoneNumber} />
                <Field label="Trường" value={school} onChange={setSchool} placeholder="VD: FPTU" />

                <Field
                  label="Chuyên ngành"
                  value={major}
                  onChange={setMajor}
                  placeholder="VD: Software Engineering"
                />
                <Select value={year} onChange={setYear} placeholder="Năm" options={yearOptions} />

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[0.72rem] text-white/60">Avatar URL</span>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.78rem] text-white/90 outline-none focus:border-white/20"
                  />
                </label>
              </div>
            </section>

            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <SectionTitle icon={<Sparkles size={16} />} title="Kỹ năng & Sở thích" />

              <div className="mt-4 space-y-6">
                <div className="space-y-2">
                  <p className="text-[0.78rem] font-semibold text-white/85">Kỹ năng</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((c) => (
                      <ChipPill
                        key={c.id}
                        label={c.label}
                        tone="blue"
                        onRemove={() => setSkills((prev) => prev.filter((x) => x.id !== c.id))}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Thêm kỹ năng mới..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.78rem] text-white/90 outline-none focus:border-white/20"
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
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-[0.78rem] font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      <Plus size={16} /> Thêm
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[0.78rem] font-semibold text-white/85">Sở thích</p>

                  <div className="flex flex-wrap gap-2">
                    {interests.map((c) => (
                      <ChipPill
                        key={c.id}
                        label={c.label}
                        tone="purple"
                        onRemove={() => setInterests((prev) => prev.filter((x) => x.id !== c.id))}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Thêm sở thích mới..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.78rem] text-white/90 outline-none focus:border-white/20"
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
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2 text-[0.78rem] font-semibold text-slate-950 hover:bg-sky-400"
                    >
                      <Plus size={16} /> Thêm
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className={cn("rounded-3xl p-5 md:p-6", glass)}>
              <SectionTitle icon={<CalendarDays size={16} />} title="Lịch rảnh" />

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="grid grid-cols-7 gap-2 text-center">
                  {days.map((d) => (
                    <div key={d.key} className="text-[0.7rem] text-white/65">
                      {d.label}
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-2">
                  {days.map((d) => (
                    <div key={d.key} className="space-y-2">
                      {(availability[d.key] ?? []).map((s, idx) => (
                        <SlotPill key={`${d.key}-${idx}`} slot={s} />
                      ))}
                      {!(availability[d.key] ?? []).length ? (
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-center text-[0.68rem] text-white/35">
                          —
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-sky-500/90 to-emerald-500/90 px-4 py-2 text-[0.78rem] font-semibold text-slate-950 hover:from-sky-400 hover:to-emerald-400"
                >
                  + Thêm khung giờ rảnh
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2 text-[0.78rem] font-semibold text-white/80 hover:bg-white/[0.10]",
                    saving && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <X size={16} /> Hủy
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || pageLoading}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/90 px-5 py-2 text-[0.78rem] font-semibold text-slate-950 hover:bg-sky-400",
                    (saving || pageLoading) && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <Save size={16} />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </section>
          </div>

          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}
