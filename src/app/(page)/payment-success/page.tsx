"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("payment_pending");
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <Header />

      <main className="mx-auto max-w-xl px-4 pb-20 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-3xl p-8 text-center", glass)}
        >
          <CheckCircle2
            size={64}
            className="mx-auto text-emerald-400"
          />

          <h1 className="mt-4 text-2xl font-semibold">
            Thanh toán thành công 🎉
          </h1>

          <p className="mt-2 text-sm text-white/65">
            Gói <b>Premium AI</b> đã được kích hoạt cho tài khoản của bạn.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push("/my-payment")}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold hover:brightness-110"
            >
              Xem lịch sử thanh toán
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => router.push("/homepage")}
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm hover:bg-white/20"
            >
              <Home size={16} />
              Về trang chủ
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
