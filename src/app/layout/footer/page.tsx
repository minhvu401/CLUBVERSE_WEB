/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/providers/AuthProviders/page";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** ===== Club Footer (GIỐNG style/màu default, CHỈ khác nội dung) ===== */
function ClubFooter() {
  const year = new Date().getFullYear();

  // ✅ đổi route theo project của bạn nếu khác
  const clubLinks = [
    { label: "Trang chủ", href: "/homeclub" },
    { label: "Đơn đăng ký", href: "/club/applications" },
    { label: "Diễn đàn", href: "/forum" },
    { label: "Dashboard", href: "/club/dashboard" },
  ];

  const contact = {
    email: "contact@clubverse.vn",
    phone: "0123 456 789",
    address: "KCN Linh Trung, Việt Nam",
  };

  return (
    <footer className="relative overflow-hidden text-slate-200 border-t border-white/10">
      {/* ✅ BG giống DEFAULT */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + description */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center h-20 w-48 md:h-28 md:w-64 mx-auto">
            <Image
              src="/clubverse_logo_1.png"
              alt="Clubverse logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-[0.8rem] text-slate-300/90 leading-relaxed">
            Khu vực dành cho Câu lạc bộ: quản lý thành viên, sự kiện và nội dung
            cộng đồng một cách hiệu quả.
          </p>
        </div>

        {/* Club */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Club</h4>
          <ul className="space-y-2 text-[0.85rem] text-slate-300/90">
            {clubLinks.slice(0, 2).map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="hover:text-white transition-colors"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Manage */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Manage</h4>
          <ul className="space-y-2 text-[0.85rem] text-slate-300/90">
            {clubLinks.slice(2).map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="hover:text-white transition-colors"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / Social (giữ style giống default) */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Contact</h4>

          <div className="space-y-2 text-[0.85rem] text-slate-300/90">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-white/70" />
              <span className="hover:text-white transition-colors">
                {contact.email}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-white/70" />
              <span className="hover:text-white transition-colors">
                {contact.phone}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white/70" />
              <span className="hover:text-white transition-colors">
                {contact.address}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {[
              { icon: <FaFacebookF />, link: "#" },
              { icon: <FaInstagram />, link: "#" },
              { icon: <FaTwitter />, link: "#" },
              { icon: <FaLinkedinIn />, link: "#" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "border border-white/10 bg-white/[0.06]",
                  "hover:bg-sky-500/30 hover:border-white/20 transition"
                )}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar (giống default) */}
      <div className="border-t border-white/10 py-4 text-center text-[0.75rem] text-slate-300/70">
        © {year} CLUBVERSE — Club Portal. All rights reserved.
      </div>
    </footer>
  );
}

/** ===== Footer default (user/guest) ===== */
function DefaultFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden text-slate-200 border-t border-white/10">
      {/* ✅ BG giống HEADER */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      {/* glow nhẹ cho “premium” */}
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + description */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center h-20 w-48 md:h-28 md:w-64 mx-auto">
            <Image
              src="/clubverse_logo_1.png"
              alt="Clubverse logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-[0.8rem] text-slate-300/90 leading-relaxed">
            Empowering students to find their perfect community and manage
            engagement effortlessly.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Product</h4>
          <ul className="space-y-2 text-[0.85rem] text-slate-300/90">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Explore
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Join CLB
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Event List
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Mobile App
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Support</h4>
          <ul className="space-y-2 text-[0.85rem] text-slate-300/90">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold text-sm text-white/95 mb-3">Network</h4>
          <div className="flex gap-3">
            {[
              { icon: <FaFacebookF />, link: "#" },
              { icon: <FaInstagram />, link: "#" },
              { icon: <FaTwitter />, link: "#" },
              { icon: <FaLinkedinIn />, link: "#" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] hover:bg-sky-500/30 hover:border-white/20 transition"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 text-center text-[0.75rem] text-slate-300/70">
        © {year} CLUBVERSE — All rights reserved.
      </div>
    </footer>
  );
}

export default function Footer() {
  const { user } = useAuth() as any;
  const role = String(user?.role || "").toLowerCase();

  // ✅ role club => dùng footer club (style giống default)
  if (role === "club") return <ClubFooter />;

  // còn lại dùng footer cũ
  return <DefaultFooter />;
}
