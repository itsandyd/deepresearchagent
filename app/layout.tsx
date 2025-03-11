import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"


import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Deep Research Agent",
  description: "AI-powered research assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

