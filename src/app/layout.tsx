import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

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
  keywords: ["photos", "daily photo", "personal project", "photo journal"],
  authors: [{ name: "Derrick" }],
  creator: "Derrick",
  publisher: "PhotoDay",
  openGraph: {
    title: "PhotoDay - One Photo Every Day",
    description: "A personal project to capture one photo every day",
    url: "https://photoday.vercel.app",
    siteName: "PhotoDay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoDay - One Photo Every Day",
    description: "A personal project to capture one photo every day",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
