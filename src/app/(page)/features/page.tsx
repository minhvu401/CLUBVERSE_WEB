import Link from "next/link";
import GuestHeader from "@/app/layout/guest-header/page";
import Footer from "@/app/layout/footer/page";
import {
  Sparkles,
  Calendar,
  Bell,
  Users,
  Search,
  TrendingUp,
  MessageSquare,
  Shield,
  Zap,
  Heart,
  Star,
  CheckCircle,
} from "lucide-react";

/* ===== DATA MAP (KHÔNG DÙNG CLASS ĐỘNG) ===== */
const MAIN_FEATURES = [
  {
    icon: Sparkles,
    title: "AI Smart Match",
    desc: "Thuật toán AI phân tích sở thích, ngành học, kỹ năng và lịch trình để gợi ý CLB phù hợp với độ chính xác >90%.",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-300",
  },
  {
    icon: Calendar,
    title: "Calendar Sync",
    desc: "Đồng bộ lịch CLB với Google Calendar, Apple Calendar để không bỏ lỡ sự kiện quan trọng.",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-300",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Thông báo thông minh về deadline, sự kiện và hoạt động CLB bạn quan tâm.",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-300",
  },
];

const SECONDARY_FEATURES = [
  {
    icon: Search,
    title: "Advanced Search & Filter",
    desc: "Tìm kiếm nâng cao theo lĩnh vực, quy mô, thời gian, địa điểm.",
    features: ["20+ bộ lọc", "Sắp xếp theo độ phù hợp", "Lưu bộ lọc"],
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
  },
  {
    icon: Users,
    title: "Community Hub",
    desc: "Kết nối và xem review từ hàng ngàn sinh viên đang tham gia CLB.",
    features: ["50K+ sinh viên", "Review chân thực", "Q&A với CLB"],
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-300",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    desc: "Chat trực tiếp với đại diện CLB, phản hồi nhanh trong 24h.",
    features: ["Chat realtime", "Tư vấn CLB", "Lưu lịch sử chat"],
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-300",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    desc: "Theo dõi hoạt động tham gia và thành tích cá nhân.",
    features: ["Thống kê chi tiết", "Badges", "Xuất báo cáo"],
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-300",
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white font-sans">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0,#7c3aed_0,#4c1d95_35%,transparent_70%),linear-gradient(to_bottom,#0f172a_0,#1e1b4b_45%,#020617_100%)]" />

      <GuestHeader />

      <main className="mx-auto max-w-6xl px-4 pt-16 pb-20 space-y-24">
        {/* HERO */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-medium text-sky-300">
              Powered by AI Technology
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tính Năng Nổi Bật
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-slate-300 leading-relaxed">
            Khám phá những tính năng thông minh giúp bạn kết nối đúng CLB,
            đúng cộng đồng và đúng đam mê.
          </p>
        </section>

        {/* MAIN FEATURES */}
        <section className="grid gap-6 md:grid-cols-3">
          {MAIN_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 hover:bg-white/10 transition"
            >
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${f.iconBg} mb-5`}>
                <f.icon className={`h-7 w-7 ${f.iconColor}`} />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        {/* SECONDARY FEATURES */}
        <section className="grid gap-6 md:grid-cols-2">
          {SECONDARY_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {f.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 p-[1px]">
          <div className="rounded-3xl bg-slate-950/80 px-8 py-12 text-center">
            <h3 className="font-heading text-2xl font-bold">
              Sẵn Sàng Trải Nghiệm?
            </h3>
            <p className="mt-4 max-w-xl mx-auto text-sm text-slate-300">
              Tham gia ClubVerse ngay hôm nay – hoàn toàn miễn phí.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register">
                <button className="rounded-full bg-sky-400 px-8 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-300 transition">
                  Đăng Ký Miễn Phí
                </button>
              </Link>
              <Link href="/about">
                <button className="rounded-full border border-white/20 px-8 py-3 text-sm hover:bg-white/10 transition">
                  Tìm Hiểu Thêm
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
