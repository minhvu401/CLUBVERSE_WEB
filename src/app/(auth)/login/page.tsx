"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { login } from "@/app/services/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const data = await login({ email, password });
      // Store token in localStorage for now; in a real app consider httpOnly cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
      }
      setSuccess("Đăng nhập thành công!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(message || "Thông tin đăng nhập không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-4 py-8">
      <div className="flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-transparent text-white md:flex-row">
        {/* Left side: logo and branding */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-transparent px-6 py-8 md:items-start">
          <div className="relative mb-4 h-100 w-100">
            <Image
              src="/clubverse_logo.png"
              alt="Clubverse logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Right side: login card */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Chào mừng trở lại CLUBVERSE</h2>
              <p className="mt-1 text-xs text-zinc-300">
                Đăng nhập để tiếp tục hành trình của bạn.
              </p>
            </div>

            {error && (
              <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-3 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300" role="status">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-4 py-2 text-xs font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-300">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-medium text-violet-300 hover:text-violet-200">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
