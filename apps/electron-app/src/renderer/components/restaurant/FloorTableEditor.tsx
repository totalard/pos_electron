import { useState, useRef, useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { RightPanel } from '../common'
import type { Floor, Table } from '../../types/restaurant'

interface FloorTableEditorProps {
  isOpen: boolean
  onClose: () => void
}

interface DragState {
  isDragging: boolean
  tableId: string | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}

export function FloorTableEditor({ isOpen, onClose }: FloorTableEditorProps) {
  const { theme } = useAppStore()
  const { restaurant, updateRestaurantSettings } = useSettingsStore()
  
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(
    restaurant.floors.length > 0 ? restaurant.floors[0].id : null
  )
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'add'>('view')
  const [showFloorDialog, setShowFloorDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    tableId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const GRID_SIZE = 50
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  const selectedFloor = restaurant.floors.find(f => f.id === selectedFloorId)
  const tablesForFloor = restaurant.tables.filter(t => t.floorId === selectedFloorId)

  // Floor Management
  const handleAddFloor = () => {
    setEditingFloor(null)
    setShowFloorDialog(true)
  }

  const handleEditFloor = (floor: Floor) => {
    setEditingFloor(floor)
    setShowFloorDialog(true)
  }

  const handleSaveFloor = (floorData: Partial<Floor>) => {
    if (editingFloor) {
      // Update existing floor
      const updatedFloors = restaurant.floors.map(f =>
        f.id === editingFloor.id ? { ...f, ...floorData, updatedAt: new Date() } : f
      )
      updateRestaurantSettings({ floors: updatedFloors })
    } else {
      // Add new floor
      const now = new Date()
      const newFloor: Floor = {
        id: `floor-${Date.now()}`,
        name: floorData.name || 'New Floor',
        description: floorData.description,
        order: restaurant.floors.length,
        isActive: true,
        tables: [],
        createdAt: now,
        updatedAt: now
      }
      updateRestaurantSettings({ floors: [...restaurant.floors, newFloor] })
      setSelectedFloorId(newFloor.id)
    }
    setShowFloorDialog(false)
  }

  const handleDeleteFloor = (floorId: string) => {
    if (confirm('Are you sure you want to delete this floor? All tables on this floor will be removed.')) {
      const updatedFloors = restaurant.floors.filter(f => f.id !== floorId)
      const updatedTables = restaurant.tables.filter(t => t.floorId !== floorId)
      updateRestaurantSettings({ floors: updatedFloors, tables: updatedTables })
      if (selectedFloorId === floorId) {
        setSelectedFloorId(updatedFloors.length > 0 ? updatedFloors[0].id : null)
      }
    }
  }

  // Table Management
  const handleAddTable = () => {
    if (!selectedFloorId) {
      alert('Please select or create a floor first')
      return
    }
    setEditingTable(null)
    setShowTableDialog(true)
  }

  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setShowTableDialog(true)
  }

  const handleSaveTable = (tableData: Partial<Table>) => {
    if (editingTable) {
      // Update existing table
      const updatedTables = restaurant.tables.map(t =>
        t.id === editingTable.id ? { ...t, ...tableData, updatedAt: new Date() } : t
      )
      updateRestaurantSettings({ tables: updatedTables })
    } else {
      // Add new table
      const now = new Date()
      const newTable: Table = {
        id: `table-${Date.now()}`,
        floorId: selectedFloorId!,
        name: tableData.name || 'New Table',
        capacity: tableData.capacity || 4,
        status: 'available',
        position: tableData.position || { x: 100, y: 100 },
        shape: tableData.shape || 'square',
        createdAt: now,
        updatedAt: now
      }
      updateRestaurantSettings({ tables: [...restaurant.tables, newTable] })
    }
    setShowTableDialog(false)
  }

  const handleDeleteTable = (tableId: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      const updatedTables = restaurant.tables.filter(t => t.id !== tableId)
      updateRestaurantSettings({ tables: updatedTables })
    }
  }

  // Drag and Drop
  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    if (editMode !== 'edit') return
    
    const table = tablesForFloor.find(t => t.id === tableId)
    if (!table || !table.position) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragState({
      isDragging: true,
      tableId,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      offsetX: e.clientX - rect.left - table.position.x,
      offsetY: e.clientY - rect.top - table.position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.tableId) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = Math.max(0, Math.min(CANVAS_WIDTH - 80, e.clientX - rect.left - dragState.offsetX))
    const y = Math.max(0, Math.min(CANVAS_HEIGHT - 80, e.clientY - rect.top - dragState.offsetY))

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE

    const updatedTables = restaurant.tables.map(t =>
      t.id === dragState.tableId
        ? { ...t, position: { x: snappedX, y: snappedY }, updatedAt: new Date() }
        : t
    )
    updateRestaurantSettings({ tables: updatedTables })
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      tableId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    })
  }

  const getTableStyle = (table: Table) => {
    const baseSize = 80
    const style: React.CSSProperties = {
      position: 'absolute',
      left: table.position?.x || 0,
      top: table.position?.y || 0,
      width: baseSize,
      height: baseSize,
      cursor: editMode === 'edit' ? 'move' : 'pointer'
    }
    return style
  }

  const getTableShapeClass = (shape?: Table['shape']) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full'
      case 'rectangle':
        return 'rounded-lg'
      default:
        return 'rounded-xl'
    }
  }

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
      case 'occupied':
        return theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
      case 'reserved':
        return theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500'
      case 'cleaning':
        return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
      default:
        return theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
    }
  }

  return (
    <>
      <RightPanel isOpen={isOpen} onClose={onClose} title="Floor & Table Editor" width="lg">
        <div className="flex h-full">
          {/* Left Sidebar - Floor List */}
          <div className={`w-64 border-r p-4 space-y-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Floors
              </h3>
              <button
                onClick={handleAddFloor}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {restaurant.floors.map(floor => (
                <div
                  key={floor.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFloorId === floor.id
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setSelectedFloorId(floor.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{floor.name}</div>
                      {floor.description && (
                        <div className="text-xs opacity-75 mt-1">{floor.description}</div>
                      )}
                      <div className="text-xs opacity-75 mt-1">
                        {restaurant.tables.filter(t => t.floorId === floor.id).length} tables
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditFloor(floor)
                        }}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFloor(floor.id)
                        }}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {restaurant.floors.length === 0 && (
              <div className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                No floors created yet
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-4">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedFloor?.name || 'Select a floor'}
                </h3>
                {selectedFloor && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(editMode === 'view' ? 'edit' : 'view')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        editMode === 'edit'
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {editMode === 'edit' ? 'Done Editing' : 'Edit Layout'}
                    </button>
                    <button
                      onClick={handleAddTable}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      Add Table
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-8">
              {selectedFloor ? (
                <div
                  ref={canvasRef}
                  className={`relative border-2 border-dashed ${theme === 'dark' ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}
                  style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    backgroundImage: `
                      linear-gradient(${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px),
                      linear-gradient(90deg, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {tablesForFloor.map(table => (
                    <div
                      key={table.id}
                      style={getTableStyle(table)}
                      onMouseDown={(e) => handleMouseDown(e, table.id)}
                      onClick={() => editMode === 'view' && handleEditTable(table)}
                      className={`
                        ${getTableShapeClass(table.shape)}
                        ${getTableStatusColor(table.status)}
                        flex flex-col items-center justify-center
                        text-white font-semibold shadow-lg
                        transition-all duration-200
                        ${editMode === 'edit' ? 'hover:scale-105' : 'hover:opacity-90'}
                      `}
                    >
                      <span className="text-lg">{table.name}</span>
                      <span className="text-xs opacity-90 mt-1">
                        {table.capacity} seats
                      </span>
                    </div>
                  ))}

                  {tablesForFloor.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No tables on this floor</p>
                        <p className="text-xs mt-1">Click "Add Table" to create one</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className={`text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm">No floor selected</p>
                    <p className="text-xs mt-1">Create or select a floor to start</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </RightPanel>

      {/* Floor Dialog */}
      {showFloorDialog && (
        <FloorDialog
          isOpen={showFloorDialog}
          onClose={() => setShowFloorDialog(false)}
          onSave={handleSaveFloor}
          floor={editingFloor}
        />
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <TableDialog
          isOpen={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onSave={handleSaveTable}
          table={editingTable}
        />
      )}
    </>
  )
}

// Floor Dialog Component
interface FloorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (floor: Partial<Floor>) => void
  floor: Floor | null
}

