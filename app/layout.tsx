import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalForge — Input anything. Reveal the signal.",
  description: "A premium AI refinement engine for creators, founders, and brands who refuse generic output.",
};

export const viewport: Viewport = {
  themeColor: "#070604",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
