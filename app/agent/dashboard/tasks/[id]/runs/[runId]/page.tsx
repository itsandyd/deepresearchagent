import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

// Define interfaces for type safety
interface AgentLogMessage {
  type: 'message';
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: string;
}

interface AgentMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface RunPageProps {
  params: Promise<{
    id: string
    runId: string
  }>
}

export default async function RunPage({ params }: RunPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Await params before accessing its properties
  const paramsData = await params
  const taskId = paramsData.id
  const runId = paramsData.runId

  // Fetch the task
  const task = await db.task.findUnique({
    where: {
      id: taskId,
      userId,
    },
  })

  if (!task) {
    notFound()
  }

  // Fetch the specific run
  const run = await db.agentRun.findUnique({
    where: {
      id: runId,
      taskId: taskId,
    },
  })

  if (!run) {
    notFound()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
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
      case "failed":
        return "Failed"
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

  const getDuration = () => {
    if (!run.startedAt) return "N/A"
    
    const start = new Date(run.startedAt)
    const end = run.endedAt ? new Date(run.endedAt) : new Date()
    
    const durationMs = end.getTime() - start.getTime()
    const seconds = Math.floor(durationMs / 1000)
    
    if (seconds < 60) {
      return `${seconds} seconds`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes} min ${remainingSeconds} sec`
  }

  // Parse logs to extract messages
  const messages: AgentMessage[] = (() => {
    try {
      const logs = run.logs as unknown;
      if (Array.isArray(logs)) {
        return logs
          .filter((log): log is AgentLogMessage => 
            typeof log === 'object' && 
            log !== null && 
            log.type === 'message' && 
            typeof log.content === 'string')
          .map(log => ({
            role: log.role,
            content: log.content
          }));
      }
      return [];
    } catch (e) {
      console.error("Error parsing logs:", e);
      return [];
    }
  })();

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/agent/dashboard/tasks/${taskId}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Run Details</h1>
          <div className="ml-4 flex items-center gap-2">
            {getStatusIcon(run.status)}
            <span className={cn(
              "text-sm font-medium",
              run.status === "completed" && "text-green-500",
              run.status === "in_progress" && "text-blue-500",
              run.status === "pending" && "text-yellow-500",
              run.status === "failed" && "text-red-500"
            )}>
              {getStatusText(run.status)}
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
                  <h3 className="text-sm font-medium text-zinc-400">Task Name</h3>
                  <p className="mt-1 text-zinc-200">{task.name}</p>
                </div>
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
              </CardContent>
            </Card>

            {messages.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-white">Agent Messages</CardTitle>
                  <MessageSquare className="h-5 w-5 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-3 rounded-lg",
                          message.role === "user" ? "bg-zinc-800 text-zinc-200" : 
                          message.role === "system" ? "bg-zinc-700/50 text-zinc-400" : 
                          "bg-zinc-800/50 text-zinc-300"
                        )}
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium text-zinc-500">
                            {message.role === "user" ? "You" : 
                             message.role === "system" ? "System" : "Agent"}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {run.output && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800 p-4 rounded-md">
                    {JSON.stringify(run.output, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Run Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Started At</h3>
                  <p className="mt-1 text-zinc-300 flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-zinc-500" />
                    {run.startedAt ? formatDate(run.startedAt) : "N/A"}
                  </p>
                </div>
                
                {run.endedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400">Completed At</h3>
                    <p className="mt-1 text-zinc-300 flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-zinc-500" />
                      {formatDate(run.endedAt)}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Duration</h3>
                  <p className="mt-1 text-zinc-300">
                    {getDuration()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                  <p className="mt-1 flex items-center">
                    {getStatusIcon(run.status)}
                    <span className={cn(
                      "ml-2",
                      run.status === "completed" && "text-green-500",
                      run.status === "in_progress" && "text-blue-500",
                      run.status === "pending" && "text-yellow-500",
                      run.status === "failed" && "text-red-500"
                    )}>
                      {getStatusText(run.status)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/agent/dashboard/tasks/${taskId}`} className="w-full block">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    Back to Task
                  </Button>
                </Link>
                
                {run.status === "completed" && (
                  <Link href={`/agent/dashboard/tasks/${taskId}/run`} className="w-full block">
                    <Button className="w-full bg-white text-black hover:bg-white/90">
                      Run Again
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 