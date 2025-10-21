/**
 * Restaurant-specific types and interfaces
 */

/**
 * Order type for restaurant operations
 */
export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'drive-thru'

/**
 * Table status
 */
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

/**
 * Order status for kitchen management
 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed'

/**
 * Customization level types
 */
export type CustomizationLevel = 'none' | 'low' | 'medium' | 'high' | 'extra'

/**
 * Product customization options
 */
export interface ProductCustomization {
  spicyLevel?: CustomizationLevel
  saltLevel?: CustomizationLevel
  cookingPreference?: string // e.g., 'well-done', 'medium-rare', 'no-oil'
  specialInstructions?: string
}

/**
 * Product note for cart items
 */
export interface ProductNote {
  id: string
  text: string
  customization?: ProductCustomization
  createdAt: Date
}

/**
 * Floor definition
 */
export interface Floor {
  id: string
  name: string
  description?: string
  order: number
  isActive: boolean
  tables: Table[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Table definition
 */
export interface Table {
  id: string
  floorId: string
  name: string
  capacity: number
  status: TableStatus
  position?: {
    x: number
    y: number
  }
  shape?: 'square' | 'circle' | 'rectangle'
  currentOrderId?: string
  reservedBy?: string
  reservedAt?: Date
  occupiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Additional charge types
 */
export type ChargeType = 'parcel' | 'delivery' | 'service' | 'packaging' | 'custom'

/**
 * Additional charge definition
 */
export interface AdditionalCharge {
  id: string
  type: ChargeType
  name: string
  amount: number
  isPercentage: boolean
  isOptional: boolean
  applicableOrderTypes: OrderType[]
  isActive: boolean
  description?: string
}

/**
 * Restaurant order metadata
 */
export interface RestaurantOrderMetadata {
  orderType: OrderType
  tableId?: string
  tableName?: string
  floorId?: string
  floorName?: string
  guestCount?: number
  serverName?: string
  orderStatus: OrderStatus
  kitchenNotes?: string
  estimatedTime?: number // in minutes
  deliveryAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    phone: string
    instructions?: string
  }
  additionalCharges: {
    chargeId: string
    name: string
    amount: number
  }[]
}

/**
 * Kitchen order item
 */
export interface KitchenOrderItem {
  id: string
  productName: string
  quantity: number
  notes?: string
  customization?: ProductCustomization
  status: OrderStatus
  prepTime?: number
  courseName?: string // e.g., 'Appetizer', 'Main Course', 'Dessert'
}

/**
 * Kitchen order
 */
export interface KitchenOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  orderType: OrderType
  items: KitchenOrderItem[]
  status: OrderStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedCompletionTime?: Date
  kitchenNotes?: string
}

/**
 * Table reservation
 */
export interface TableReservation {
  id: string
  tableId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  guestCount: number
  reservationDate: Date
  reservationTime: string
  duration: number // in minutes
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show'
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Waiter/Server definition
 */
export interface Waiter {
  id: string
  name: string
  employeeId?: string
  phone?: string
  email?: string
  isActive: boolean
  assignedTables: string[] // Array of table IDs
  currentOrders: string[] // Array of order IDs
  createdAt: Date
  updatedAt: Date
}

/**
 * Customer address for delivery
 */
export interface CustomerAddress {
  id: string
  customerId?: number
  customerName: string
  phone: string
  email?: string
  label: string // e.g., 'Home', 'Office', 'Other'
  street: string
  city: string
  state: string
  zipCode: string
  landmark?: string
  instructions?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}
