import type { ProductCategory } from '../services/api'

/**
 * Category tree node with children
 */
export interface CategoryTreeNode extends ProductCategory {
  children: CategoryTreeNode[]
  level: number
  path: number[]
}

/**
 * Build hierarchical tree structure from flat category list
 */
export function buildCategoryTree(categories: ProductCategory[]): CategoryTreeNode[] {
  const categoryMap = new Map<number, CategoryTreeNode>()
  const rootCategories: CategoryTreeNode[] = []

  // First pass: Create tree nodes
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      level: 0,
      path: [category.id]
    })
  })

  // Second pass: Build hierarchy
  categories.forEach(category => {
    const node = categoryMap.get(category.id)
    if (!node) return

    if (category.parent_category_id) {
      const parent = categoryMap.get(category.parent_category_id)
      if (parent) {
        parent.children.push(node)
        node.level = parent.level + 1
        node.path = [...parent.path, node.id]
      } else {
        // Parent not found, treat as root
        rootCategories.push(node)
      }
    } else {
      rootCategories.push(node)
    }
  })

  // Sort by display_order at each level
  const sortChildren = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.display_order - b.display_order)
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortChildren(node.children)
      }
    })
  }

  sortChildren(rootCategories)
  return rootCategories
}

/**
 * Flatten tree structure back to array
 */
export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = []

  const traverse = (nodes: CategoryTreeNode[]) => {
    nodes.forEach(node => {
      result.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return result
}

/**
 * Find category node by ID in tree
 */
export function findCategoryInTree(
  tree: CategoryTreeNode[],
  categoryId: number
): CategoryTreeNode | null {
  for (const node of tree) {
    if (node.id === categoryId) {
      return node
    }
    if (node.children.length > 0) {
      const found = findCategoryInTree(node.children, categoryId)
      if (found) return found
    }
  }
  return null
}

/**
 * Get category path (breadcrumb trail) from root to category
 */
export function getCategoryPath(
  tree: CategoryTreeNode[],
  categoryId: number
): CategoryTreeNode[] {
  const node = findCategoryInTree(tree, categoryId)
  if (!node) return []

  const path: CategoryTreeNode[] = []
  const buildPath = (nodes: CategoryTreeNode[], targetPath: number[]): boolean => {
    for (const n of nodes) {
      if (n.id === targetPath[0]) {
        path.push(n)
        if (targetPath.length === 1) {
          return true
        }
        return buildPath(n.children, targetPath.slice(1))
      }
    }
    return false
  }

  buildPath(tree, node.path)
  return path
}

/**
 * Get all descendant IDs of a category
 */
export function getDescendantIds(node: CategoryTreeNode): number[] {
  const ids: number[] = [node.id]
  
  const traverse = (n: CategoryTreeNode) => {
    n.children.forEach(child => {
      ids.push(child.id)
      traverse(child)
    })
  }
  
  traverse(node)
  return ids
}

/**
 * Check if category has children
 */
export function hasChildren(node: CategoryTreeNode): boolean {
  return node.children.length > 0
}

/**
 * Get category depth (maximum level in subtree)
 */
export function getCategoryDepth(node: CategoryTreeNode): number {
  if (node.children.length === 0) {
    return node.level
  }
  
  return Math.max(...node.children.map(child => getCategoryDepth(child)))
}

/**
 * Filter tree by search query
 */
export function filterCategoryTree(
  tree: CategoryTreeNode[],
  query: string
): CategoryTreeNode[] {
  if (!query.trim()) return tree

  const lowerQuery = query.toLowerCase()
  
  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const matches = node.name.toLowerCase().includes(lowerQuery) ||
                   node.description?.toLowerCase().includes(lowerQuery)
    
    const filteredChildren = node.children
      .map(child => filterNode(child))
      .filter((child): child is CategoryTreeNode => child !== null)
    
    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      }
    }
    
    return null
  }
  
  return tree
    .map(node => filterNode(node))
    .filter((node): node is CategoryTreeNode => node !== null)
}

/**
 * Convert flat categories to options for TouchSelect
 */
export function categoriesToOptions(categories: ProductCategory[]) {
  const tree = buildCategoryTree(categories)
  const flat = flattenCategoryTree(tree)
  
  return flat.map(node => ({
    value: node.id,
    label: '  '.repeat(node.level) + node.name,
    description: node.description
  }))
}
