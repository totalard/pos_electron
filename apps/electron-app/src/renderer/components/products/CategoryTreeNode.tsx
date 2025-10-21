import { useState } from 'react'
import { useAppStore } from '../../stores'
import { IconButton, Badge } from '../common'
import type { CategoryTreeNode as TreeNode } from '../../utils/categoryTree'

/**
 * CategoryTreeNode component props
 */
export interface CategoryTreeNodeProps {
  /** Category node */
  node: TreeNode
  /** Selected category ID */
  selectedId?: number | null
  /** Click handler */
  onSelect?: (node: TreeNode) => void
  /** Edit handler */
  onEdit?: (node: TreeNode) => void
  /** Delete handler */
  onDelete?: (node: TreeNode) => void
  /** Add child handler */
  onAddChild?: (parentNode: TreeNode) => void
  /** Show action buttons */
  showActions?: boolean
  /** Initially expanded */
  defaultExpanded?: boolean
}

/**
 * Individual tree node component for category hierarchy.
 * 
 * Features:
 * - Expand/collapse for nodes with children
 * - Visual hierarchy with indentation
 * - Touch-safe action buttons
 * - Active state indication
 * - Folder/item icons
 * 
 * @example
 * ```tsx
 * <CategoryTreeNode
 *   node={categoryNode}
 *   selectedId={selectedCategory?.id}
 *   onSelect={handleSelect}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showActions
 * />
 * ```
 */
export function CategoryTreeNode({
  node,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  showActions = true,
  defaultExpanded = false
}: CategoryTreeNodeProps) {
  const { theme } = useAppStore()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || node.level === 0)
  
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id
  const indentLevel = node.level

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleSelect = () => {
    onSelect?.(node)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(node)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(node)
  }

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddChild?.(node)
  }

  return (
    <div>
      {/* Node Item */}
      <div
        onClick={handleSelect}
        className={`
          flex items-center gap-2 p-3 rounded-lg
          min-h-[44px]
          transition-colors duration-200
          cursor-pointer
          ${isSelected
            ? theme === 'dark'
              ? 'bg-primary-900/30 border-2 border-primary-500'
              : 'bg-primary-50 border-2 border-primary-500'
            : theme === 'dark'
              ? 'hover:bg-gray-700 border-2 border-transparent'
              : 'hover:bg-gray-100 border-2 border-transparent'
          }
        `}
        style={{ paddingLeft: `${indentLevel * 24 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-6 h-6 flex items-center justify-center
            transition-transform duration-200
            ${hasChildren ? 'cursor-pointer' : 'invisible'}
            ${isExpanded ? 'transform rotate-90' : ''}
          `}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Folder/Item Icon */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <svg className={`w-5 h-5 ${isExpanded ? 'text-yellow-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`
              font-medium truncate
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {node.name}
            </span>
            {!node.is_active && (
              <Badge color="gray" size="sm">Inactive</Badge>
            )}
            {hasChildren && (
              <Badge color="blue" size="sm">{node.children.length}</Badge>
            )}
          </div>
          {node.description && (
            <p className={`
              text-sm truncate mt-0.5
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {node.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onAddChild && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={handleAddChild}
                label="Add subcategory"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              />
            )}
            {onEdit && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                label="Edit category"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              />
            )}
            {onDelete && (
              <IconButton
                variant="danger"
                size="sm"
                onClick={handleDelete}
                label="Delete category"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map(child => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              showActions={showActions}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
