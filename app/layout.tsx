import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/lib/provider";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";

const robotoFont = localFont({
  src: "/Roboto.ttf", // ✅ correct path for public folder
  variable: "--font-roboto", // ✅ creates a CSS variable
});

export const metadata: Metadata = {
  title: "Nomadic Bookings - Desert Camping Experience",
  description:
    "Experience the ultimate desert camping adventure with Nomadic Bookings",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${robotoFont.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased font-roboto">
        <Toaster position="top-right" reverseOrder={false} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
