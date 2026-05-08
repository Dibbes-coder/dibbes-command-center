import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Dibbes Refine — Input anything. Reveal the signal.";
const description = "A premium AI refinement engine for people who refuse generic output.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Dibbes Refine",
  openGraph: {
    title,
    description,
    siteName: "Dibbes Refine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
