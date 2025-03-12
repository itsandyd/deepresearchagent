import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET a single task
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params before accessing its properties
    const paramsData = await params
    const taskId = paramsData.id

    const task = await db.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// PATCH (update) a task
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params before accessing its properties
    const paramsData = await params
    const taskId = paramsData.id

    const body = await req.json()
    const { name, prompt, agentType } = body

    // Validate required fields
    if (!name || !prompt || !agentType) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if task exists and belongs to user
    const existingTask = await db.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!existingTask) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: {
        id: taskId,
        userId,
      },
      data: {
        name,
        prompt,
        agentType,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[TASK_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE a task
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params before accessing its properties
    const paramsData = await params
    const taskId = paramsData.id

    // Check if task exists and belongs to user
    const existingTask = await db.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!existingTask) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Delete the task
    await db.task.delete({
      where: {
        id: taskId,
        userId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 