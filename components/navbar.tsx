"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
}

interface NavbarProps {
  brandName: string
  items: NavItem[]
  variant?: "default" | "transparent"
  rightContent?: React.ReactNode
  brandLink?: string
}

export function Navbar({ 
  brandName, 
  items, 
  variant = "default", 
  rightContent,
  brandLink = "/"
}: NavbarProps) {
  const pathname = usePathname()
  
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-zinc-800",
      variant === "default" 
        ? "bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80" 
        : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <Link href={brandLink} className="flex items-center font-bold">
          <span className="text-white">{brandName}</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive 
                      ? "text-white hover:text-white/80" 
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {rightContent && (
            <div className="ml-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 