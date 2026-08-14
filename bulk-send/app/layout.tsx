import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BulkSend — Personal Email Campaigns",
  description: "Send personalized emails individually to multiple recipients.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex bg-slate-50 font-sans antialiased">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
