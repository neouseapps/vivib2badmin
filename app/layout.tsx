import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VSVN · Lead Scoring Demo",
  description: "Visit Vietnam Admin & Operation Portal — Lead scoring & grading",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        {/* figma capture */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body className="h-screen overflow-hidden flex bg-bg-lv1 text-ink-1 font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col bg-bg-lv2/40">{children}</main>
      </body>
    </html>
  );
}
