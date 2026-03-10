// app/page.tsx
import Link from "next/link";
import GuestHeader from "./layout/guest-header/page";
import Footer from "@/app/layout/footer/page";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* NỀN TÍM CHỦ ĐẠO, ĐỒNG BỘ VỚI HEADER */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_100%_0,#7c3aed_0,#4c1d95_35%,transparent_70%),linear-gradient(to_bottom,#1e1b4b_0,#581c87_40%,#020617_100%)]
          animate-gradient-shift
        "
      />

      {/* Floating particles effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float-slow absolute top-20 left-[10%] h-2 w-2 rounded-full bg-sky-400/30 blur-sm" />
        <div className="animate-float-medium absolute top-40 right-[15%] h-3 w-3 rounded-full bg-purple-400/20 blur-sm" />
        <div className="animate-float-fast absolute top-60 left-[20%] h-2 w-2 rounded-full bg-indigo-400/25 blur-sm" />
        <div className="animate-float-slow absolute bottom-40 right-[25%] h-3 w-3 rounded-full bg-sky-300/20 blur-sm" />
        <div className="animate-float-medium absolute bottom-60 left-[30%] h-2 w-2 rounded-full bg-violet-400/30 blur-sm" />
      </div>

      <GuestHeader />

      <main className="mx-auto flex max-w-5xl flex-col gap-20 px-4 pb-16 pt-16 md:pt-20">
        {/* HERO */}
        <section className="text-center animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-semibold leading-snug animate-slide-down">
            Find Your Club,
            <br />
            One Click Away
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xs md:text-sm text-slate-200/85 animate-fade-in delay-100">
            Khám phá các câu lạc bộ phù hợp với sở thích, kết nối sinh viên
            và không bỏ lỡ bất kỳ sự kiện nào trong khuôn viên trường.
          </p>

          <div className="mt-8 flex justify-center animate-fade-in delay-200">
            <Link href="/login">
              <button className="group relative rounded-full bg-sky-400 px-6 py-2 text-xs font-semibold text-slate-950 shadow-xl shadow-sky-500/40 transition-all duration-300 hover:bg-sky-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/60">
                <span className="relative z-10">Tìm câu lạc bộ ngay</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-300 to-cyan-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              </button>
            </Link>
          </div>
        </section>

        {/* WHY SECTION */}
        <section className="space-y-8 animate-fade-in-up delay-300">
          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-wide animate-fade-in">
              TẠI SAO CHỌN CLUBVERSE?
            </h2>
            <p className="mt-2 text-xs text-slate-200/80 animate-fade-in delay-100">
              Tự động gợi ý câu lạc bộ dựa trên sở thích, ngành học và thời gian rảnh của bạn.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "AI Match",
                desc: "Thuật toán thông minh giúp tìm ra CLB phù hợp nhất với hồ sơ cá nhân.",
                delay: "delay-100",
              },
              {
                title: "Tham gia ngay",
                desc: "Một cú click để đăng ký, nhận thông báo và theo dõi hoạt động.",
                delay: "delay-200",
              },
              {
                title: "Calendar Sync",
                desc: "Đồng bộ lịch sinh hoạt với calendar cá nhân, không bỏ lỡ buổi nào.",
                delay: "delay-300",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`group rounded-2xl bg-white/10 p-5 text-center shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-md border border-white/5 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-[0_25px_80px_rgba(56,189,248,0.3)] hover:-translate-y-2 animate-fade-in-up ${item.delay}`}
              >
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300 transition-all duration-300 group-hover:bg-sky-500/40 group-hover:scale-110 group-hover:rotate-12">
                  ●
                </div>
                <h3 className="mt-4 text-sm font-semibold transition-colors duration-300 group-hover:text-sky-300">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.7rem] leading-relaxed text-slate-200/90 transition-colors duration-300 group-hover:text-white">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="space-y-8 animate-fade-in-up delay-400">
          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-wide animate-fade-in">
              What Students Say
            </h2>
            <p className="mt-2 text-xs text-slate-200/80 animate-fade-in delay-100">
              Hơn 1,000+ sinh viên đã tìm được &quot;bộ lạc&quot; của mình.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Lâm Anh",
                role: "Sinh viên Kinh tế",
                quote:
                  "Nhờ Clubverse mình tìm được CLB Marketing rất đúng định hướng, môi trường cực kỳ năng động.",
                delay: "delay-100",
              },
              {
                name: "Minh Đức",
                role: "Khoa CNTT",
                quote:
                  "App dễ dùng, lịch sự kiện được nhắc tự động nên không còn quên buổi sinh hoạt nữa.",
                delay: "delay-200",
              },
              {
                name: "Kiều My",
                role: "Năm nhất",
                quote:
                  "Mới vào trường nhưng mình nhanh chóng kết nối được với nhiều anh chị và bạn bè.",
                delay: "delay-300",
              },
            ].map((item) => (
              <article
                key={item.name}
                className={`group flex flex-col gap-3 rounded-2xl bg-white/10 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-md border border-white/5 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-[0_25px_80px_rgba(139,92,246,0.3)] hover:-translate-y-2 animate-fade-in-up ${item.delay}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-sky-500 group-hover:scale-110">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold transition-colors duration-300 group-hover:text-purple-300">
                      {item.name}
                    </p>
                    <p className="text-[0.65rem] text-slate-300/80">
                      {item.role}
                    </p>
                  </div>
                </div>
                <p className="text-[0.7rem] leading-relaxed text-slate-100/90 transition-colors duration-300 group-hover:text-white">
                  "{item.quote}"
                </p>
                <div className="mt-1 text-[0.7rem] text-yellow-300 transition-all duration-300 group-hover:text-yellow-200 group-hover:scale-110">
                  ★★★★★
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 text-center text-xs md:grid-cols-4 animate-fade-in-up delay-500">
          {[
            { label: "Sinh viên", value: "50K+", delay: "delay-100" },
            { label: "Câu lạc bộ", value: "2,500+", delay: "delay-200" },
            { label: "Sự kiện mỗi năm", value: "300+", delay: "delay-300" },
            { label: "Lượt ghép nối", value: "100K+", delay: "delay-400" },
          ].map((s) => (
            <div
              key={s.label}
              className={`group rounded-2xl bg-white/10 px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-md border border-white/5 transition-all duration-500 hover:bg-white/15 hover:scale-110 hover:shadow-[0_25px_80px_rgba(56,189,248,0.4)] animate-fade-in-up ${s.delay}`}
            >
              <div className="text-sm font-semibold transition-all duration-300 group-hover:text-sky-300 group-hover:scale-125">
                {s.value}
              </div>
              <div className="mt-1 text-[0.65rem] text-slate-200/80 transition-colors duration-300 group-hover:text-white">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* CTA BANNER */}
        <section className="animate-fade-in-up delay-600 rounded-3xl bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-sky-500/90 p-[1.5px] shadow-[0_18px_60px_rgba(15,23,42,1)] transition-all duration-500 hover:shadow-[0_30px_100px_rgba(139,92,246,0.6)] hover:scale-[1.02] animate-pulse-slow">
          <div className="rounded-3xl bg-slate-950/70 px-6 py-8 text-center backdrop-blur-sm">
            <h3 className="text-sm font-semibold animate-fade-in">
              Ready to Find Your Tribe?
            </h3>
            <p className="mt-2 max-w-xl mx-auto text-[0.7rem] text-slate-200/90 animate-fade-in delay-100">
              Hãy để CLUBVERSE giúp bạn kết nối với những cộng đồng phù hợp,
              mở rộng mối quan hệ và phát triển bản thân trong suốt thời sinh viên.
            </p>
            <button className="group relative mt-5 rounded-full bg-sky-400 px-6 py-2 text-xs font-semibold text-slate-950 shadow-xl shadow-sky-500/40 transition-all duration-300 hover:bg-sky-300 hover:scale-110 hover:shadow-2xl hover:shadow-sky-400/70 animate-fade-in delay-200">
              <span className="relative z-10">Bắt đầu ngay</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-pulse" />

            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}