import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { currentUser } from "@clerk/nextjs/server"

const prisma = new PrismaClient()

// Tavily API endpoint and key
const TAVILY_URL = "https://api.tavily.com/search"
const TAVILY_KEY = process.env.TAVILY_API_KEY

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ message: "Missing or invalid topic in request body" }, { status: 400 })
    }

    // Get user ID from Clerk if authenticated
    const user = await currentUser()
    const userId = user?.id

    // 1. Generate a report outline using OpenAI
    const outlinePrompt = `You are a research assistant. Create a numbered list of 3-5 key sections for a comprehensive report on "${topic}". Only list section titles (no explanations). Exclude Introduction and Conclusion.`

    const outlineResponse = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: outlinePrompt,
      temperature: 0.7,
    })

    // Parse the outline into an array of section titles
    const sectionTitles = outlineResponse.text
      .split(/\n+/)
      .map((line) => line.replace(/^\d+[).\s]*/, "").trim())
      .filter((title) => title.length > 0)

    // 2. For each section, use Tavily to search for relevant info and then use OpenAI to write that section
    const sections = []

    for (const title of sectionTitles) {
      // Tavily search for this section
      const searchQuery = `${topic} ${title}`
      const tavilyRes = await fetch(TAVILY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TAVILY_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          max_results: 5,
          search_depth: "basic",
        }),
      })

      if (!tavilyRes.ok) {
        throw new Error(`Tavily search failed: ${tavilyRes.status}`)
      }

      const tavilyData = await tavilyRes.json()
      const { answer: searchSummary, results } = tavilyData

      // Prepare context for the section
      let contextText = searchSummary
      if (!contextText && results?.length) {
        // Fallback: use concatenation of top results content
        contextText = results
          .slice(0, 3)
          .map((r: { content: string }) => r.content)
          .join("\n")
      }

      // OpenAI to write the section content using the context
      const sectionPrompt =
        `Write a detailed section for a research report on "${topic}".\n` +
        `Section Title: "${title}"\n` +
        `Use the following information in the section:\n${contextText}\n` +
        `The section should be informative and well-structured.`

      const sectionRes = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt: sectionPrompt,
        temperature: 0.7,
      })

      sections.push({ title, content: sectionRes.text.trim() })
    }

    // 3. Generate Introduction and Conclusion using OpenAI
    const introRes = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Write a concise Introduction for a report about "${topic}".`,
      temperature: 0.7,
    })

    const introduction = introRes.text.trim()

    const conclusionRes = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Write a strong Conclusion for a report about "${topic}", summarizing the key findings.`,
      temperature: 0.7,
    })

    const conclusion = conclusionRes.text.trim()

    // 4. Compile the final report (markdown format)
    let fullReport = `# ${topic}\n\n`
    fullReport += `## Introduction\n${introduction}\n\n`

    for (const sec of sections) {
      fullReport += `## ${sec.title}\n${sec.content}\n\n`
    }

    fullReport += `## Conclusion\n${conclusion}\n`

    // 5. Save the report to the database
    const savedReport = await prisma.report.create({
      data: {
        query: topic,
        content: fullReport,
        userId: userId || null,
      },
    })

    // 6. Return the report content and its ID
    return NextResponse.json({
      reportId: savedReport.id,
      report: fullReport,
    })
  } catch (err: unknown) {
    console.error("Error generating report:", err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ message: `Failed to generate report: ${errorMessage}` }, { status: 500 })
  }
}

