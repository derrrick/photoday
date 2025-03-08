import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoDay - One Photo Every Day",
  description: "A personal project to capture one photo every day",
  keywords: ["photos", "gallery", "memories", "sharing", "photo management", "photo editing"],
  authors: [{ name: "PhotoDay Team" }],
  creator: "PhotoDay",
  publisher: "PhotoDay",
  openGraph: {
    title: "PhotoDay - Capture and Share Your Memories",
    description: "A modern platform for organizing, editing, and sharing your precious memories with friends and family.",
    url: "https://photoday.vercel.app",
    siteName: "PhotoDay",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000",
        width: 1200,
        height: 630,
        alt: "PhotoDay Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoDay - Capture and Share Your Memories",
    description: "A modern platform for organizing, editing, and sharing your precious memories with friends and family.",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
