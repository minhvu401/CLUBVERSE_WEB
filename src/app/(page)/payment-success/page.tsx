import { Suspense } from "react";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { Loader2 } from "lucide-react";
import { PaymentSuccessContent } from "./PaymentSuccessContent";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function LoadingFallback() {
  return (
    <div className={cn("rounded-3xl p-8 text-center", glass)}>
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
    </div>
  );
}

export default function PaymentSuccessPage() {

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <Header />

      <main className="mx-auto max-w-xl px-4 pb-20 pt-28">
        <Suspense fallback={<LoadingFallback />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
