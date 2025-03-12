import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// This would normally be fetched from your database
const mockTasks = [
  {
    id: "1",
    name: "Research competitor products",
    status: "completed",
    createdAt: "2023-08-15T10:30:00Z",
    agentType: "researcher",
  },
  {
    id: "2",
    name: "Generate marketing copy for new feature",
    status: "in_progress",
    createdAt: "2023-08-14T15:45:00Z",
    agentType: "writer",
  },
  {
    id: "3",
    name: "Analyze customer feedback",
    status: "pending",
    createdAt: "2023-08-12T09:15:00Z",
    agentType: "analyzer",
  },
]

export default function TasksPage() {
  // In a real implementation, you would fetch tasks from your database
  const tasks = mockTasks

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <Link href="/agent/dashboard/tasks/new">
            <Button className="rounded-full bg-white text-black hover:bg-white/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
              <p className="text-zinc-400 mb-4">No tasks found</p>
              <Link href="/agent/dashboard/tasks/new">
                <Button className="bg-white text-black hover:bg-white/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Task
                </Button>
              </Link>
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">{task.name}</h2>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={cn(
                        "text-sm font-medium",
                        task.status === "completed" && "text-green-500",
                        task.status === "in_progress" && "text-blue-500",
                        task.status === "pending" && "text-yellow-500"
                      )}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                    <div className="mb-2 sm:mb-0">
                      <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                        {task.agentType}
                      </span>
                    </div>
                    <div className="flex items-center text-zinc-500">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDate(task.createdAt)}
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    <Link href={`/agent/dashboard/tasks/${task.id}`}>
                      <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/agent/dashboard/tasks/${task.id}/run`}>
                      <Button size="sm" className="bg-white text-black hover:bg-white/90">
                        Run Agent
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

