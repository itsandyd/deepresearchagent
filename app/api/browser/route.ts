import { type NextRequest, NextResponse } from "next/server"
import { BrowserUseTool } from "@/lib/tools/browser-use-tool"

// Create a singleton instance of the browser tool
let browserTool: BrowserUseTool | null = null

function getBrowserTool(): BrowserUseTool {
  if (!browserTool) {
    browserTool = new BrowserUseTool()
  }
  return browserTool
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, url, index, text, script, scroll_amount, tab_id } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    const tool = getBrowserTool()
    const result = await tool.execute({
      action,
      url,
      index,
      text,
      script,
      scroll_amount,
      tab_id,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error("Browser tool error:", error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tool = getBrowserTool()
    const state = await tool.getCurrentState()
    return NextResponse.json(state)
  } catch (error: unknown) {
    console.error("Browser tool error:", error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` }, 
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    if (browserTool) {
      await browserTool.cleanup()
      browserTool = null
    }
    return NextResponse.json({ output: "Browser resources cleaned up" })
  } catch (error: unknown) {
    console.error("Browser cleanup error:", error)
    return NextResponse.json(
      { error: `Cleanup error: ${error instanceof Error ? error.message : String(error)}` }, 
      { status: 500 }
    )
  }
}

