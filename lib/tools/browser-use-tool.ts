import type { Browser, BrowserContext, Page, ElementHandle } from "playwright"
import * as playwright from "playwright-core"
import { Lock } from "./lock"


export interface ToolResult {
  output?: string
  error?: string
  system?: string
}

export interface BrowserState {
  url: string
  title: string
  tabs: {
    id: number
    url: string
    title: string
  }[]
  interactive_elements: string
}

export class BrowserUseTool {
  name = "browser_use"
  description = `
Interact with a web browser to perform various actions such as navigation, element interaction,
content extraction, and tab management. Supported actions include:
- 'navigate': Go to a specific URL
- 'click': Click an element by index
- 'input_text': Input text into an element
- 'screenshot': Capture a screenshot
- 'get_html': Get page HTML content
- 'get_text': Get text content of the page
- 'read_links': Get all links on the page
- 'execute_js': Execute JavaScript code
- 'scroll': Scroll the page
- 'switch_tab': Switch to a specific tab
- 'new_tab': Open a new tab
- 'close_tab': Close the current tab
- 'refresh': Refresh the current page
`

  parameters = {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: [
          "navigate",
          "click",
          "input_text",
          "screenshot",
          "get_html",
          "get_text",
          "execute_js",
          "scroll",
          "switch_tab",
          "new_tab",
          "close_tab",
          "refresh",
        ],
        description: "The browser action to perform",
      },
      url: {
        type: "string",
        description: "URL for 'navigate' or 'new_tab' actions",
      },
      index: {
        type: "integer",
        description: "Element index for 'click' or 'input_text' actions",
      },
      text: {
        type: "string",
        description: "Text for 'input_text' action",
      },
      script: {
        type: "string",
        description: "JavaScript code for 'execute_js' action",
      },
      scroll_amount: {
        type: "integer",
        description: "Pixels to scroll (positive for down, negative for up) for 'scroll' action",
      },
      tab_id: {
        type: "integer",
        description: "Tab ID for 'switch_tab' action",
      },
    },
    required: ["action"],
  }

  private lock: Lock = new Lock()
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private pages: Page[] = []
  private currentPageIndex = 0

  private async ensureBrowserInitialized(): Promise<BrowserContext> {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: false,
      })
    }

    if (!this.context) {
      this.context = await this.browser.newContext()
      const page = await this.context.newPage()
      this.pages.push(page)
    }

    return this.context
  }

  private getCurrentPage(): Page {
    if (this.pages.length === 0) {
      throw new Error("No browser pages available")
    }
    return this.pages[this.currentPageIndex]
  }

  private async getElementByIndex(index: number): Promise<ElementHandle<Element>> {
    const page = this.getCurrentPage()

    // First, get all interactive elements
    const elements = await page.$$('a, button, input, textarea, select, [role="button"]')

    if (index < 0 || index >= elements.length) {
      throw new Error(`Element with index ${index} not found. Available elements: ${elements.length}`)
    }

    return elements[index]
  }

  async execute(params: {
    action: string
    url?: string
    index?: number
    text?: string
    script?: string
    scroll_amount?: number
    tab_id?: number
  }): Promise<ToolResult> {
    return this.lock.withLock(async () => {
      try {
        const { action, url, index, text, script, scroll_amount, tab_id } = params
        await this.ensureBrowserInitialized()
        const page = this.getCurrentPage()

        switch (action) {
          case "navigate":
            if (!url) {
              return { error: "URL is required for 'navigate' action" }
            }
            await page.goto(url)
            return { output: `Navigated to ${url}` }

          case "click":
            if (index === undefined) {
              return { error: "Index is required for 'click' action" }
            }

            try {
              const element = await this.getElementByIndex(index)
              await element.click()
              return { output: `Clicked element at index ${index}` }
            } catch (e: unknown) {
              return { error: `Element with index ${index} not found or not clickable: ${e instanceof Error ? e.message : String(e)}` }
            }

          case "input_text":
            if (index === undefined || !text) {
              return { error: "Index and text are required for 'input_text' action" }
            }

            try {
              const element = await this.getElementByIndex(index)
              await element.fill(text)
              return { output: `Input '${text}' into element at index ${index}` }
            } catch (e: unknown) {
              return { error: `Failed to input text: ${e instanceof Error ? e.message : String(e)}` }
            }

          case "screenshot":
            const screenshot = await page.screenshot({ fullPage: true })
            const base64Screenshot = screenshot.toString("base64")
            return {
              output: `Screenshot captured (base64 length: ${base64Screenshot.length})`,
              system: base64Screenshot,
            }

          case "get_html":
            const html = await page.content()
            const truncated = html.length > 2000 ? html.substring(0, 2000) + "..." : html
            return { output: truncated }

          case "get_text":
            const bodyText = await page.evaluate(() => document.body.innerText)
            return { output: bodyText }

          case "read_links":
            const links = await page.evaluate(() => {
              const linkElements = document.querySelectorAll("a[href]")
              return Array.from(linkElements)
                .filter((el) => (el as HTMLElement).innerText)
                .map((el) => `${(el as HTMLElement).innerText.trim()} - ${el.getAttribute("href")}`)
                .join("\n")
            })
            return { output: links }

          case "execute_js":
            if (!script) {
              return { error: "Script is required for 'execute_js' action" }
            }
            const result = await page.evaluate(script)
            return { output: String(result) }

          case "scroll":
            if (scroll_amount === undefined) {
              return { error: "Scroll amount is required for 'scroll' action" }
            }
            await page.evaluate((amount) => {
              window.scrollBy(0, amount)
            }, scroll_amount)

            const direction = scroll_amount > 0 ? "down" : "up"
            return { output: `Scrolled ${direction} by ${Math.abs(scroll_amount)} pixels` }

          case "switch_tab":
            if (tab_id === undefined) {
              return { error: "Tab ID is required for 'switch_tab' action" }
            }

            if (tab_id < 0 || tab_id >= this.pages.length) {
              return { error: `Tab ID ${tab_id} is out of range. Available tabs: ${this.pages.length}` }
            }

            this.currentPageIndex = tab_id
            return { output: `Switched to tab ${tab_id}` }

          case "new_tab":
            if (!url) {
              return { error: "URL is required for 'new_tab' action" }
            }

            if (!this.context) {
              return { error: "Browser context not initialized" }
            }

            const newPage = await this.context.newPage()
            await newPage.goto(url)
            this.pages.push(newPage)
            this.currentPageIndex = this.pages.length - 1
            return { output: `Opened new tab with URL ${url}` }

          case "close_tab":
            if (this.pages.length <= 1) {
              return { error: "Cannot close the last tab" }
            }

            await this.pages[this.currentPageIndex].close()
            this.pages.splice(this.currentPageIndex, 1)

            // Adjust current page index if needed
            if (this.currentPageIndex >= this.pages.length) {
              this.currentPageIndex = this.pages.length - 1
            }

            return { output: "Closed current tab" }

          case "refresh":
            await page.reload()
            return { output: "Refreshed current page" }

          default:
            return { error: `Unknown action: ${action}` }
        }
      } catch (e: unknown) {
        return { error: `Browser action failed: ${e instanceof Error ? e.message : String(e)}` }
      }
    })
  }

  async getCurrentState(): Promise<ToolResult> {
    return this.lock.withLock(async () => {
      try {
        await this.ensureBrowserInitialized()
        const page = this.getCurrentPage()

        const url = page.url()
        const title = await page.title()

        const tabs = await Promise.all(
          this.pages.map(async (p, index) => {
            return {
              id: index,
              url: p.url(),
              title: await p.title(),
            }
          }),
        )

        const interactiveElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('a, button, input, textarea, select, [role="button"]')
          return Array.from(elements)
            .map((el, index) => {
              const tagName = el.tagName.toLowerCase()
              const text = el.textContent?.trim() || ""
              const type = el.getAttribute("type") || ""
              const placeholder = el.getAttribute("placeholder") || ""
              const href = el.getAttribute("href") || ""

              let description = `[${index}] <${tagName}>`
              if (text) description += ` "${text}"`
              if (type) description += ` type="${type}"`
              if (placeholder) description += ` placeholder="${placeholder}"`
              if (href) description += ` href="${href}"`

              return description
            })
            .join("\n")
        })

        const state: BrowserState = {
          url,
          title,
          tabs,
          interactive_elements: interactiveElements,
        }

        return { output: JSON.stringify(state) }
      } catch (e: unknown) {
        return { error: `Failed to get browser state: ${e instanceof Error ? e.message : String(e)}` }
      }
    })
  }

  async cleanup(): Promise<void> {
    return this.lock.withLock(async () => {
      if (this.context) {
        await this.context.close()
        this.context = null
        this.pages = []
      }

      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    })
  }
}

