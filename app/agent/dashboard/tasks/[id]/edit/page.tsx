"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function EditTaskPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [task, setTask] = useState<Task | null>(null)
  const [taskData, setTaskData] = useState({
    name: "",
    prompt: "",
    agentType: ""
  })

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
        setTaskData({
          name: data.name,
          prompt: data.prompt,
          agentType: data.agentType
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching task:", error)
        toast.error("Failed to load task details")
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value: string) => {
    setTaskData(prev => ({
      ...prev,
      agentType: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId) return
    
    setSaving(true)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      })

      if (!response.ok) throw new Error("Failed to update task")
      
      toast.success("Task updated successfully")
      router.push(`/agent/dashboard/tasks/${taskId}`)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
      setSaving(false)
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
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/agent/dashboard/tasks/${taskId}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-white">Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter task name"
                  value={taskData.name}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentType">Agent Type</Label>
                <Select 
                  value={taskData.agentType} 
                  onValueChange={handleSelectChange} 
                  required
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="research">Research Agent</SelectItem>
                    <SelectItem value="coding">Coding Agent</SelectItem>
                    <SelectItem value="data">Data Analysis Agent</SelectItem>
                    <SelectItem value="writing">Writing Agent</SelectItem>
                    <SelectItem value="custom">Custom Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Enter your task prompt"
                  value={taskData.prompt}
                  onChange={handleChange}
                  rows={8}
                  className="bg-zinc-800 border-zinc-700 text-white font-mono resize-none"
                  required
                />
                <p className="text-xs text-zinc-400">
                  Provide detailed instructions for the agent to follow.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link href={`/agent/dashboard/tasks/${taskId}`}>
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-white text-black hover:bg-white/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 