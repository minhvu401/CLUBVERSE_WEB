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
    year: 2024,
    category: "",
    description: "",
  });
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

  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-4 py-8">
        <div className="flex w-full max-w-5xl flex-col gap-8 text-white md:flex-row">
          {/* Left branding */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-transparent px-6 py-8 md:items-start">
            <div className="relative mb-4 h-24 w-24">
                <Image
                    src="/clubverse_logo.png"
                    alt="Clubverse logo"
                    fill
                    className="object-contain"
                />
            </div>
            <p className="max-w-md text-sm text-zinc-300">
              Hoàn tất xác thực để tham gia cộng đồng CLUBVERSE.
            </p>
          </div>

          {/* Right card: OTP verify */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Xác thực tài khoản</h2>
              <p className="mt-1 text-xs text-zinc-300">
                Mã OTP đã được gửi tới email <strong>{form.email}</strong>.
              </p>

              {error && (
                <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="mt-4 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300" role="status">
                  {message}
                </p>
              )}

              <form onSubmit={handleVerify} className="mt-4 space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="block font-medium" htmlFor="otp">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Nhập mã OTP"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-4 py-2 text-xs font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Đang xác thực..." : "Xác thực"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResend}
                  className="w-full text-center text-xs text-violet-200 hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gửi lại OTP
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-zinc-300">
                Đã xác thực xong?{" "}
                <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-4 py-8">
      <div className="flex w-full max-w-5xl flex-col gap-8 text-white md:flex-row">
        {/* Left branding */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-transparent px-6 py-8 md:items-start">
          <div className="relative mb-4 h-24 w-24">
            <Image
              src="/globe.svg"
              alt="Clubverse logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Clubverse</h1>
          <p className="max-w-md text-sm text-zinc-300">
            Tham gia CLUBVERSE để bắt đầu hành trình cùng các câu lạc bộ yêu thích của bạn.
          </p>
        </div>

        {/* Right card: register form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Tham gia CLUBVERSE</h2>
              <p className="mt-1 text-xs text-zinc-300">
                Tạo tài khoản để bắt đầu hành trình của bạn.
              </p>
            </div>

            {error && (
              <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="mb-3 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300" role="status">
                {message}
              </p>
            )}

            {/* Form fields styled similar to design */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1 text-xs">
                  <label className="block font-medium" htmlFor="school">
                    School
                  </label>
                  <input
                    id="school"
                    type="text"
                    placeholder="Enter your school"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.school}
                    onChange={handleChange("school")}
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="block font-medium" htmlFor="major">
                    Major
                  </label>
                  <input
                    id="major"
                    type="text"
                    placeholder="Enter your major"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.major}
                    onChange={handleChange("major")}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1 text-xs">
                  <label className="block font-medium" htmlFor="year">
                    Year
                  </label>
                  <input
                    id="year"
                    type="number"
                    placeholder="2024"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.year}
                    onChange={handleChange("year")}
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="block font-medium" htmlFor="category">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    placeholder="Technology, Art, ..."
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    value={form.category}
                    onChange={handleChange("category")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Tell us a bit about your club or yourself"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  rows={3}
                  value={form.description}
                  onChange={handleChange("description")}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-4 py-2 text-xs font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng kí..." : "Đăng kí"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-300">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
