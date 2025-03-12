import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface TaskPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Await params before accessing its properties
  const paramsData = await params
  const taskId = paramsData.id

  // Fetch the specific task
  const task = await db.task.findUnique({
    where: {
      id: taskId,
      userId, // Ensure the task belongs to the current user
    },
  })

  if (!task) {
    notFound()
  }

  // Fetch related agent runs for this task
  const agentRuns = await db.agentRun.findMany({
    where: {
      taskId: task.id,
    },
    orderBy: {
      startedAt: 'desc',
    },
  })

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

  const formatDate = (dateString: Date) => {
    return dateString.toLocaleDateString("en-US", {
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
        <div className="flex items-center mb-8">
          <Link href="/agent/dashboard/tasks">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
          <div className="ml-4 flex items-center gap-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Agent Type</h3>
                  <p className="mt-1">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs">
                      {task.agentType}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Prompt</h3>
                  <p className="mt-1 text-zinc-200 whitespace-pre-wrap">{task.prompt}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Created At</h3>
                  <p className="mt-1 text-zinc-300 flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-zinc-500" />
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {task.result && Object.keys(task.result).length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800 p-4 rounded-md">
                    {JSON.stringify(task.result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/agent/dashboard/tasks/${task.id}/run`} className="w-full block">
                  <Button className="w-full bg-white text-black hover:bg-white/90">
                    Run Agent
                  </Button>
                </Link>
                <Link href={`/agent/dashboard/tasks/${task.id}/edit`} className="w-full block">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    Edit Task
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {agentRuns.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recent Runs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agentRuns.slice(0, 5).map((run) => (
                    <Link key={run.id} href={`/agent/dashboard/tasks/${task.id}/runs/${run.id}`}>
                      <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-800/80 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getStatusIcon(run.status)}
                            <span className="ml-2 text-sm text-zinc-300">
                              {getStatusText(run.status)}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {formatDate(run.startedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 