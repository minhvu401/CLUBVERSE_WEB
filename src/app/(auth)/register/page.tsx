"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { register, verifyOtp, resendOtp } from "@/app/services/api/auth";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "user",
    school: "",
    major: "",
    year: 1,
    category: "",
    description: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // check confirm password
    if (form.password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        ...form,
        year: Number(form.year) || 0,
      });
      setMessage(res.message);
      setStep("verify");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng kí thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await verifyOtp({ email: form.email, otp });
      setMessage(res.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xác thực thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await resendOtp({ email: form.email });
      setMessage(res.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gửi lại OTP thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP VERIFY OTP ----------
  if (step === "verify") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-12">
        <div className="relative z-10 flex w-full max-w-7xl flex-col gap-10 text-white md:flex-row">
          {/* Left branding */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl bg-white/5 px-8 py-12 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="relative mb-4 h-64 w-[22rem] md:h-80 md:w-[38rem]">
              <Image
                src="/clubverse_logo.png"
                alt="Clubverse logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="max-w-md text-base text-zinc-300">
              Hoàn tất xác thực để tham gia cộng đồng CLUBVERSE.
            </p>
          </div>

          {/* Right card: OTP verify */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-white/15 bg-white/10 p-12 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <h2 className="text-3xl font-semibold">Xác thực tài khoản</h2>
              <p className="mt-3 text-base text-zinc-300">
                Mã OTP đã được gửi tới email <strong>{form.email}</strong>.
              </p>

              {error && (
                <p
                  className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  className="mt-5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                  role="status"
                >
                  {message}
                </p>
              )}

              <form onSubmit={handleVerify} className="mt-6 space-y-6">
                <div className="space-y-2 text-base">
                  <label className="block font-medium" htmlFor="otp">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Nhập mã OTP"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Đang xác thực..." : "Xác thực"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="w-full text-center text-base text-violet-200 hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gửi lại OTP
                </button>
              </form>

              <p className="mt-8 text-center text-base text-zinc-300">
                Đã xác thực xong?{" "}
                <Link
                  href="/login"
                  className="font-medium text-violet-300 hover:text-violet-200"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- STEP REGISTER ----------
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-12">
      <div className="relative z-10 flex w-full max-w-7xl flex-col gap-10 text-white md:flex-row">
        {/* Left branding */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl bg-white/5 px-8 py-12 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="relative mb-4 h-64 w-[22rem] md:h-80 md:w-[38rem]">
            <Image
              src="/clubverse_logo.png"
              alt="Clubverse logo"
              fill
              className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
            />
          </div>
          <p className="max-w-md text-base text-zinc-300">
            Tham gia CLUBVERSE để bắt đầu hành trình cùng các câu lạc bộ yêu
            thích của bạn.
          </p>
        </div>

        {/* Right card: register form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-white/15 bg-white/10 p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold">Tham gia CLUBVERSE</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Tạo tài khoản để bắt đầu hành trình của bạn.
              </p>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-violet-900/40 transition hover:bg-white"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold">
                G
              </span>
              <span>Continue with Google</span>
            </button>

            {/* Divider OR */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-zinc-400">
                or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {error && (
              <p
                className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                role="status"
              >
                {message}
              </p>
            )}

            {/* Form fields styled similar to design */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div className="space-y-1.5 text-sm">
                  <label className="block font-medium" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    required
                  />
                </div>

                <div className="space-y-1.5 text-sm">
                  <label className="block font-medium" htmlFor="phoneNumber">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div className="space-y-1.5 text-sm">
                  <label className="block font-medium" htmlFor="school">
                    School
                  </label>
                  <input
                    id="school"
                    type="text"
                    placeholder="Enter your school"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.school}
                    onChange={handleChange("school")}
                    required
                  />
                </div>

                <div className="space-y-1.5 text-sm">
                  <label className="block font-medium" htmlFor="major">
                    Major
                  </label>
                  <input
                    id="major"
                    type="text"
                    placeholder="Enter your major"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.major}
                    onChange={handleChange("major")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block font-medium" htmlFor="year">
                  Year (Năm đại học)
                </label>
                <select
                  id="year"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.year}
                  onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  required
                >
                  <option value={1} className="bg-slate-800">Năm 1</option>
                  <option value={2} className="bg-slate-800">Năm 2</option>
                  <option value={3} className="bg-slate-800">Năm 3</option>
                  <option value={4} className="bg-slate-800">Năm 4</option>
                </select>
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="block font-medium" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng kí..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-violet-300 hover:text-violet-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