function FloorDialog({ isOpen, onClose, onSave, floor }: FloorDialogProps) {
  const { theme } = useAppStore()
  const [name, setName] = useState(floor?.name || '')
  const [description, setDescription] = useState(floor?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Floor name is required')
      return
    }
    onSave({ name: name.trim(), description: description.trim() || undefined })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={floor ? 'Edit Floor' : 'Add Floor'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Floor Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., Ground Floor, First Floor"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {floor ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Table Dialog Component
interface TableDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (table: Partial<Table>) => void
  table: Table | null
}

function TableDialog({ isOpen, onClose, onSave, table }: TableDialogProps) {
  const { theme } = useAppStore()
  const [name, setName] = useState(table?.name || '')
  const [capacity, setCapacity] = useState(table?.capacity || 4)
  const [shape, setShape] = useState<Table['shape']>(table?.shape || 'square')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Table name is required')
      return
    }
    if (capacity < 1) {
      alert('Capacity must be at least 1')
      return
    }
    onSave({ name: name.trim(), capacity, shape })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={table ? 'Edit Table' : 'Add Table'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Table Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., T1, Table 1, A1"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Capacity *
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            min="1"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Shape
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['square', 'circle', 'rectangle'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setShape(s)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  shape === s
                    ? theme === 'dark'
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-blue-500 bg-blue-50'
                    : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-12 h-12 mx-auto ${
                  s === 'circle' ? 'rounded-full' : s === 'rectangle' ? 'rounded-lg' : 'rounded-xl'
                } ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <div className={`text-xs mt-2 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {s}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {table ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
