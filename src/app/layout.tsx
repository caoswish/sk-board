import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Sidebar from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "'26년 7월 SK그룹 신입구성원과정 (7/1 ~ 7/15)",
  description: "Next.js + Supabase로 만든 Q&A 게시판",
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:flex-row">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </main>
      </body>
    </html>
  );
}
