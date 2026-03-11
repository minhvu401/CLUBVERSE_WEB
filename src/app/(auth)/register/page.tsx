"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register, verifyOtp, resendOtp } from "@/app/services/api/auth";

export default function RegisterPage() {
  const router = useRouter();

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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await register({ ...form, year: Number(form.year) || 0 });
      setMessage(res.message);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp({ email: form.email, otp });
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await resendOtp({ email: form.email });
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi lại OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-10 text-white">
        <div className="flex w-full max-w-6xl flex-col gap-8 md:flex-row">
          {/* LEFT */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white/5 px-6 py-10 backdrop-blur-xl">
            <div className="relative h-56 w-[26rem]">
              <Image
                src="/clubverse_logo.png"
                alt="ClubVerse"
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-zinc-300 text-center">
              Hoàn tất xác thực để tham gia cộng đồng ClubVerse
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-2xl">
              <h2 className="text-2xl font-semibold">Xác thực tài khoản</h2>
              <p className="mt-2 text-sm text-zinc-300">
                Mã OTP đã được gửi tới <strong>{form.email}</strong>
              </p>

              {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
              {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

              <form onSubmit={handleVerify} className="mt-5 space-y-4">
                <input
                  placeholder="Nhập mã OTP"
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-semibold"
                >
                  {loading ? "Đang xác thực..." : "Xác thực"}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full text-sm text-violet-300"
                >
                  Gửi lại mã OTP
                </button>
              </form>

              <p className="mt-6 text-center text-sm">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-violet-300 font-medium"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= REGISTER ================= */
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020617] via-[#020059] to-[#4c1d95] px-6 py-10 text-white">
      <div className="flex w-full max-w-6xl flex-col gap-8 md:flex-row">
        {/* LEFT */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white/5 px-6 py-10 backdrop-blur-xl">
          <div className="relative h-56 w-[26rem]">
            <Image
              src="/clubverse_logo.png"
              alt="ClubVerse"
              fill
              className="object-contain"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm text-zinc-300 text-center">
            Kết nối câu lạc bộ phù hợp – xây dựng hành trình đại học của bạn
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-2xl">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold">Đăng ký ClubVerse</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Tạo tài khoản để bắt đầu hành trình của bạn
              </p>
            </div>

            {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
            {message && <p className="mb-3 text-sm text-emerald-300">{message}</p>}

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  placeholder="Họ và tên"
                  className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  required
                />
                <input
                  placeholder="Số điện thoại"
                  className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  required
                />
              </div>

              <input
                placeholder="Email"
                type="email"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                value={form.email}
                onChange={handleChange("email")}
                required
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  placeholder="Trường học"
                  className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                  value={form.school}
                  onChange={handleChange("school")}
                  required
                />
                <input
                  placeholder="Chuyên ngành"
                  className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                  value={form.major}
                  onChange={handleChange("major")}
                  required
                />
              </div>

              <select
                className="w-full rounded-xl bg-white/10 border border-black/20 px-4 py-3 text-sm"
                value={form.year}
                onChange={(e) =>
                  setForm((p) => ({ ...p, year: Number(e.target.value) }))
                }
              >
                <option value={1}>Năm 1</option>
                <option value={2}>Năm 2</option>
                <option value={3}>Năm 3</option>
                <option value={4}>Năm 4</option>
              </select>

              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full rounded-xl bg-white/10 border border-black/20 px-4 py-3 text-sm"
                value={form.password}
                onChange={handleChange("password")}
                required
              />

              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-semibold"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-300">
              Đã có tài khoản?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-violet-300 font-medium"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
