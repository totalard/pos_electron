import { useState, useEffect } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import { Button, LoadingSpinner, ErrorMessage } from '../common'
import { TextArea, NumberInput } from '../forms'
import { CategoryTree } from './CategoryTree'
import { CategorySelector } from './CategorySelector'
import { Checkbox } from '../forms'
import type { ProductCategory, ProductCategoryCreate } from '../../services/api'

interface CategoryManagementProps {
  onClose: () => void
}

export function CategoryManagement({ onClose }: CategoryManagementProps) {
  const { theme } = useAppStore()
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error
  } = useProductStore()
  
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [parentCategory, setParentCategory] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductCategoryCreate>({
    name: '',
    description: '',
    parent_category_id: undefined,
    display_order: 0,
    is_active: true
  })
  
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])
  
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description,
        parent_category_id: editingCategory.parent_category_id,
        display_order: editingCategory.display_order,
        is_active: editingCategory.is_active
      })
      setParentCategory(editingCategory.parent_category_id || null)
    }
  }, [editingCategory])
  
  const handleChange = (field: keyof ProductCategoryCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await createCategory(formData)
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        parent_category_id: undefined,
        display_order: 0,
        is_active: true
      })
      setEditingCategory(null)
      setParentCategory(null)
      
      // Refresh categories
      await fetchCategories()
    } catch (err) {
      console.error('Failed to save category:', err)
    }
  }
  
  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category)
  }
  
  const handleCancelEdit = () => {
    setEditingCategory(null)
    setParentCategory(null)
    setFormData({
      name: '',
      description: '',
      parent_category_id: undefined,
      display_order: 0,
      is_active: true
    })
  }

  const handleAddChild = (parent: ProductCategory) => {
    setEditingCategory(null)
    setParentCategory(parent.id)
    setFormData({
      name: '',
      description: '',
      parent_category_id: parent.id,
      display_order: 0,
      is_active: true
    })
  }
  
  const handleDelete = async (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId)
        await fetchCategories()
      } catch (err) {
        console.error('Failed to delete category:', err)
      }
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Form Section */}
      <div className={`
        p-6 border-b
        ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </h3>
        
        {error && <ErrorMessage message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Enter category name"
              className={`
                w-full px-4 py-3 rounded-lg text-base min-h-[44px]
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
          </div>
          
          <TextArea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            placeholder="Category description (optional)"
          />

          <CategorySelector
            label="Parent Category"
            value={parentCategory}
            categories={categories}
            onChange={(id) => {
              setParentCategory(id)
              handleChange('parent_category_id', id || undefined)
            }}
            clearable
            helperText="Leave empty for top-level category"
            excludeIds={editingCategory ? [editingCategory.id] : []}
          />
          
          <NumberInput
            label="Display Order"
            value={formData.display_order || 0}
            onChange={(value) => handleChange('display_order', value)}
            min={0}
            showButtons
            helperText="Lower numbers appear first"
          />
          
          <Checkbox
            label="Active"
            description="Show this category in the product list"
            checked={formData.is_active ?? true}
            onChange={(checked) => handleChange('is_active', checked)}
          />
          
          <div className="flex gap-2 justify-end">
            {editingCategory && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Categories ({categories.length})
        </h3>
        
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        )}
        
        {!isLoading && categories.length === 0 && (
          <div className={`
            text-center py-10
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            <p>No categories yet. Add your first category above.</p>
          </div>
        )}
        
        {!isLoading && categories.length > 0 && (
          <CategoryTree
            categories={categories}
            selectedId={editingCategory?.id}
            onSelect={handleEdit}
            onEdit={handleEdit}
            onDelete={(cat) => handleDelete(cat.id)}
            onAddChild={handleAddChild}
            showActions={true}
            showSearch={true}
            emptyMessage="No categories found"
          />
        )}
      </div>
    </div>
  )
}

