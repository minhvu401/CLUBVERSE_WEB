"use client";

import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { Check, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28">
        {/* HEADER */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70">
            <Sparkles size={14} />
            Gói nâng cấp AI
          </div>

          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Mở khóa gợi ý câu lạc bộ thông minh
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Nâng cấp Premium AI để hệ thống đề xuất câu lạc bộ phù hợp với sở
            thích, hành vi và mức độ hoạt động của bạn.
          </p>
        </section>

        {/* PLANS */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {/* FREE */}
          <motion.div
            className={cn("relative rounded-3xl p-6", glass)}
          >
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-1 text-[0.75rem] text-white/60">
              Trải nghiệm cơ bản – miễn phí
            </p>

            <div className="mt-4 text-3xl font-semibold">0₫</div>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Xem tất cả câu lạc bộ
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Tham gia sự kiện công khai
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Trang cá nhân cơ bản
              </li>
            </ul>

            <button
              disabled
              className="mt-6 w-full rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/40 cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <Lock size={14} /> Gói mặc định
              </span>
            </button>
          </motion.div>

          {/* PREMIUM AI */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "relative rounded-3xl p-6",
              glass,
              "ring-2 ring-violet-500 shadow-violet-500/30"
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-[0.65rem] font-semibold">
              Khuyên dùng
            </div>

            <h3 className="text-lg font-semibold">Premium AI</h3>
            <p className="mt-1 text-[0.75rem] text-white/60">
              Mở khóa toàn bộ sức mạnh gợi ý AI
            </p>

            <div className="mt-4 text-3xl font-semibold">
              50.000₫ <span className="text-sm text-white/50">/ tháng</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                AI gợi ý câu lạc bộ phù hợp
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Ưu tiên sự kiện nổi bật
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Cá nhân hóa theo hành vi người dùng
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Check size={16} className="text-emerald-400" />
                Không giới hạn gợi ý
              </li>
            </ul>

            <button
              onClick={() => {
                // SAU NÀY GẮN API:
                // POST /payments/create
                router.push("/checkout");
              }}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold hover:brightness-110"
            >
              Nâng cấp Premium
            </button>
          </motion.div>
        </section>

        {/* NOTE */}
        <p className="mt-10 text-center text-xs text-white/45">
          Thanh toán theo tháng • Có thể hủy bất kỳ lúc nào • Không ràng buộc
        </p>
      </main>

      <Footer />
    </div>
  );
}
