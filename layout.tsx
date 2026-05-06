import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dibbes Command Center",
  description: "Signal. Speed. Precision. A personal AI dashboard for creative momentum."
};

export const viewport: Viewport = {
  themeColor: "#020617"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
