import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  EnhancedProduct,
  ProductCategory,
  ProductVariation,
  ProductBundleComponent,
  EnhancedProductCreate,
  ProductUpdate,
  ProductCategoryCreate,
  ProductCategoryUpdate,
  ProductVariationCreate,
  ProductVariationUpdate,
  ProductBundleComponentCreate
} from '../services/api'
import { productManagementAPI } from '../services/api'

// Define the store state interface
export interface ProductState {
  // Data state
  products: EnhancedProduct[]
  categories: ProductCategory[]
  selectedProduct: EnhancedProduct | null
  selectedCategory: ProductCategory | null

  // UI state
  isLoading: boolean
  error: string | null
  viewMode: 'tile' | 'grid' // View mode preference

  // Filter state
  filters: {
    search: string
    productType: string | null
    categoryId: number | null
    isActive: boolean | null
  }

  // Pagination state
  pagination: {
    skip: number
    limit: number
    total: number
  }

  // Actions - Products
  fetchProducts: () => Promise<void>
  fetchProduct: (id: number) => Promise<void>
  createProduct: (data: EnhancedProductCreate) => Promise<EnhancedProduct>
  updateProduct: (id: number, data: ProductUpdate) => Promise<EnhancedProduct>
  deleteProduct: (id: number) => Promise<void>
  setSelectedProduct: (product: EnhancedProduct | null) => void
  
  // Actions - Categories
  fetchCategories: () => Promise<void>
  fetchCategory: (id: number) => Promise<void>
  createCategory: (data: ProductCategoryCreate) => Promise<ProductCategory>
  updateCategory: (id: number, data: ProductCategoryUpdate) => Promise<ProductCategory>
  deleteCategory: (id: number) => Promise<void>
  setSelectedCategory: (category: ProductCategory | null) => void
  
  // Actions - Variations
  fetchVariations: (productId: number) => Promise<ProductVariation[]>
  createVariation: (productId: number, data: ProductVariationCreate) => Promise<ProductVariation>
  updateVariation: (productId: number, variationId: number, data: ProductVariationUpdate) => Promise<ProductVariation>
  deleteVariation: (productId: number, variationId: number) => Promise<void>
  
  // Actions - Bundle Components
  fetchBundleComponents: (productId: number) => Promise<ProductBundleComponent[]>
  addBundleComponent: (productId: number, data: ProductBundleComponentCreate) => Promise<ProductBundleComponent>
  removeBundleComponent: (productId: number, componentId: number) => Promise<void>
  
  // Actions - Image Upload
  uploadProductImages: (productId: number, files: File[]) => Promise<void>
  deleteProductImage: (productId: number, imageIndex: number) => Promise<void>
  uploadCategoryImage: (categoryId: number, file: File) => Promise<void>
  deleteCategoryImage: (categoryId: number) => Promise<void>
  
  // Actions - Barcode Lookup
  lookupByBarcode: (barcode: string) => Promise<EnhancedProduct>
  
  // Actions - Filters
  setFilters: (filters: Partial<ProductState['filters']>) => void
  clearFilters: () => void
  
  // Actions - Pagination
  setPagination: (pagination: Partial<ProductState['pagination']>) => void
  
  // Actions - View Mode
  setViewMode: (mode: 'tile' | 'grid') => void

  // Actions - Reset
  reset: () => void
}

// Initial state
const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  selectedCategory: null,
  isLoading: false,
  error: null,
  viewMode: 'tile' as const, // Default to tile view
  filters: {
    search: '',
    productType: null,
    categoryId: null,
    isActive: null
  },
  pagination: {
    skip: 0,
    limit: 100,
    total: 0
  }
}

