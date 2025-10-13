import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "FastFood Drone - Giao đồ ăn bằng drone",
  description: "Đặt đồ ăn nhanh chóng, giao hàng bằng drone hiện đại",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
            </div>
            <Footer />
            <BottomNav />
          </div>
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
