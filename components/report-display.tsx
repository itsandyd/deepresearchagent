"use client"

interface ReportDisplayProps {
  content: string
}

export default function ReportDisplay({ content }: ReportDisplayProps) {
  // Simple markdown-like rendering
  const lines = content.split("\n")

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {lines.map((line, idx) => {
        // Handle headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">
              {line.replace(/^# /, "")}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-xl font-bold mt-5 mb-3">
              {line.replace(/^## /, "")}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-lg font-bold mt-4 mb-2">
              {line.replace(/^### /, "")}
            </h3>
          )
        }

        // Handle empty lines as paragraph breaks
        if (line.trim() === "") {
          return <div key={idx} className="my-2"></div>
        }

        // Regular paragraph
        return (
          <p key={idx} className="my-2">
            {line}
          </p>
        )
      })}
    </article>
  )
}
