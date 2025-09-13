//@ts-nocheck
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/lib/provider"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "Nomadic - Desert Camping Experience",
  description: "Experience the ultimate desert camping adventure with Nomadic",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
         <Toaster position="top-right" reverseOrder={false} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
