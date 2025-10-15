import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../stores'
import { Navbar } from './Navbar'
import { ProductsTab } from './inventory/ProductsTab'
import { CategoriesTab } from './inventory/CategoriesTab'
import { TaxRatesTab } from './inventory/TaxRatesTab'
import { AttributesTab } from './inventory/AttributesTab'
import { InventoryAdjustmentsTab } from './inventory/InventoryAdjustmentsTab'

interface InventoryManagementProps {
  onBack: () => void
  onLogout?: () => void
}

type InventoryTab = 'products' | 'categories' | 'tax-rates' | 'attributes' | 'adjustments'

export function InventoryManagement({ onBack, onLogout }: InventoryManagementProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [activeTab, setActiveTab] = useState<InventoryTab>('products')



  const tabs = [
    {
      id: 'products' as const,
      name: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      description: 'Manage products, variations, and bundles'
    },
    {
      id: 'categories' as const,
      name: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'Organize products with hierarchical categories'
    },
    {
      id: 'tax-rates' as const,
      name: 'Tax Rates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Configure tax rates and HSN codes'
    },
    {
      id: 'attributes' as const,
      name: 'Attributes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      description: 'Define product attributes for variations'
    },
    {
      id: 'adjustments' as const,
      name: 'Adjustments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h2z" />
        </svg>
      ),
      description: 'Track inventory adjustments and movements'
    }
  ]

  return (
    <div className={`
      min-h-screen
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Navigation */}
      <Navbar 
        title="Inventory Management"
        subtitle="Comprehensive product and inventory control"
        onBack={onBack}
        onLogout={onLogout}
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="w-full px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className={`
              ${theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-white border border-gray-200'
              }
              rounded-xl p-6
            `}>
              <h2 className={`
                text-lg font-semibold mb-6
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Inventory Modules
              </h2>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-200
                      ${activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                          : 'bg-primary-50 border border-primary-200 text-primary-700'
                        : theme === 'dark'
                          ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white border border-transparent'
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 mt-0.5
                      ${activeTab === tab.id
                        ? theme === 'dark'
                          ? 'text-primary-400'
                          : 'text-primary-600'
                        : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }
                    `}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium mb-1
                        ${activeTab === tab.id
                          ? theme === 'dark'
                            ? 'text-primary-300'
                            : 'text-primary-700'
                          : theme === 'dark'
                            ? 'text-gray-200'
                            : 'text-gray-900'
                        }
                      `}>
                        {tab.name}
                      </div>
                      <div className={`
                        text-sm
                        ${activeTab === tab.id
                          ? theme === 'dark'
                            ? 'text-primary-400/80'
                            : 'text-primary-600/80'
                          : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }
                      `}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`
                  text-sm font-medium mb-4
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Products
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Categories
                    </span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Low Stock Items
                    </span>
                    <span className={`text-sm font-medium text-yellow-500`}>
                      0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Out of Stock
                    </span>
                    <span className={`text-sm font-medium text-red-500`}>
                      0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className={`
              ${theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-white border border-gray-200'
              }
              rounded-xl min-h-[800px]
            `}>
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'tax-rates' && <TaxRatesTab />}
              {activeTab === 'attributes' && <AttributesTab />}
              {activeTab === 'adjustments' && <InventoryAdjustmentsTab />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
