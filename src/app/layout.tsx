import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { TopBar } from "@/components/layout/top-bar";

const fontSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foundation Management Dashboard",
  description:
    "Simple, accessible management console for non-profit operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} bg-slate-100 antialiased`} style={{ pointerEvents: 'auto' }}>
        <QueryProvider>
          <div className="flex min-h-screen flex-col lg:flex-row" style={{ pointerEvents: 'auto' }}>
            <TopBar />
            <Sidebar />
            <main className="flex-1 bg-slate-50 px-4 py-6 text-lg text-slate-900 lg:px-10 lg:py-10" style={{ pointerEvents: 'auto' }}>
              <div className="mx-auto max-w-7xl space-y-6">{children}</div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
