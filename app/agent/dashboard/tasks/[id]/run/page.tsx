"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Play, CheckCircle, AlertCircle, Layers, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Define types for logs and messages
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

interface Task {
  id: string;
  name: string;
  prompt: string;
  agentType: string;
  status: string;
  result: Record<string, unknown>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function TaskRunPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [runStatus, setRunStatus] = useState<string | null>(null)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Get the task ID from params
  const taskId = params?.id as string

  // Fetch task details
  useEffect(() => {
    if (!taskId) return
    
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`)
        if (!response.ok) throw new Error("Failed to fetch task")
        
        const data = await response.json()
        setTask(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching task:", error)
        toast.error("Failed to load task details")
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  // Handle starting a new run
  const startRun = async () => {
    if (!taskId) return
    
    try {
      setIsRunning(true)
      const response = await fetch(`/api/tasks/${taskId}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) throw new Error("Failed to start task run")
      
      const data = await response.json()
      setRunId(data.id)
      setRunStatus("in_progress")
      
      // Start polling for updates
      const interval = setInterval(pollRunStatus, 2000)
      setPollingInterval(interval)
      
      toast.success("Task run started successfully")
    } catch (error) {
      console.error("Error starting task run:", error)
      toast.error("Failed to start task run")
      setIsRunning(false)
    }
  }

  // Poll for run status updates
  const pollRunStatus = async () => {
    if (!runId || !taskId) return
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/runs/${runId}`)
      if (!response.ok) throw new Error("Failed to get run status")
      
      const data = await response.json()
      setRunStatus(data.status)
      
      // Parse logs to extract messages
      try {
        const logs = data.logs as unknown;
        if (Array.isArray(logs)) {
          const extractedMessages = logs
            .filter((log): log is AgentLogMessage => 
              typeof log === 'object' && 
              log !== null && 
              log.type === 'message' && 
              typeof log.content === 'string')
            .map(log => ({
              role: log.role,
              content: log.content
            }));
          setMessages(extractedMessages);
        }
      } catch (e) {
        console.error("Error parsing logs:", e);
      }
      
      // If the run is complete, stop polling
      if (data.status === "completed" || data.status === "failed") {
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
        setIsRunning(false)
        
        // Update task status if needed
        if (data.status === "completed") {
          toast.success("Task run completed successfully")
        } else if (data.status === "failed") {
          toast.error("Task run failed")
        }
      }
    } catch (error) {
      console.error("Error polling run status:", error)
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
      setIsRunning(false)
    }
  }

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // Navigate to run details when complete
  const viewRunDetails = () => {
    if (runId && taskId) {
      router.push(`/agent/dashboard/tasks/${taskId}/runs/${runId}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "pending":
        return <Play className="h-5 w-5 text-yellow-500" />
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-200">Task Not Found</h3>
          <p className="text-zinc-400 mt-2">The requested task could not be found.</p>
          <Link href="/agent/dashboard/tasks">
            <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Back to Tasks
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/agent/dashboard/tasks/${taskId}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
          
          {runStatus && (
            <div className="ml-4 flex items-center gap-2">
              {getStatusIcon(runStatus)}
              <span className={cn(
                "text-sm font-medium",
                runStatus === "completed" && "text-green-500",
                runStatus === "in_progress" && "text-blue-500",
                runStatus === "pending" && "text-yellow-500",
                runStatus === "failed" && "text-red-500"
              )}>
                {getStatusText(runStatus)}
              </span>
            </div>
          )}
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
                          message.role === "user" ? "bg-zinc-800 text-zinc-200" : "bg-zinc-800/50 text-zinc-300"
                        )}
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium text-zinc-500">
                            {message.role === "user" ? "You" : "Agent"}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Run Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!runId ? (
                  <Button 
                    className="w-full bg-white text-black hover:bg-white/90"
                    disabled={isRunning}
                    onClick={startRun}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Task
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled={isRunning}
                      onClick={viewRunDetails}
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      View Run Details
                    </Button>
                    
                    <Link href={`/agent/dashboard/tasks/${taskId}`} className="w-full block">
                      <Button 
                        variant="outline" 
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        Back to Task
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
            
            {runStatus === "in_progress" && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <p className="text-center text-zinc-400 mt-4">
                    The agent is processing your task. This may take a few minutes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 