"use client";

import Link from "next/link";
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-semibold text-zinc-900">Đăng nhập</h1>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            {success}
          </p>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="mt-2 text-center text-sm text-zinc-600">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-medium text-zinc-900 underline">
            Đăng kí
          </Link>
        </p>
      </form>
    </div>
  );
}
