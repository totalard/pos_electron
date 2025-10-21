import { useState, useEffect } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import { Button, LoadingSpinner, ErrorMessage, Badge, Input, Toggle, IconButton } from '../common'
import { TextArea } from '../forms'
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
  const [formData, setFormData] = useState<ProductCategoryCreate>({
    name: '',
    description: '',
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
        display_order: editingCategory.display_order,
        is_active: editingCategory.is_active
      })
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
        display_order: 0,
        is_active: true
      })
      setEditingCategory(null)
      
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
    setFormData({
      name: '',
      description: '',
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
          <Input
            label="Category Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Enter category name"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          
          <TextArea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            placeholder="Category description (optional)"
          />
          
          <Input
            label="Display Order"
            type="number"
            min="0"
            value={formData.display_order}
            onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
            placeholder="0"
            helperText="Lower numbers appear first"
          />
          
          <div className="flex items-center justify-between">
            <Toggle
              label="Active"
              checked={formData.is_active ?? true}
              onChange={(checked) => handleChange('is_active', checked)}
              description="Show this category in the product list"
            />
            
            <div className="flex gap-2">
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
          <div className="space-y-3">
            {categories
              .sort((a, b) => a.display_order - b.display_order)
              .map(category => (
                <div
                  key={category.id}
                  className={`
                    p-4 rounded-lg border
                    ${theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-white border-gray-200'
                    }
                    ${editingCategory?.id === category.id ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`
                          font-semibold
                          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                        `}>
                          {category.name}
                        </h4>
                        <Badge
                          color={category.is_active ? 'green' : 'gray'}
                          size="sm"
                        >
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className={`
                          text-sm mb-2
                          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                          {category.description}
                        </p>
                      )}
                      <div className={`
                        text-xs
                        ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
                      `}>
                        Order: {category.display_order}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <IconButton
                        variant="secondary"
                        size="md"
                        onClick={() => handleEdit(category)}
                        label="Edit category"
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      />
                      <IconButton
                        variant="danger"
                        size="md"
                        onClick={() => handleDelete(category.id)}
                        label="Delete category"
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

