export class Lock {
    private locked = false
    private queue: Array<() => void> = []
  
    async withLock<T>(fn: () => Promise<T>): Promise<T> {
      // Wait for lock to be available
      if (this.locked) {
        await new Promise<void>((resolve) => {
          this.queue.push(resolve)
        })
      }
  
      // Acquire lock
      this.locked = true
  
      try {
        // Execute critical section
        return await fn()
      } finally {
        // Release lock
        this.locked = false
  
        // Notify next waiter
        if (this.queue.length > 0) {
          const next = this.queue.shift()
          if (next) next()
        }
      }
    }
  }
  
  