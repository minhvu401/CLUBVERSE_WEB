import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProviders";
import { Toaster } from "sonner";
import { Inter, Space_Grotesk } from "next/font/google";

/* =========================
   FONTS
========================= */
// Body text – dễ đọc, nét tiếng Việt
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

// Heading / số / CTA – hiện đại, tech, premium
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

/* =========================
   METADATA
========================= */
export const metadata: Metadata = {
  title: "ClubVerse",
  description: "ClubVerse – Kết nối câu lạc bộ sinh viên",
};

/* =========================
   ROOT LAYOUT
========================= */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`
          ${inter.variable}
          ${spaceGrotesk.variable}
          font-sans
          antialiased
          bg-black
          text-white
        `}
      >
        <AuthProvider>{children}</AuthProvider>

        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={4200}
        />
      </body>
    </html>
  );
}
