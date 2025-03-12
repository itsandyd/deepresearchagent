import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex-1">
      {children}
    </div>
  )
} 