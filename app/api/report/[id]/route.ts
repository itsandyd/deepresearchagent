import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { isUserAdmin } from "@/lib/clerk"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const paramsData = await params
    const reportId = Number.parseInt(paramsData.id, 10)

    if (isNaN(reportId)) {
      return NextResponse.json({ message: "Invalid report ID" }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ message: "Failed to fetch report" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin()

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const paramsData = await params
    const reportId = Number.parseInt(paramsData.id, 10)

    if (isNaN(reportId)) {
      return NextResponse.json({ message: "Invalid report ID" }, { status: 400 })
    }

    await prisma.report.delete({
      where: { id: reportId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json({ message: "Failed to delete report" }, { status: 500 })
  }
}

