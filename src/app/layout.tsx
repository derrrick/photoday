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
  title: "Schippert Photography - One Photo Every Day",
  description: "A personal photography project by Schippert",
  keywords: ["photos", "daily photo", "Schippert", "photography", "photo journal"],
  authors: [{ name: "Derrick Schippert" }],
  creator: "Derrick Schippert",
  publisher: "Schippert Photography",
  icons: {
    icon: [
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/favicon.ico', sizes: 'any' }
    ]
  },
  openGraph: {
    title: "Schippert Photography - One Photo Every Day",
    description: "A personal photography project by Schippert",
    url: "https://photoday.vercel.app",
    siteName: "Schippert Photography",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schippert Photography - One Photo Every Day",
    description: "A personal photography project by Schippert",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/images/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
