import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { Navbar } from "@/components/navbar"
import { UserButton } from "@clerk/nextjs"

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
  // Navigation items for the navbar
  const navItems = [
    { label: "Dashboard", href: "/agent/dashboard" },
    { label: "Tasks", href: "/agent/dashboard/tasks" },
    { label: "Settings", href: "/settings" },
  ]

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col min-h-screen bg-black text-white">
              <Navbar 
                brandName="OpenManus" 
                items={navItems} 
                rightContent={<UserButton afterSignOutUrl="/" />}
              />
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

