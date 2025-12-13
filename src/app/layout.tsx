import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/providers/AuthProviders/page";
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
