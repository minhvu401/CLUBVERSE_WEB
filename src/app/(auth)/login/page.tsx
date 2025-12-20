/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/services/api/auth";
import { useAuth } from "@/app/providers/AuthProviders/page";

function normalizeRole(role: unknown): "user" | "club" | "admin" | "unknown" {
  const r = String(role || "").trim().toLowerCase();
  if (r === "user" || r === "club" || r === "admin") return r;
  return "unknown";
}

function redirectByRole(
  role: "user" | "club" | "admin" | "unknown"
): string {
  // ✅ bạn đổi route theo project của bạn nếu khác
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "club":
      return "/club/home";
    case "user":
      return "/homepage"; // hoặc "/"
    default:
      return "/homepage";
  }
}

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

      const role = normalizeRole((data.user as any)?.role);
      const target = redirectByRole(role);

      setSuccess("Đăng nhập thành công!");
      router.push(target);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(message || "Thông tin đăng nhập không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-12 text-white">
      <div className="relative z-10 flex w-full max-w-7xl flex-col gap-10 rounded-3xl bg-transparent md:flex-row">
        {/* Left side: logo and branding */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl bg-white/5 px-8 py-12 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="relative mb-4 h-64 w-[22rem] md:h-80 md:w-[38rem]">
            <Image
              src="/clubverse_logo.png"
              alt="Clubverse logo"
              fill
              className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>

        {/* Right side: login card */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-white/15 bg-white/10 p-12 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold">Chào mừng trở lại</h2>
              <p className="mt-3 text-base text-zinc-300">
                Đăng nhập để khám phá các câu lạc bộ.
              </p>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white/95 px-6 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-violet-900/40 transition hover:bg-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-bold">
                G
              </span>
              <span>Continue with Google</span>
            </button>

            {/* Divider OR */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-400">
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
            {success && (
              <p
                className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                role="status"
              >
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-base">
                <label className="block font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 text-base">
                <label className="block font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-white/40 bg-transparent text-violet-400"
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
                className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-base text-zinc-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-violet-300 hover:text-violet-200"
              >
                Sign up
              </Link>
            </p>

            {/* Hint nhỏ (optional) */}
            <p className="mt-3 text-center text-xs text-white/45">
              Sau khi login sẽ tự điều hướng theo role: user / club / admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
