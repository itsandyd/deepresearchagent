import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Clock, CircleIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  // In a real implementation, you would fetch tasks from your database
  const recentTasks = [
    { id: "1", name: "Research competitor products", status: "completed", createdAt: "2 hours ago" },
    { id: "2", name: "Generate marketing copy for new feature", status: "in_progress", createdAt: "1 day ago" },
    { id: "3", name: "Analyze customer feedback", status: "pending", createdAt: "3 days ago" },
  ]

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/agent/dashboard/tasks/new">
            <Button className="rounded-full bg-white text-black hover:bg-white/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 w-full max-w-6xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white">Recent Tasks</CardTitle>
              <CardDescription className="text-zinc-400">Your recently created AI agent tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mt-2">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center py-3 group hover:bg-zinc-800/50 px-2 rounded-lg transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-3", 
                      getStatusColor(task.status),
                      task.status === "in_progress" && "animate-pulse"
                    )} />
                    <div className="flex-1">
                      <div className="font-medium text-white">{task.name}</div>
                    </div>
                    <div className="flex items-center text-xs text-zinc-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {task.createdAt}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/agent/dashboard/tasks" className="mt-6 block">
                <Button variant="outline" size="sm" className="w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                  View All Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
              <CardDescription className="text-zinc-400">Common agent operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <Link href="/agent/dashboard/tasks/new?type=research" className="w-full block">
                <Button variant="outline" className="w-full justify-start h-10 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400">
                  <CircleIcon className="mr-2 h-4 w-4" />
                  Create Web Research Task
                </Button>
              </Link>
              <Link href="/agent/dashboard/tasks/new?type=writer" className="w-full block">
                <Button variant="outline" className="w-full justify-start h-10 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400">
                  <CircleIcon className="mr-2 h-4 w-4" />
                  Generate Content
                </Button>
              </Link>
              <Link href="/agent/dashboard/tasks/new?type=analyzer" className="w-full block">
                <Button variant="outline" className="w-full justify-start h-10 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400">
                  <CircleIcon className="mr-2 h-4 w-4" />
                  Analyze Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

