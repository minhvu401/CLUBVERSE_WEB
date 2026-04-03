import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProviders";
import { Toaster } from "sonner";
import QueryProvider from "@/app/providers/QueryProvider";

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
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" richColors closeButton duration={4200} />
      </body>
    </html>
  );
}
