import { useState, useEffect } from 'react'

/**
 * Custom hook to calculate and update elapsed time since a given timestamp
 * @param startTime - The start timestamp (Date object)
 * @param updateInterval - Update interval in milliseconds (default: 1000ms)
 * @returns Formatted elapsed time string (e.g., "2m 30s", "1h 15m", "45s")
 */
export function useElapsedTime(startTime: Date | null, updateInterval: number = 1000): string {
  const [elapsedTime, setElapsedTime] = useState<string>('')

  useEffect(() => {
    if (!startTime) {
      setElapsedTime('')
      return
    }

    const calculateElapsed = () => {
      const now = new Date()
      const start = new Date(startTime)
      const diffMs = now.getTime() - start.getTime()
      const diffSeconds = Math.floor(diffMs / 1000)

      if (diffSeconds < 60) {
        return `${diffSeconds}s`
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60)
        const seconds = diffSeconds % 60
        return `${minutes}m ${seconds}s`
      } else {
        const hours = Math.floor(diffSeconds / 3600)
        const minutes = Math.floor((diffSeconds % 3600) / 60)
        return `${hours}h ${minutes}m`
      }
    }

    // Initial calculation
    setElapsedTime(calculateElapsed())

    // Set up interval for updates
    const intervalId = setInterval(() => {
      setElapsedTime(calculateElapsed())
    }, updateInterval)

    // Cleanup
    return () => clearInterval(intervalId)
  }, [startTime, updateInterval])

  return elapsedTime
}
