"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Globe, Layers } from "lucide-react"

interface BrowserState {
  url: string
  title: string
  tabs: {
    id: number
    url: string
    title: string
  }[]
  interactive_elements: string
}

interface BrowserAction {
  action: string;
  url?: string;
  index?: number;
  text?: string;
  script?: string;
  scroll_amount?: number;
  tab_id?: number;
}

export default function BrowserToolPage() {
  const [action, setAction] = useState<string>("navigate")
  const [url, setUrl] = useState<string>("https://www.google.com")
  const [index, setIndex] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [script, setScript] = useState<string>("")
  const [scrollAmount, setScrollAmount] = useState<string>("300")
  const [tabId, setTabId] = useState<string>("0")

  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [browserState, setBrowserState] = useState<BrowserState | null>(null)

  const fetchBrowserState = async () => {
    try {
      const response = await fetch("/api/browser")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.output) {
        try {
          const state = JSON.parse(data.output)
          setBrowserState(state)
        } catch (e) {
          console.error("Failed to parse browser state:", e)
        }
      }
    } catch (e) {
      console.error("Error fetching browser state:", e)
    }
  }

  const executeAction = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      const payload: BrowserAction = { action }

      if (action === "navigate" || action === "new_tab") {
        payload.url = url
      }

      if (action === "click" || action === "input_text") {
        payload.index = Number.parseInt(index)
      }

      if (action === "input_text") {
        payload.text = text
      }

      if (action === "execute_js") {
        payload.script = script
      }

      if (action === "scroll") {
        payload.scroll_amount = Number.parseInt(scrollAmount)
      }

      if (action === "switch_tab") {
        payload.tab_id = Number.parseInt(tabId)
      }

      const response = await fetch("/api/browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.output) {
        setResult(data.output)
      }

      // Refresh browser state after action
      await fetchBrowserState()
    } catch (e: unknown) {
      setError(`Request failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  const cleanupBrowser = async () => {
    setLoading(true)
    try {
      await fetch("/api/browser", {
        method: "DELETE",
      })
      setBrowserState(null)
      setResult("Browser resources cleaned up")
    } catch (e: unknown) {
      setError(`Cleanup failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrowserState()
  }, [])

  return (
    <main className="flex-1 flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Browser Tool</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 pb-3">
              <CardTitle className="text-xl text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-zinc-400" />
                Browser Actions
              </CardTitle>
              <CardDescription className="text-zinc-400">Control the browser with various actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="action" className="text-zinc-300">Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="navigate">Navigate</SelectItem>
                    <SelectItem value="click">Click</SelectItem>
                    <SelectItem value="input_text">Input Text</SelectItem>
                    <SelectItem value="screenshot">Screenshot</SelectItem>
                    <SelectItem value="get_html">Get HTML</SelectItem>
                    <SelectItem value="get_text">Get Text</SelectItem>
                    <SelectItem value="read_links">Read Links</SelectItem>
                    <SelectItem value="execute_js">Execute JavaScript</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="switch_tab">Switch Tab</SelectItem>
                    <SelectItem value="new_tab">New Tab</SelectItem>
                    <SelectItem value="close_tab">Close Tab</SelectItem>
                    <SelectItem value="refresh">Refresh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(action === "navigate" || action === "new_tab") && (
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-zinc-300">URL</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}

              {(action === "click" || action === "input_text") && (
                <div className="space-y-2">
                  <Label htmlFor="index" className="text-zinc-300">Element Index</Label>
                  <Input
                    id="index"
                    type="number"
                    value={index}
                    onChange={(e) => setIndex(e.target.value)}
                    placeholder="0"
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}

              {action === "input_text" && (
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-zinc-300">Text</Label>
                  <Input 
                    id="text" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="Text to input" 
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}

              {action === "execute_js" && (
                <div className="space-y-2">
                  <Label htmlFor="script" className="text-zinc-300">JavaScript</Label>
                  <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="document.title"
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}

              {action === "scroll" && (
                <div className="space-y-2">
                  <Label htmlFor="scrollAmount" className="text-zinc-300">Scroll Amount (px)</Label>
                  <Input
                    id="scrollAmount"
                    type="number"
                    value={scrollAmount}
                    onChange={(e) => setScrollAmount(e.target.value)}
                    placeholder="300"
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}

              {action === "switch_tab" && (
                <div className="space-y-2">
                  <Label htmlFor="tabId" className="text-zinc-300">Tab ID</Label>
                  <Input
                    id="tabId"
                    type="number"
                    value={tabId}
                    onChange={(e) => setTabId(e.target.value)}
                    placeholder="0"
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-zinc-800 bg-zinc-950/50 p-4">
              <Button 
                variant="outline" 
                onClick={cleanupBrowser} 
                disabled={loading}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cleanup Browser
              </Button>
              <Button 
                onClick={executeAction} 
                disabled={loading}
                className="bg-white text-black hover:bg-white/90 ml-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  "Execute Action"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-none rounded-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 pb-3">
              <CardTitle className="text-xl text-white flex items-center">
                <Layers className="w-5 h-5 mr-2 text-zinc-400" />
                Browser State
              </CardTitle>
              <CardDescription className="text-zinc-400">Current browser information and results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5 min-h-[300px]">
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-900/50 text-red-200 rounded-md">
                  <p className="font-medium text-red-200">Error</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-green-900/30 border border-green-900/50 text-green-200 rounded-md">
                  <p className="font-medium text-green-200">Result</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{result}</p>
                </div>
              )}

              {browserState && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium text-zinc-300 mb-1">Current Page</h3>
                    <p className="text-zinc-400">{browserState.title || "No title"}</p>
                    <p className="text-zinc-500 text-sm truncate">{browserState.url}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-zinc-300 mb-2">Tabs</h3>
                    <div className="space-y-2">
                      {browserState.tabs.map((tab) => (
                        <div key={tab.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded-md">
                          <p className="flex items-center">
                            <span className="font-medium text-zinc-300 mr-1">Tab {tab.id}:</span> 
                            <span className="text-zinc-400">{tab.title || "No title"}</span>
                          </p>
                          <p className="text-xs text-zinc-500 truncate mt-1">{tab.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-zinc-300 mb-2">Interactive Elements</h3>
                    <pre className="text-xs p-3 bg-zinc-800 border border-zinc-700 rounded-md overflow-auto max-h-[200px] text-zinc-400">
                      {browserState.interactive_elements || "No interactive elements found"}
                    </pre>
                  </div>
                </div>
              )}

              {!browserState && !error && !result && (
                <div className="flex items-center justify-center h-[200px] text-zinc-500">
                  <p>No browser state available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

