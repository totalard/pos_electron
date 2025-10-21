import { useState } from 'react'
import { useAppStore, useSettingsStore, usePOSStore } from '../../stores'
import { Modal } from '../common'

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'
type TableShape = 'square' | 'circle' | 'rectangle'

interface Table {
  id: string
  floorId: string
  name: string
  capacity: number
  status: TableStatus
  position?: { x: number; y: number }
  shape?: TableShape
}

interface Floor {
  id: string
  name: string
  description?: string
  order: number
  isActive: boolean
}

interface TableSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTable: (table: Table, floor: Floor) => void
}

export function TableSelector({ isOpen, onClose, onSelectTable }: TableSelectorProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(
    restaurant.floors.length > 0 ? restaurant.floors[0].id : null
  )

  const activeFloors = restaurant.floors.filter(f => f.isActive).sort((a, b) => a.order - b.order)
  const selectedFloor = activeFloors.find(f => f.id === selectedFloorId)
  const tablesForFloor = restaurant.tables.filter(t => t.floorId === selectedFloorId)

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return theme === 'dark' ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600'
      case 'occupied':
        return theme === 'dark' ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'
      case 'reserved':
        return theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-500 hover:bg-yellow-600'
      case 'cleaning':
        return theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'
      default:
        return theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
    }
  }

  const getTableShape = (shape?: Table['shape']) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full'
      case 'rectangle':
        return 'rounded-lg'
      default:
        return 'rounded-xl'
    }
  }

  const handleTableSelect = (table: Table) => {
    if (table.status === 'available' && selectedFloor) {
      onSelectTable(table, selectedFloor)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Table" size="xl">
      <div className="space-y-4">
        {/* Floor Tabs */}
        {activeFloors.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activeFloors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloorId(floor.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${selectedFloorId === floor.id
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {floor.name}
              </button>
            ))}
          </div>
        )}

        {/* Floor Description */}
        {selectedFloor?.description && (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedFloor.description}
          </p>
        )}

        {/* Tables Grid */}
        {tablesForFloor.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
            {tablesForFloor.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                disabled={table.status !== 'available'}
                className={`
                  ${getTableShape(table.shape)}
                  ${getTableStatusColor(table.status)}
                  aspect-square flex flex-col items-center justify-center
                  text-white font-semibold transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-105 active:scale-95
                  shadow-lg
                `}
              >
                <span className="text-lg">{table.name}</span>
                <span className="text-xs opacity-90 mt-1">
                  {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                </span>
                {table.status !== 'available' && (
                  <span className="text-xs opacity-75 mt-1 capitalize">
                    {table.status}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className={`
            text-center py-12
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">No tables available</p>
            <p className="text-xs mt-1">Add tables in restaurant settings</p>
          </div>
        )}

        {/* Legend */}
        <div className={`
          flex flex-wrap gap-4 pt-4 border-t
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Occupied
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Reserved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Cleaning
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
