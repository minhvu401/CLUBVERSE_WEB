"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { Sparkles, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPayment } from "@/app/services/api/payments";
import { useAuth } from "@/app/providers/AuthProviders";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  const handlePay = async () => {
    if (!token) return;

    try {
      setProcessing(true);
      setError(null);

      // 🔥 CALL API CREATE PAYMENT
      const payment = await createPayment(token);
      console.log("Payment response:", payment);

      // 👉 Redirect to PayOS checkout
      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      } else {
        throw new Error("Không có checkoutUrl từ response");
      }
    } catch (err: any) {
      setError(
        err?.message || "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại."
      );
      setProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {/* TITLE */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70">
            <Sparkles size={14} />
            Thanh toán Premium AI
          </div>

          <h1 className="mt-4 text-3xl font-semibold">
            Xác nhận thanh toán
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Bạn sắp được tạo yêu cầu thanh toán cho gói Premium AI.
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-3xl p-6", glass)}
          >
            <h2 className="text-lg font-semibold">Gói đã chọn</h2>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Premium AI</p>
                  <p className="text-xs text-white/60">
                    Gia hạn hàng tháng
                  </p>
                </div>
                <div className="text-lg font-semibold">50.000₫</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={cn("rounded-3xl p-6", glass)}
          >
            <h2 className="text-lg font-semibold">Thanh toán</h2>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Thanh toán chuyển khoản ngân hàng
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-400" />
                Xác nhận tự động từ hệ thống
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className={cn(
                "mt-8 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition",
                processing
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:brightness-110"
              )}
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Đang tạo yêu cầu thanh toán...
                </>
              ) : (
                "Tiến hành thanh toán"
              )}
            </button>

            <p className="mt-4 text-center text-xs text-white/45">
              Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
