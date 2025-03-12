"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function NewTaskPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [taskData, setTaskData] = useState({
    name: "",
    prompt: "",
    agentType: "researcher",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setTaskData((prev) => ({ ...prev, agentType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      toast.success("Task created successfully");
      
      // Redirect to the tasks page after successful creation
      router.push("/agent/dashboard/tasks")
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Task</h1>
      </div>

      <Card className="shadow-lg border-opacity-50">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Task Details</CardTitle>
            <CardDescription className="text-base mt-2">
              Configure your AI agent task with the necessary details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-medium">
                Task Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Research on renewable energy"
                value={taskData.name}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="agentType" className="text-base font-medium">
                Agent Type
              </Label>
              <Select value={taskData.agentType} onValueChange={handleSelectChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="writer">Content Writer</SelectItem>
                  <SelectItem value="analyzer">Data Analyzer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose the type of agent that best fits your task requirements.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-base font-medium">
                Task Prompt
              </Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="Describe what you want the AI agent to do..."
                rows={6}
                value={taskData.prompt}
                onChange={handleChange}
                required
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Be specific about what you want the agent to research or analyze.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 pt-4 pb-6 px-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

