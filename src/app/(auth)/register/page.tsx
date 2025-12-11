"use client";

import Link from "next/link";
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow"
        >
          <h1 className="text-2xl font-semibold text-zinc-900">
            Xác thực tài khoản
          </h1>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600" role="status">
              {message}
            </p>
          )}

          <p className="text-sm text-zinc-600">
            Mã OTP đã được gửi tới email <strong>{form.email}</strong>
          </p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700" htmlFor="otp">
              OTP
            </label>
            <input
              id="otp"
              type="text"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="mt-2 w-full text-sm text-zinc-700 underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Gửi lại OTP
          </button>

          <p className="mt-4 text-center text-sm text-zinc-600">
            Đã xác thực xong?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-semibold text-zinc-900">Đăng kí</h1>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-600" role="status">
            {message}
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
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="fullName"
          >
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.fullName}
            onChange={handleChange("fullName")}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="phoneNumber"
          >
            Số điện thoại
          </label>
          <input
            id="phoneNumber"
            type="tel"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.phoneNumber}
            onChange={handleChange("phoneNumber")}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="school">
            Trường
          </label>
          <input
            id="school"
            type="text"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.school}
            onChange={handleChange("school")}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="major">
            Chuyên ngành
          </label>
          <input
            id="major"
            type="text"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.major}
            onChange={handleChange("major")}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="year">
            Năm
          </label>
          <input
            id="year"
            type="number"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.year}
            onChange={handleChange("year")}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="category">
            Danh mục
          </label>
          <input
            id="category"
            type="text"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.category}
            onChange={handleChange("category")}
            required
          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="description"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={form.description}
            onChange={handleChange("description")}
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang đăng kí..." : "Đăng kí"}
        </button>

        <p className="mt-2 text-center text-sm text-zinc-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
