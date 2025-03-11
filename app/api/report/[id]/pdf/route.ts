import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { jsPDF } from "jspdf"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  try {
    // Need to properly await the params in Next.js App Router
    const params = await context.params
    const reportId = Number.parseInt(params.id, 10)

    if (isNaN(reportId)) {
      return NextResponse.json({ message: "Invalid report ID" }, { status: 400 })
    }

    // Fetch the report from the database
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 })
    }

    // Create PDF using jsPDF (works better in serverless environments)
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text(`Research Report: ${report.query}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' })
    
    // Content formatting
    doc.setFontSize(12)
    
    // Split content into lines that fit the page width
    const splitText = doc.splitTextToSize(
      report.content, 
      doc.internal.pageSize.getWidth() - 20
    )
    
    // Handle pagination for long content
    let y = 40; // Starting y position
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 7; // Approximate height of each line
    
    // Add each line with pagination
    for (let i = 0; i < splitText.length; i++) {
      // Check if we need to move to a new page
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20; // Reset y position on new page
      }
      
      // Add the line of text
      doc.text(splitText[i], 10, y);
      y += lineHeight;
    }
    
    // Get the PDF as a Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Create response with appropriate headers
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${reportId}.pdf"`,
      },
    })

    return response
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 })
  }
}

