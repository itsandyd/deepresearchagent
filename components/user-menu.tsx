"use client"

import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UserMenu() {
  const { isSignedIn, user } = useUser()
  const isAdmin = user?.publicMetadata?.role === "admin"

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <>
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href="/admin">Admin Panel</Link>
            </Button>
          )}
          <UserButton afterSignOutUrl="/" />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      )}
    </div>
  )
}

