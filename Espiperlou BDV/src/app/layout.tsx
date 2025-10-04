import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BDV",
  description: "Banco de Venezuela",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
