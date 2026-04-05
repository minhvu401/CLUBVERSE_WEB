/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { login } from "@/app/services/api/auth";
import { useAuth } from "@/app/providers/AuthProviders";

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
      return "/admin/";
    case "club":
      return "/club/forum";
    case "user":
      return "/homepage"; // hoặc "/"
    default:
      return "/homepage";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login: saveAuth } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Đang đăng nhập...");

    try {
      const data = await login({ email, password });
      saveAuth(data.accessToken, data.user as any);
      router.push(
        redirectByRole(normalizeRole((data.user as any)?.role))
      );
      toast.success("🎉 Đăng nhập thành công!", { id: toastId });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Đăng nhập thất bại",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-10 text-white overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.16),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.16),transparent_55%)]" />

      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-10 md:flex-row">
        {/* LEFT */}
        <div className="relative flex flex-1 flex-col items-center justify-center rounded-3xl bg-white/5 px-8 py-10 backdrop-blur-xl shadow-lg transition hover:bg-white/10">
          {/* LOGO */}
          <div className="relative h-64 w-[30rem] transition-transform duration-700 animate-[float_6s_ease-in-out_infinite]">
            <Image
              src="/clubverse_logo.png"
              alt="Clubverse logo"
              fill
              className="object-contain drop-shadow-[0_30px_55px_rgba(0,0,0,0.55)]"
            />
          </div>

          {/* SLOGAN */}
          <p className="mt-4 text-center text-base font-medium tracking-wide
                        bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300
                        bg-clip-text text-transparent
                        animate-[fadeUp_0.9s_ease-out]">
            Kết nối đúng câu lạc bộ. Kiến tạo vũ trụ của bạn.
          </p>

          {/* subtle glow */}
          <div className="pointer-events-none absolute bottom-8 h-32 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        {/* RIGHT */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-10 backdrop-blur-2xl shadow-xl transition hover:border-white/25 hover:bg-white/15">
            <div className="mb-7 text-center">
              <h2 className="text-[26px] font-semibold">
                Chào mừng trở lại
              </h2>
              <p className="mt-2 text-base text-zinc-300">
                Đăng nhập để khám phá các câu lạc bộ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm
                             focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 pr-12 text-sm
                               focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Ghi nhớ đăng nhập
                </label>
                <Link href="/forgot-password" className="text-violet-300 hover:text-violet-200">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-semibold
                           transition hover:scale-[1.02] hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-zinc-300">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-violet-300 font-medium">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
