"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Home, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers/AuthProviders";
import { checkPaymentStatus } from "@/app/services/api/payments";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const verifyPayment = async () => {
      try {
        const orderCode = searchParams.get("orderCode");
        const code = searchParams.get("code");
        const paymentStatus = searchParams.get("status");

        // Kiểm tra callback từ PayOS
        if (!orderCode || !code || paymentStatus !== "PAID") {
          setStatus("failed");
          setMessage("Thanh toán không thành công hoặc đã bị hủy. Vui lòng thử lại.");
          return;
        }

        // Xác minh với backend
        const result = await checkPaymentStatus(token, orderCode);

        if (result.status === "completed") {
          setStatus("success");
          setMessage("Gói Premium AI đã được kích hoạt cho tài khoản của bạn.");
          localStorage.removeItem("payment_pending");
        } else {
          setStatus("failed");
          setMessage("Thanh toán chưa được xác nhận. Vui lòng kiểm tra lại.");
        }
      } catch (err: any) {
        setStatus("failed");
        setMessage(err?.message || "Lỗi khi xác minh thanh toán. Vui lòng thử lại.");
      }
    };

    verifyPayment();
  }, [token, router, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-3xl p-8 text-center", glass)}
    >
      {status === "loading" && (
        <>
          <Loader2
            size={64}
            className="mx-auto animate-spin text-blue-400"
          />
          <h1 className="mt-4 text-2xl font-semibold">
            Đang xác minh thanh toán...
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Vui lòng chờ một chút.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2
            size={64}
            className="mx-auto text-emerald-400"
          />
          <h1 className="mt-4 text-2xl font-semibold">
            Thanh toán thành công 🎉
          </h1>
          <p className="mt-2 text-sm text-white/65">
            {message}
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <AlertCircle
            size={64}
            className="mx-auto text-red-400"
          />
          <h1 className="mt-4 text-2xl font-semibold">
            Thanh toán thất bại
          </h1>
          <p className="mt-2 text-sm text-white/65">
            {message}
          </p>
        </>
      )}

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
  );
}
