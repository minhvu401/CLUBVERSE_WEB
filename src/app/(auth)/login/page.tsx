/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/services/api/auth";
import { useAuth } from "@/app/providers/AuthProviders/page";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { login: saveAuth } = useAuth(); // hàm lưu token + user vào context

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // API login trả về { accessToken, user }
      const data = await login({ email, password });

      // Lưu qua AuthContext (AuthProvider sẽ tự ghi vào localStorage)
      saveAuth(data.accessToken, data.user as any);

      setSuccess("Đăng nhập thành công!");
      router.push("/homepage"); // chuyển về trang home khi thành công
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(message || "Thông tin đăng nhập không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-4 py-8 text-white">
      {/* các vòng tròn mờ giống thiết kế */}
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute left-16 -bottom-32 h-80 w-80 rounded-full bg-[#1e1b4b]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[#a855f7]/35 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-transparent md:flex-row">
        {/* Left side: logo and branding */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-transparent px-6 py-8 md:items-start">
          <div className="relative mb-4 h-40 w-64 md:h-52 md:w-80">
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
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold">Chào mừng trở lại</h2>
              <p className="mt-1 text-xs text-zinc-300">
                Đăng nhập để khám phá các câu lạc bộ.
              </p>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-900 shadow-lg shadow-violet-900/40 hover:bg-slate-100 transition"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold">
                G
              </span>
              <span>Continue with Google</span>
            </button>

            {/* Divider OR */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {error && (
              <p
                className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}
            {success && (
              <p
                className="mb-3 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
                role="status"
              >
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border border-white/40 bg-transparent text-violet-400"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-violet-300 hover:text-violet-200"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-4 py-2 text-xs font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-violet-300 hover:text-violet-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
