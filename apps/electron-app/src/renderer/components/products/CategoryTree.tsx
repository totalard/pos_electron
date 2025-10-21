import { useState, useMemo } from 'react'
import { useAppStore } from '../../stores'
import { Input, LoadingSpinner } from '../common'
import { CategoryTreeNode } from './CategoryTreeNode'
import { buildCategoryTree, filterCategoryTree } from '../../utils/categoryTree'
import type { ProductCategory } from '../../services/api'
import type { CategoryTreeNode as TreeNode } from '../../utils/categoryTree'

/**
 * CategoryTree component props
 */
export interface CategoryTreeProps {
  /** Flat array of categories */
  categories: ProductCategory[]
  /** Selected category ID */
  selectedId?: number | null
  /** Click handler */
  onSelect?: (category: ProductCategory) => void
  /** Edit handler */
  onEdit?: (category: ProductCategory) => void
  /** Delete handler */
  onDelete?: (category: ProductCategory) => void
  /** Add child handler */
  onAddChild?: (parentCategory: ProductCategory) => void
  /** Show action buttons */
  showActions?: boolean
  /** Show search */
  showSearch?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Empty message */
  emptyMessage?: string
  /** Expand all by default */
  defaultExpanded?: boolean
}

/**
 * Hierarchical category tree component.
 * 
 * Features:
 * - Hierarchical tree view with unlimited nesting
 * - Search/filter functionality
 * - Expand/collapse all
 * - Visual hierarchy indicators
 * - Touch-safe interactions
 * 
 * @example
 * ```tsx
 * <CategoryTree
 *   categories={categories}
 *   selectedId={selectedCategory?.id}
 *   onSelect={handleSelect}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showActions
 *   showSearch
 * />
 * ```
 */
export function CategoryTree({
  categories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  showActions = true,
  showSearch = true,
  isLoading = false,
  emptyMessage = 'No categories found',
  defaultExpanded = false
}: CategoryTreeProps) {
  const { theme } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandAll, setExpandAll] = useState(defaultExpanded)

  // Build tree structure
  const tree = useMemo(() => {
    return buildCategoryTree(categories)
  }, [categories])

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree
    return filterCategoryTree(tree, searchQuery)
  }, [tree, searchQuery])

  const handleExpandAll = () => {
    setExpandAll(true)
  }

  const handleCollapseAll = () => {
    setExpandAll(false)
  }

  const handleNodeSelect = (node: TreeNode) => {
    onSelect?.(node)
  }

  const handleNodeEdit = (node: TreeNode) => {
    onEdit?.(node)
  }

  const handleNodeDelete = (node: TreeNode) => {
    onDelete?.(node)
  }

  const handleNodeAddChild = (node: TreeNode) => {
    onAddChild?.(node)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      {showSearch && (
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {tree.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className={`
                  px-3 py-1.5 text-sm rounded-lg
                  transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                `}
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className={`
                  px-3 py-1.5 text-sm rounded-lg
                  transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                `}
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tree */}
      {filteredTree.length === 0 ? (
        <div className={`
          text-center py-10
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredTree.map(node => (
            <CategoryTreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={handleNodeSelect}
              onEdit={handleNodeEdit}
              onDelete={handleNodeDelete}
              onAddChild={handleNodeAddChild}
              showActions={showActions}
              defaultExpanded={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  )
}
