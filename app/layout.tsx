import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Dibbes Refine — X replies worth noticing";
const description = "Paste an X post and sharpen your reply into something human, premium, and worth checking a profile for.";

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
    card: "summary",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
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
