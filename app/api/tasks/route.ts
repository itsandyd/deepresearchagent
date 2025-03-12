import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const body = await req.json()
    const { name, prompt, agentType } = body
    
    if (!name || !prompt || !agentType) {
      return new NextResponse("Missing required fields", { status: 400 })
    }
    
    const task = await db.task.create({
      data: {
        name,
        prompt,
        agentType,
        status: "pending", // Default status
        userId,
      }
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const tasks = await db.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

