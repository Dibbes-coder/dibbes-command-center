import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dibbes Command Center",
  description: "Signal. Speed. Precision."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