// Create the store with persistence for view mode
export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      ...initialState,
  
  // ============================================================================
  // Product Actions
  // ============================================================================
  
  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const { filters, pagination } = get()
      
      const params: any = {
        skip: pagination.skip,
        limit: pagination.limit
      }
      
      if (filters.search) params.search = filters.search
      if (filters.productType) params.product_type = filters.productType
      if (filters.categoryId) params.category_id = filters.categoryId
      if (filters.isActive !== null) params.is_active = filters.isActive
      
      const products = await productManagementAPI.getAllProducts(params)
      
      set({
        products,
        isLoading: false,
        pagination: { ...pagination, total: products.length }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        isLoading: false
      })
    }
  },
  
  fetchProduct: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const product = await productManagementAPI.getProduct(id)
      set({ selectedProduct: product, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        isLoading: false
      })
    }
  },
  
  createProduct: async (data: EnhancedProductCreate) => {
    set({ isLoading: true, error: null })

    try {
      const product = await productManagementAPI.createProduct(data)

      // Add to products list
      set((state) => ({
        products: [...state.products, product],
        isLoading: false
      }))

      return product
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create product',
        isLoading: false
      })
      throw error
    }
  },
  
  updateProduct: async (id: number, data: ProductUpdate) => {
    set({ isLoading: true, error: null })
    
    try {
      const product = await productManagementAPI.updateProduct(id, data)
      
      // Update in products list
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
        selectedProduct: state.selectedProduct?.id === id ? product : state.selectedProduct,
        isLoading: false
      }))
      
      return product
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update product',
        isLoading: false
      })
      throw error
    }
  },
  
  deleteProduct: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      await productManagementAPI.deleteProduct(id)
      
      // Remove from products list (soft delete - just mark as inactive)
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, is_active: false } : p
        ),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete product',
        isLoading: false
      })
      throw error
    }
  },
  
  setSelectedProduct: (product: EnhancedProduct | null) => {
    set({ selectedProduct: product })
  },
  
  // ============================================================================
  // Category Actions
  // ============================================================================
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const categories = await productManagementAPI.getAllCategories()
      set({ categories, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        isLoading: false
      })
    }
  },
  
  fetchCategory: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const category = await productManagementAPI.getCategory(id)
      set({ selectedCategory: category, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch category',
        isLoading: false
      })
    }
  },
  
  createCategory: async (data: ProductCategoryCreate) => {
    set({ isLoading: true, error: null })
    
    try {
      const category = await productManagementAPI.createCategory(data)
      
      // Add to categories list
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false
      }))
      
      return category
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create category',
        isLoading: false
      })
      throw error
    }
  },
  
  updateCategory: async (id: number, data: ProductCategoryUpdate) => {
    set({ isLoading: true, error: null })
    
    try {
      const category = await productManagementAPI.updateCategory(id, data)
      
      // Update in categories list
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? category : c)),
        selectedCategory: state.selectedCategory?.id === id ? category : state.selectedCategory,
        isLoading: false
      }))
      
      return category
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update category',
        isLoading: false
      })
      throw error
    }
  },
  
  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      await productManagementAPI.deleteCategory(id)
      
      // Remove from categories list
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory,
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category',
        isLoading: false
      })
      throw error
    }
  },
  
  setSelectedCategory: (category: ProductCategory | null) => {
    set({ selectedCategory: category })
  },

  // ============================================================================
  // Variation Actions
  // ============================================================================

  fetchVariations: async (productId: number) => {
    try {
      return await productManagementAPI.getProductVariations(productId)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch variations'
      })
      throw error
    }
  },

  createVariation: async (productId: number, data: ProductVariationCreate) => {
    try {
      return await productManagementAPI.createProductVariation(productId, data)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create variation'
      })
      throw error
    }
  },

  updateVariation: async (productId: number, variationId: number, data: ProductVariationUpdate) => {
    try {
      return await productManagementAPI.updateProductVariation(productId, variationId, data)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update variation'
      })
      throw error
    }
  },

  deleteVariation: async (productId: number, variationId: number) => {
    try {
      await productManagementAPI.deleteProductVariation(productId, variationId)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete variation'
      })
      throw error
    }
  },

  // ============================================================================
  // Bundle Component Actions
  // ============================================================================

  fetchBundleComponents: async (productId: number) => {
    try {
      return await productManagementAPI.getBundleComponents(productId)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch bundle components'
      })
      throw error
    }
  },

  addBundleComponent: async (productId: number, data: ProductBundleComponentCreate) => {
    try {
      return await productManagementAPI.addBundleComponent(productId, data)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add bundle component'
      })
      throw error
    }
  },

  removeBundleComponent: async (productId: number, componentId: number) => {
    try {
      await productManagementAPI.removeBundleComponent(productId, componentId)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove bundle component'
      })
      throw error
    }
  },

  // ============================================================================
  // Image Upload Actions
  // ============================================================================

  uploadProductImages: async (productId: number, files: File[]) => {
    try {
      await productManagementAPI.uploadProductImages(productId, files)

      // Refresh product to get updated image paths
      const product = await productManagementAPI.getProduct(productId)

      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? product : p)),
        selectedProduct: state.selectedProduct?.id === productId ? product : state.selectedProduct
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload images'
      })
      throw error
    }
  },

  deleteProductImage: async (productId: number, imageIndex: number) => {
    try {
      await productManagementAPI.deleteProductImage(productId, imageIndex)

      // Refresh product to get updated image paths
      const product = await productManagementAPI.getProduct(productId)

      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? product : p)),
        selectedProduct: state.selectedProduct?.id === productId ? product : state.selectedProduct
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete image'
      })
      throw error
    }
  },

  uploadCategoryImage: async (categoryId: number, file: File) => {
    try {
      await productManagementAPI.uploadCategoryImage(categoryId, file)

      // Refresh category to get updated image path
      const category = await productManagementAPI.getCategory(categoryId)

      set((state) => ({
        categories: state.categories.map((c) => (c.id === categoryId ? category : c)),
        selectedCategory: state.selectedCategory?.id === categoryId ? category : state.selectedCategory
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload category image'
      })
      throw error
    }
  },

  deleteCategoryImage: async (categoryId: number) => {
    try {
      await productManagementAPI.deleteCategoryImage(categoryId)

      // Refresh category to get updated image path
      const category = await productManagementAPI.getCategory(categoryId)

      set((state) => ({
        categories: state.categories.map((c) => (c.id === categoryId ? category : c)),
        selectedCategory: state.selectedCategory?.id === categoryId ? category : state.selectedCategory
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category image'
      })
      throw error
    }
  },

  // ============================================================================
  // Barcode Lookup
  // ============================================================================

  lookupByBarcode: async (barcode: string) => {
    try {
      return await productManagementAPI.lookupByBarcode(barcode)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Product not found'
      })
      throw error
    }
  },

  // ============================================================================
  // Filter Actions
  // ============================================================================

  setFilters: (filters: Partial<ProductState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        productType: null,
        categoryId: null,
        isActive: null
      }
    })
  },

  // ============================================================================
  // Pagination Actions
  // ============================================================================

  setPagination: (pagination: Partial<ProductState['pagination']>) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination }
    }))
  },

  // ============================================================================
  // View Mode Actions
  // ============================================================================

  setViewMode: (mode: 'tile' | 'grid') => {
    set({ viewMode: mode })
  },

  // ============================================================================
  // Reset
  // ============================================================================

  reset: () => {
    set(initialState)
  }
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        viewMode: state.viewMode
      })
    }
  )
)

