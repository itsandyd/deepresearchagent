import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET a specific run
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params before accessing its properties
    const paramsData = await params
    const taskId = paramsData.id
    const runId = paramsData.runId

    // Check if task exists and belongs to user
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Get the specific run
    const run = await db.agentRun.findUnique({
      where: {
        id: runId,
        taskId: taskId,
      },
    })

    if (!run) {
      return new NextResponse("Run not found", { status: 404 })
    }

    return NextResponse.json(run)
  } catch (error) {
    console.error("[TASK_RUN_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 