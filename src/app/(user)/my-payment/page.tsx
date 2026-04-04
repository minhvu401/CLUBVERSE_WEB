/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/AuthProviders";
import { toast } from "sonner";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  getPaymentHistory,
  type PaymentHistoryItem,
} from "@/app/services/api/payments";

/* ================= utils ================= */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

/* ================= modal ================= */

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md">
        <div className={cn("rounded-3xl p-6", glass)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */

export default function MyPaymentPage() {
  const { token, loading } = useAuth();

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [fetching, setFetching] = useState(false);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PaymentHistoryItem | null>(null);

  /* fetch payment history */
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setFetching(true);
        const data = await getPaymentHistory(token);
        setPayments(Array.isArray(data) ? data : []);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được lịch sử thanh toán");
        setPayments([]);
      } finally {
        setFetching(false);
      }
    })();
  }, [token]);

  if (loading) return null;

  return (
    <div className="relative min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />

      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <AppSidebar activeKey="payments" />
        </div>

        <main className="w-full space-y-6">
          {/* header */}
          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full">
                <Wallet size={20} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold">Lịch sử thanh toán</h1>
            </div>
            <p className="text-sm text-white/60 ml-11">
              Danh sách các giao dịch bạn đã thực hiện
            </p>
          </div>

          {/* list */}
          <section className={cn("rounded-3xl", glass)}>
            <div className="p-6">
              {fetching && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                    <p className="text-sm text-white/60">Đang tải lịch sử thanh toán...</p>
                  </div>
                </div>
              )}

              {!fetching && payments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-white/5 rounded-full mb-4">
                    <CreditCard size={32} className="text-white/40" />
                  </div>
                  <p className="text-white/60 font-medium">Chưa có giao dịch nào</p>
                  <p className="text-xs text-white/40 mt-1">
                    Khi bạn thực hiện thanh toán, chúng sẽ hiển thị ở đây
                  </p>
                </div>
              )}

              {!fetching && payments.length > 0 && (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p._id}
                      className="group rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] hover:border-white/20 hover:from-white/10 transition-all duration-300 p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                              "p-2 rounded-lg",
                              p.status === "completed"
                                ? "bg-emerald-500/20"
                                : p.status === "pending"
                                ? "bg-amber-500/20"
                                : "bg-red-500/20"
                            )}>
                              <CreditCard size={16} className={cn(
                                p.status === "completed"
                                  ? "text-emerald-400"
                                  : p.status === "pending"
                                  ? "text-amber-400"
                                  : "text-red-400"
                              )} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{p.description}</p>
                              <p className="text-xs text-white/50">{p.packageType}</p>
                            </div>
                          </div>

                          <div className="ml-11 flex flex-wrap gap-4 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {fmtDate(p.createdAt)}
                            </span>
                            <span className="font-semibold text-white/90">
                              {p.amount.toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <StatusBadge status={p.status} />
                          <button
                            onClick={() => {
                              setPicked(p);
                              setOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-medium transition-all duration-300 group-hover:border-white/40"
                          >
                            <FileText size={14} />
                            Chi tiết
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* modal */}
      <Modal
        open={open}
        title="Chi tiết thanh toán"
        onClose={() => setOpen(false)}
      >
        {!picked ? null : (
          <div className="space-y-4 text-sm">
            {/* main info */}
            <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2.5 rounded-lg flex-shrink-0",
                  picked.status === "completed"
                    ? "bg-emerald-500/20"
                    : picked.status === "pending"
                    ? "bg-amber-500/20"
                    : "bg-red-500/20"
                )}>
                  <CreditCard size={20} className={cn(
                    picked.status === "completed"
                      ? "text-emerald-400"
                      : picked.status === "pending"
                      ? "text-amber-400"
                      : "text-red-400"
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-white">{picked.description}</p>
                  <p className="text-xs text-white/50 mt-0.5">{picked.packageType}</p>
                </div>
              </div>
            </div>

            {/* details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60 mb-1">Số tiền</p>
                <p className="font-semibold text-emerald-400">
                  {picked.amount.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-white/60 mb-1">Trạng thái</p>
                <StatusBadge status={picked.status} />
              </div>
            </div>

            {/* details list */}
            <div className="space-y-2 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start gap-2">
                <span className="text-white/70">Mã giao dịch:</span>
                <code className="text-xs bg-black/30 rounded px-2 py-1 text-emerald-400/90">
                  {picked.transactionRef}
                </code>
              </div>
              <div className="flex justify-between items-start gap-2 pt-2 border-t border-white/10">
                <span className="text-white/70">Thời gian:</span>
                <span className="text-right text-white/90 text-xs">
                  {fmtDate(picked.createdAt)}
                </span>
              </div>
              {picked.paymentUrl && (
                <div className="flex justify-between items-start gap-2 pt-2 border-t border-white/10">
                  <span className="text-white/70">URL:</span>
                  <span className="text-right text-blue-400/90 text-xs break-all">
                    {picked.paymentUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= sub ================= */

function StatusBadge({
  status,
}: {
  status: "pending" | "completed" | "failed";
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 size={13} />
        Thành công
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 border border-amber-500/30">
        <Clock size={13} />
        Đang xử lý
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 border border-red-500/30">
      <XCircle size={13} />
      Thất bại
    </span>
  );
}
