import { clerkClient } from "@clerk/nextjs/server"
import { auth } from "@clerk/nextjs/server"

// Function to check if a user is an admin
export async function isUserAdmin() {
  const { userId } = await auth()

  if (!userId) {
    return false
  }

  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    // Check if the user has the admin role in public metadata
    return user.publicMetadata?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Function to set a user as admin
export async function setUserAsAdmin(userId: string) {
  try {
    const clerk = await clerkClient()
    await clerk.users.updateUser(userId, {
      publicMetadata: { role: "admin" },
    })
    return true
  } catch (error) {
    console.error("Error setting user as admin:", error)
    return false
  }
}

