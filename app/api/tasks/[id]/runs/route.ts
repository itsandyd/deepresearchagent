import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// POST - create a new run for a task
export async function POST(
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
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Create a new agent run
    const run = await db.agentRun.create({
      data: {
        taskId: task.id,
        status: "in_progress",
        logs: [
          {
            type: "message",
            role: "system",
            content: "Agent initialized and ready to process your task.",
            timestamp: new Date().toISOString()
          },
          {
            type: "message",
            role: "user",
            content: task.prompt,
            timestamp: new Date().toISOString()
          }
        ],
        startedAt: new Date(),
      },
    })

    // Update the task status
    await db.task.update({
      where: {
        id: task.id,
      },
      data: {
        status: "in_progress",
      },
    })

    // Here you would typically start the actual agent process
    // For now, we'll simulate it with a delayed status update
    // In a real implementation, you would queue this task for processing
    
    // This is a simplified example - in production, use a proper job queue
    simulateAgentProcessing(run.id, task.id)
    
    return NextResponse.json(run)
  } catch (error) {
    console.error("[TASK_RUN_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// GET - retrieve all runs for a task
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

    // Get all runs for this task
    const runs = await db.agentRun.findMany({
      where: {
        taskId: task.id,
      },
      orderBy: {
        startedAt: "desc",
      },
    })

    return NextResponse.json(runs)
  } catch (error) {
    console.error("[TASK_RUNS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Helper function to simulate agent processing (for demo purposes)
// In a real app, this would be handled by a background job processor
async function simulateAgentProcessing(runId: string, taskId: string) {
  try {
    // Wait 5-10 seconds to simulate processing
    const delay = Math.floor(Math.random() * 5000) + 5000
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Add some simulated agent logs
    await db.agentRun.update({
      where: { id: runId },
      data: {
        logs: {
          push: {
            type: "message",
            role: "assistant",
            content: "I'm analyzing your request and gathering information...",
            timestamp: new Date().toISOString()
          }
        },
      },
    })
    
    // Wait another 5-10 seconds
    const delay2 = Math.floor(Math.random() * 5000) + 5000
    await new Promise(resolve => setTimeout(resolve, delay2))
    
    // Add more logs
    await db.agentRun.update({
      where: { id: runId },
      data: {
        logs: {
          push: {
            type: "message",
            role: "assistant",
            content: "I've completed the task. Here are my findings...",
            timestamp: new Date().toISOString()
          }
        },
      },
    })
    
    // Complete the run
    await db.agentRun.update({
      where: { id: runId },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    })
    
    // Update the task with results
    await db.task.update({
      where: { id: taskId },
      data: {
        status: "completed",
        result: {
          summary: "Task completed successfully",
          details: "This is a simulated result that would contain the agent's findings.",
          timestamp: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("[SIMULATE_AGENT_PROCESSING]", error)
    
    // If there's an error, mark the run as failed
    await db.agentRun.update({
      where: { id: runId },
      data: {
        status: "failed",
        endedAt: new Date(),
        logs: {
          push: {
            type: "message",
            role: "system",
            content: "An error occurred while processing this task.",
            timestamp: new Date().toISOString()
          }
        },
      },
    })
    
    // Update task status
    await db.task.update({
      where: { id: taskId },
      data: {
        status: "failed",
      },
    })
  }
} 