import React from "react"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNav } from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <Footer />
      <BottomNav />
      <Toaster />
    </div>
  )
}
