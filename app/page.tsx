"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import ReportDisplay from "@/components/report-display"
import UserMenu from "@/components/user-menu"
import { toast } from "sonner"
// import { useToast } from "@/hooks/use-toast"
// import ReportDisplay from "@/components/report-display"
// import UserMenu from "@/components/user-menu"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<{ content: string; id: number } | null>(null)
  // const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast.error("Please enter a research topic")
      return
    }

    setLoading(true)
    setReport(null)

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to generate report")
      }

      const data = await res.json()
      setReport({
        content: data.report,
        id: data.reportId,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error generating report")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewQuery = () => {
    setReport(null)
    setQuery("")
  }

  return (
    <main className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Deep Research Agent</h1>
        <UserMenu />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Research Topic</CardTitle>
          <CardDescription>Enter a topic to generate a comprehensive research report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research topic..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Research Report: {query}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportDisplay content={report.content} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleNewQuery}>
              New Query
            </Button>
            <Button asChild>
              <a href={`/api/report/${report.id}/pdf`} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}

