import { useState, useRef, useEffect, ReactNode } from 'react'
import { useAppStore } from '../../stores'

export interface ResizablePanelProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
  defaultLeftWidth?: number // percentage (0-100)
  minLeftWidth?: number // percentage
  maxLeftWidth?: number // percentage
  storageKey?: string // key to persist the width
}

export function ResizablePanel({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 66.67, // 2/3 default
  minLeftWidth = 25,
  maxLeftWidth = 75,
  storageKey = 'resizable-panel-width'
}: ResizablePanelProps) {
  const { theme } = useAppStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Load saved width from localStorage or use default
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed) && parsed >= minLeftWidth && parsed <= maxLeftWidth) {
          return parsed
        }
      }
    }
    return defaultLeftWidth
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Clamp the width between min and max
    const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))
    setLeftWidth(clampedWidth)

    // Save to localStorage
    if (storageKey) {
      localStorage.setItem(storageKey, clampedWidth.toString())
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const rightWidth = 100 - leftWidth

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Left Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col overflow-hidden"
      >
        {leftPanel}
      </div>

      {/* Resizer Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          relative flex items-center justify-center
          w-1 cursor-col-resize group
          ${theme === 'dark' ? 'bg-gray-700 hover:bg-blue-600' : 'bg-gray-300 hover:bg-blue-500'}
          transition-colors duration-150
          ${isDragging ? (theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500') : ''}
        `}
      >
        {/* Visual indicator */}
        <div className={`
          absolute inset-y-0 left-1/2 -translate-x-1/2
          w-1 h-full
          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}
          transition-opacity duration-150
        `} />
        
        {/* Drag handle dots */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          flex flex-col gap-1 pointer-events-none
          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          transition-opacity duration-150
        `}>
          <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`} />
          <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`} />
          <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-600'}`} />
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{ width: `${rightWidth}%` }}
        className="flex flex-col overflow-hidden"
      >
        {rightPanel}
      </div>
    </div>
  )
}
