import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { CartItem } from '../../stores/posStore'
import { IconButton, CurrencyDisplay } from '../common'

interface SwipeableCartItemProps {
  item: CartItem
  onRemove: (itemId: string) => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onDiscountClick?: (itemId: string) => void
  onNoteClick?: (itemId: string) => void
  onCustomizeClick?: (itemId: string) => void
  showCustomization?: boolean
}

export function SwipeableCartItem({ 
  item, 
  onRemove, 
  onQuantityChange,
  onDiscountClick,
  onNoteClick,
  onCustomizeClick,
  showCustomization = false
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
          relative px-3 py-2 border-b cursor-grab active:cursor-grabbing
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          transition-transform duration-200 ease-out
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Item Header - Compact */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h4 className={`
                font-semibold text-xs truncate
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {item.product.name}
              </h4>
              {item.product.sku && (
                <span className={`
                  text-[10px] font-mono opacity-60 flex-shrink-0
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  #{item.product.sku}
                </span>
              )}
            </div>
            {item.variationName && (
              <p className={`
                text-[10px] mt-0.5
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {item.variationName}
              </p>
            )}
            {item.note && (
              <p className={`
                text-[10px] mt-0.5 italic
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
              `}>
                📝 {item.note}
              </p>
            )}
            {item.customization && (
              <div className={`
                text-[10px] mt-0.5 flex flex-wrap gap-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {item.customization.spicyLevel && item.customization.spicyLevel !== 'none' && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">🌶️ {item.customization.spicyLevel}</span>
                )}
                {item.customization.saltLevel && item.customization.saltLevel !== 'none' && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">🧂 {item.customization.saltLevel}</span>
                )}
                {item.customization.cookingPreference && (
                  <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-500">👨‍🍳 {item.customization.cookingPreference}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Customize Button (Restaurant Mode) */}
            {showCustomization && onCustomizeClick && (
              <button
                onClick={() => onCustomizeClick(item.id)}
                className={`p-1 rounded transition-colors ${
                  item.customization 
                    ? theme === 'dark' ? 'bg-green-600/30 hover:bg-green-600/50 text-green-400' : 'bg-green-100 hover:bg-green-200 text-green-600'
                    : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title={item.customization ? 'Edit customization' : 'Customize product'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            )}

            {/* Note Button */}
            {onNoteClick && (
              <button
                onClick={() => onNoteClick(item.id)}
                className={`p-1 rounded transition-colors ${
                  item.note 
                    ? theme === 'dark' ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                    : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title={item.note ? 'Edit note' : 'Add note'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {/* Discount Button */}
            {onDiscountClick && (
              <button
                onClick={() => onDiscountClick(item.id)}
                className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Apply discount"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </button>
            )}

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
              title="Remove item"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modifiers - Compact */}
        {item.modifiers && item.modifiers.length > 0 && (
          <div className={`
            mb-1.5 pl-2 border-l
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
          `}>
            {item.modifiers.map((modifier) => (
              <div key={modifier.id} className="flex items-center justify-between py-0.5">
                <span className={`
                  text-[10px]
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  + {modifier.name}
                </span>
                <CurrencyDisplay
                  amount={modifier.price}
                  className={`
                    text-[10px] font-mono
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quantity Controls & Price - Compact */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls - Smaller */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={`
                w-7 h-7 rounded flex items-center justify-center
                transition-all duration-200 ease-out
                transform active:scale-90
                ${item.quantity <= 1
                  ? theme === 'dark'
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900 active:bg-gray-400'
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <div className={`
              min-w-[32px] text-center text-sm font-mono font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {item.quantity}
            </div>

            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className={`
                w-7 h-7 rounded flex items-center justify-center
                transition-all duration-200 ease-out
                transform active:scale-90
                ${theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white active:bg-primary-700'
                  : 'bg-primary-500 hover:bg-primary-600 text-white active:bg-primary-600'
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            {/* Unit Price Display */}
            <CurrencyDisplay
              amount={item.unitPrice}
              prefix="@"
              className={`
                text-[10px] font-mono ml-1
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              `}
            />
          </div>

          {/* Item Total - Monospace */}
          <div className="text-right">
            <CurrencyDisplay
              amount={item.total}
              className={`
                text-sm font-mono font-bold
                ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
              `}
            />
            {item.discount > 0 && (
              <div className="flex flex-col items-end gap-0.5">
                <CurrencyDisplay
                  amount={item.unitPrice * item.quantity}
                  className={`
                    text-[10px] font-mono line-through
                    ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                  `}
                />
                <CurrencyDisplay
                  amount={item.discount * item.quantity}
                  prefix="-"
                  className="text-[10px] font-mono font-medium text-green-500"
                />
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
