import Link from "next/link";
import GuestHeader from "@/app/layout/guest-header/page";
import Footer from "@/app/layout/footer/page";
import { Users, Target, Lightbulb, Heart } from "lucide-react";

const CORE_VALUES = [
  {
    icon: Users,
    title: "Kết Nối",
    desc: "Xây dựng cầu nối giữa sinh viên và các câu lạc bộ, tạo nên cộng đồng bền vững.",
    bg: "bg-sky-500/15",
    text: "text-sky-300",
  },
  {
    icon: Heart,
    title: "Tận Tâm",
    desc: "Luôn đặt sinh viên ở trung tâm trong mọi quyết định và trải nghiệm.",
    bg: "bg-rose-500/15",
    text: "text-rose-300",
  },
  {
    icon: Lightbulb,
    title: "Đổi Mới",
    desc: "Không ngừng ứng dụng công nghệ và AI để cá nhân hóa trải nghiệm.",
    bg: "bg-purple-500/15",
    text: "text-purple-300",
  },
  {
    icon: Target,
    title: "Hiệu Quả",
    desc: "Tối ưu hoá việc tìm kiếm và tham gia CLB chỉ trong vài thao tác.",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden font-sans">
      {/* NỀN CHỦ ĐẠO CLUBVERSE */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0,#7c3aed_0,#4c1d95_35%,transparent_70%),linear-gradient(to_bottom,#0f172a_0,#1e1b4b_45%,#020617_100%)]" />

      <GuestHeader />

      <main className="mx-auto max-w-6xl px-4 pt-16 pb-20 space-y-24">
        {/* HERO */}
        <section className="text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Về ClubVerse
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-slate-300 leading-relaxed">
            ClubVerse được tạo ra với sứ mệnh giúp sinh viên nhanh chóng tìm thấy
            câu lạc bộ phù hợp, kết nối đúng cộng đồng và tận hưởng trọn vẹn hành trình
            đại học ngay từ những ngày đầu bước chân vào giảng đường.
          </p>
        </section>

        {/* MISSION - VISION */}
        <section className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Sứ Mệnh",
              icon: Target,
              color: "sky",
              content:
                "Xây dựng nền tảng kết nối thông minh, giúp sinh viên khám phá và tham gia các CLB phù hợp với đam mê, kỹ năng và lịch trình cá nhân.",
            },
            {
              title: "Tầm Nhìn",
              icon: Lightbulb,
              color: "purple",
              content:
                "Trở thành nền tảng kết nối CLB sinh viên hàng đầu Việt Nam, nơi AI và dữ liệu tạo ra trải nghiệm cá nhân hoá sâu sắc.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`h-12 w-12 flex items-center justify-center rounded-full bg-${item.color}-500/15`}
                >
                  <item.icon className={`h-6 w-6 text-${item.color}-300`} />
                </div>
                <h2 className="font-heading text-xl font-semibold">
                  {item.title}
                </h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </section>

        {/* CORE VALUES */}
        <section className="space-y-10">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold">
              Giá Trị Cốt Lõi
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Những nguyên tắc định hình ClubVerse
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 transition"
              >
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center ${v.bg} mb-4`}
                >
                  <v.icon className={`h-7 w-7 ${v.text}`} />
                </div>
                <h3 className="font-heading font-semibold mb-2">
                  {v.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 p-[1px]">
          <div className="rounded-3xl bg-slate-950/80 px-8 py-12 text-center">
            <h3 className="font-heading text-2xl font-bold">
              Bắt Đầu Hành Trình Cùng ClubVerse
            </h3>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm">
              Kết nối – Khám phá – Phát triển cùng cộng đồng sinh viên năng động trên toàn quốc.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register">
                <button className="rounded-full bg-sky-400 px-8 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-300 transition">
                  Đăng Ký Ngay
                </button>
              </Link>
              <Link href="/contact">
                <button className="rounded-full border border-white/20 px-8 py-3 text-sm hover:bg-white/10 transition">
                  Liên Hệ
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
