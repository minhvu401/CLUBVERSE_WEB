"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import {
  Loader2,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/providers/AuthProviders";
import { getPaymentHistory } from "@/app/services/api/payments";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

const BANK_CODE_MAP: Record<string, string> = {
  Vietcombank: "VCB",
};

type PendingPayment = {
  transactionRef: string;
  amount: number;
  bankName: string;
  accountNumber: string;
};

const PAYMENT_TIMEOUT = 600; // 10 phút

export default function PaymentPendingPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [payment, setPayment] = useState<PendingPayment | null>(null);
  const [copied, setCopied] = useState(false);
  const [remain, setRemain] = useState(PAYMENT_TIMEOUT);

  /* ================= Load payment ================= */
  useEffect(() => {
    const raw = localStorage.getItem("payment_pending");
    if (!raw) {
      router.replace("/pricing");
      return;
    }
    setPayment(JSON.parse(raw));
  }, [router]);

  /* ================= Countdown ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setRemain((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem("payment_pending");
          router.replace("/pricing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
  if (!token || !payment?.transactionRef) return;

  const interval = setInterval(async () => {
    try {
      const history = await getPaymentHistory(token);

      const currentPayment = history.find(
        (item) =>
          item.transactionRef === payment.transactionRef
      );

      if (currentPayment?.status === "completed") {
        clearInterval(interval);
        localStorage.removeItem("payment_pending");
        router.replace("/payment-success");
      }
    } catch (err) {
      console.error("Check payment failed", err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [token, payment, router]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const bankCode = BANK_CODE_MAP[payment.bankName] || "VCB";
  const qrUrl = `https://api.vietqr.io/image/${bankCode}-${payment.accountNumber}-compact2.png?amount=${payment.amount}&addInfo=${payment.transactionRef}&accountName=CLUBVERSE`;

  const minutes = Math.floor(remain / 60);
  const seconds = remain % 60;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {/* Back */}
        <button
          onClick={() => {
            localStorage.removeItem("payment_pending");
            router.push("/checkout");
          }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          <ArrowLeft size={16} />
          Quay về
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-3xl p-6", glass)}
        >
          <h1 className="mb-6 text-center text-xl font-semibold">
            Đang chờ thanh toán
          </h1>

          {/* 2 COLUMNS */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* LEFT */}
            <div className="flex flex-col items-center">
              <Timer className="text-amber-400" size={28} />
              <div className="mt-1 text-4xl font-bold text-amber-400">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <p className="mt-1 text-xs text-white/60">
                Thời gian còn lại
              </p>

              <div className="mt-6 rounded-2xl bg-white p-3">
                <img
                  src={qrUrl}
                  alt="QR chuyển khoản"
                  className="h-52 w-52"
                />
              </div>

              <p className="mt-3 text-center text-xs text-white/60">
                Quét QR bằng ứng dụng ngân hàng để chuyển khoản
              </p>
            </div>

            {/* RIGHT */}
            <div className="space-y-4 text-sm">
              <InfoRow label="Ngân hàng" value={payment.bankName} />
              <InfoRow
                label="Số tài khoản"
                value={payment.accountNumber}
                onCopy={() => copyText(payment.accountNumber)}
              />
              <InfoRow
                label="Số tiền"
                value={`${payment.amount.toLocaleString("vi-VN")}₫`}
                highlight
              />
              <InfoRow
                label="Nội dung chuyển khoản"
                value={payment.transactionRef}
                center
                onCopy={() => copyText(payment.transactionRef)}
              />

              {copied && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} />
                  Đã copy
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-white/45">
            Hệ thống đang tự động kiểm tra trạng thái thanh toán…
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

/* -------- Sub -------- */

function InfoRow({
  label,
  value,
  onCopy,
  highlight,
  center,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  highlight?: boolean;
  center?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-white/70">{label}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="text-white/60 hover:text-white"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
      <div
        className={cn(
          "mt-1 font-semibold",
          highlight && "text-emerald-400",
          center && "text-center text-violet-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}
