import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { CartItem } from '../../stores/posStore'
import { IconButton } from '../common'

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`
}

interface SwipeableCartItemProps {
  item: CartItem
  onRemove: (itemId: string) => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onDiscountClick?: (itemId: string) => void
}

export function SwipeableCartItem({ 
  item, 
  onRemove, 
  onQuantityChange,
  onDiscountClick 
}: SwipeableCartItemProps) {
  const { theme } = useAppStore()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [startX, setStartX] = useState(0)
  const itemRef = useRef<HTMLDivElement>(null)
  const swipeThreshold = 100 // pixels to trigger delete

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    
    // Only allow left swipe (negative offset)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -150))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    
    // If swiped past threshold, remove item
    if (swipeOffset < -swipeThreshold) {
      // Animate to full swipe
      setSwipeOffset(-300)
      setTimeout(() => {
        onRemove(item.id)
        setSwipeOffset(0)
      }, 300)
    } else {
      // Snap back
      setSwipeOffset(0)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setIsSwiping(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return
    const diff = e.clientX - startX
    
    // Only allow left swipe (negative offset)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -150))
    }
  }

  const handleMouseUp = () => {
    setIsSwiping(false)
    
    // If swiped past threshold, remove item
    if (swipeOffset < -swipeThreshold) {
      // Animate to full swipe
      setSwipeOffset(-300)
      setTimeout(() => {
        onRemove(item.id)
        setSwipeOffset(0)
      }, 300)
    } else {
      // Snap back
      setSwipeOffset(0)
    }
  }

  useEffect(() => {
    if (isSwiping) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX
        if (diff < 0) {
          setSwipeOffset(Math.max(diff, -150))
        }
      }

      const handleGlobalMouseUp = () => {
        setIsSwiping(false)
        if (swipeOffset < -swipeThreshold) {
          setSwipeOffset(-300)
          setTimeout(() => {
            onRemove(item.id)
            setSwipeOffset(0)
          }, 300)
        } else {
          setSwipeOffset(0)
        }
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isSwiping, swipeOffset, startX])

  const deleteOpacity = Math.min(Math.abs(swipeOffset) / swipeThreshold, 1)

  return (
    <div className="relative overflow-hidden">
      {/* Delete Background */}
      <div 
        className={`
          absolute inset-0 flex items-center justify-end px-6
          ${theme === 'dark' ? 'bg-red-600' : 'bg-red-500'}
        `}
        style={{ opacity: deleteOpacity }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      {/* Swipeable Item */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className={`
          relative px-4 py-4 border-b cursor-grab active:cursor-grabbing
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          transition-transform duration-200 ease-out
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Item Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className={`
              font-semibold text-sm
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {item.product.name}
            </h4>
            {item.variationName && (
              <p className={`
                text-xs mt-0.5
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {item.variationName}
              </p>
            )}
            {item.note && (
              <p className={`
                text-xs mt-1 italic
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
              `}>
                Note: {item.note}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Discount Button */}
            {onDiscountClick && (
              <IconButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                label="Apply discount"
                onClick={() => onDiscountClick(item.id)}
                variant="ghost"
                size="sm"
              />
            )}

            {/* Remove Button */}
            <IconButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              label="Remove item"
              onClick={() => onRemove(item.id)}
              variant="ghost"
              size="sm"
            />
          </div>
        </div>

        {/* Modifiers */}
        {item.modifiers && item.modifiers.length > 0 && (
          <div className={`
            mb-3 pl-3 border-l-2
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {item.modifiers.map((modifier) => (
              <div key={modifier.id} className="flex items-center justify-between py-1">
                <span className={`
                  text-xs
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  + {modifier.name}
                </span>
                <span className={`
                  text-xs font-medium
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  {formatCurrency(modifier.price)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                transition-all duration-200 ease-out
                transform active:scale-90
                ${item.quantity <= 1
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-600 hover:scale-105'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900 active:bg-gray-400 hover:scale-105'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <div className={`
              min-w-[48px] text-center text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {item.quantity}
            </div>

            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                transition-all duration-200 ease-out
                transform hover:scale-105 active:scale-90
                ${theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white active:bg-primary-700'
                  : 'bg-primary-500 hover:bg-primary-600 text-white active:bg-primary-600'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <div className={`
              text-base font-bold
              ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
            `}>
              {formatCurrency(item.total)}
            </div>
            {item.discount > 0 && (
              <div className="flex flex-col items-end gap-0.5">
                <div className={`
                  text-xs line-through
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </div>
                <div className="text-xs font-medium text-green-500">
                  -{formatCurrency(item.discount * item.quantity)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Swipe Hint */}
        {!isSwiping && swipeOffset === 0 && (
          <div className={`
            absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none
            text-xs opacity-30
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            ← Swipe
          </div>
        )}
      </div>
    </div>
  )
}
