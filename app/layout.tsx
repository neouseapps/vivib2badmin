import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SmallScreenBlock } from "@/components/layout/SmallScreenBlock";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VSVN · Demo Portal",
  description: "Visit Vietnam — Admin & Partner Portal Demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        {/* figma capture */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body className="h-screen overflow-hidden flex bg-bg-lv1 text-ink-1 font-sans">
        <SmallScreenBlock />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
