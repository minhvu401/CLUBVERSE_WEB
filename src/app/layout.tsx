import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProviders";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Clubverse",
  description: "Clubverse app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors closeButton duration={4200} />
      </body>
    </html>
  );
}
