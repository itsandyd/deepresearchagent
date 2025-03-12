import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { name, prompt, agentType } = await request.json()

    // Validate required fields
    if (!name || !prompt || !agentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create task in database
    const task = await db.task.create({
      data: {
        name,
        prompt,
        agentType,
        userId,
        status: "pending",
        result: {},
      },
    })

    // Return the created task
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tasks for the current user
    const tasks = await db.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

