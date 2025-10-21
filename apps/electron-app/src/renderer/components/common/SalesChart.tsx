import { useMemo } from 'react'
import { useAppStore } from '../../stores'

export interface ChartDataPoint {
  label: string
  value: number
  timestamp?: Date
}

interface SalesChartProps {
  data: ChartDataPoint[]
  title: string
  type?: 'line' | 'bar'
  height?: number
  showGrid?: boolean
  color?: string
  formatValue?: (value: number) => string
}

export function SalesChart({
  data,
  title,
  type = 'line',
  height = 300,
  showGrid = true,
  color = '#3B82F6',
  formatValue = (v) => v.toLocaleString()
}: SalesChartProps) {
  const { theme } = useAppStore()

  const { maxValue, points, gridLines } = useMemo(() => {
    if (data.length === 0) {
      return { maxValue: 100, points: [], gridLines: [] }
    }

    const values = data.map(d => d.value)
    const max = Math.max(...values, 1)
    const maxValue = Math.ceil(max * 1.1) // Add 10% padding

    // Calculate points for SVG path
    const width = 100 // percentage
    const pointSpacing = data.length > 1 ? width / (data.length - 1) : 0
    
    const points = data.map((d, i) => ({
      x: i * pointSpacing,
      y: 100 - (d.value / maxValue) * 100,
      value: d.value,
      label: d.label
    }))

    // Grid lines (5 horizontal lines)
    const gridLines = Array.from({ length: 5 }, (_, i) => ({
      y: (i * 25),
      value: maxValue * (1 - i * 0.25)
    }))

    return { maxValue, points, gridLines }
  }, [data])

  const pathD = useMemo(() => {
    if (points.length === 0) return ''
    
    if (type === 'line') {
      // Smooth curve using quadratic bezier
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i]
        const next = points[i + 1]
        const midX = (current.x + next.x) / 2
        
        path += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`
        path += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`
      }
      
      return path
    } else {
      // Bar chart - not a path, will render separately
      return ''
    }
  }, [points, type])

  const areaPathD = useMemo(() => {
    if (points.length === 0 || type !== 'line') return ''
    
    let path = pathD
    path += ` L ${points[points.length - 1].x} 100`
    path += ` L ${points[0].x} 100 Z`
    
    return path
  }, [pathD, points, type])

  if (data.length === 0) {
    return (
      <div className={`
        rounded-xl p-6 border
        ${theme === 'dark' 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `} style={{ height }}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {title}
        </h3>
        <div className="flex items-center justify-center h-full">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            No data available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      rounded-xl p-6 border
      ${theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      <h3 className={`
        text-lg font-semibold mb-4
        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
      `}>
        {title}
      </h3>

      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {showGrid && gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={line.y}
                x2="100"
                y2={line.y}
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
              <text
                x="-1"
                y={line.y}
                fontSize="3"
                fill={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatValue(line.value)}
              </text>
            </g>
          ))}

          {type === 'line' ? (
            <>
              {/* Area fill */}
              <path
                d={areaPathD}
                fill={color}
                fillOpacity="0.1"
              />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="1"
                  fill={color}
                  className="hover:r-2 transition-all cursor-pointer"
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </circle>
              ))}
            </>
          ) : (
            /* Bar chart */
            points.map((point, i) => {
              const barWidth = 100 / data.length * 0.8
              const barX = point.x - barWidth / 2
              const barHeight = 100 - point.y
              
              return (
                <rect
                  key={i}
                  x={barX}
                  y={point.y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  fillOpacity="0.8"
                  className="hover:fill-opacity-100 transition-all cursor-pointer"
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </rect>
              )
            })
          )}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((d, i) => {
            // Show every nth label to avoid crowding
            const showEvery = Math.ceil(data.length / 8)
            if (i % showEvery !== 0 && i !== data.length - 1) return null
            
            return (
              <div
                key={i}
                className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}
                style={{ 
                  position: 'absolute',
                  left: `${(i / (data.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {d.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
