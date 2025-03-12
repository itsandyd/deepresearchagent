import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Task Details: {params.id}</h1>
          <Link href="/agent/dashboard/tasks">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
              Back to Tasks
            </Button>
          </Link>
        </div>
        
        <div className="bg-zinc-900 border-zinc-800 rounded-xl p-8">
          <p className="text-zinc-400 mb-4">
            Debug info: This task detail page should show the navbar if layouts are working correctly.
          </p>
        </div>
      </div>
    </div>
  )
} 