import { useState, useEffect } from 'react'
import { useAppStore } from '../stores'
import { dashboardAPI, DashboardStats, SessionTimelineData } from '../services/api'
import { DateRangePicker, DateRange, StatCard, SalesChart, ChartDataPoint, LoadingSpinner } from './common'
import { useCurrency } from '../hooks/useCurrency'

export function DashboardAnalytics() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sessionTimeline, setSessionTimeline] = useState<SessionTimelineData[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    preset: 'Last 7 Days'
  })

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const params = {
        start_date: dateRange.startDate?.toISOString(),
        end_date: dateRange.endDate?.toISOString()
      }

      const [statsData, timelineData] = await Promise.all([
        dashboardAPI.getStats(params),
        dashboardAPI.getSessionTimeline({ days: 7, include_closed: true })
      ])

      setStats(statsData)
      setSessionTimeline(timelineData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const salesTrendData: ChartDataPoint[] = stats.sales_trend.map(point => ({
    label: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.value,
    timestamp: new Date(point.timestamp)
  }))

  const hourlySalesData: ChartDataPoint[] = stats.hourly_sales.map(point => ({
    label: point.label,
    value: point.value
  }))

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Sales Metrics */}
      <div>
        <h2 className={`
          text-xl font-bold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Sales Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={formatCurrency(stats.sales_metrics.total_sales)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            subtitle={`${stats.sales_metrics.total_transactions} transactions`}
          />
          <StatCard
            title="Average Transaction"
            value={formatCurrency(stats.sales_metrics.average_transaction_value)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Total Tax"
            value={formatCurrency(stats.sales_metrics.total_tax)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="Total Discount"
            value={formatCurrency(stats.sales_metrics.total_discount)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            color="orange"
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h2 className={`
          text-xl font-bold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Payment Methods
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Cash Sales"
            value={formatCurrency(stats.sales_metrics.cash_sales)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Card Sales"
            value={formatCurrency(stats.sales_metrics.card_sales)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Other Methods"
            value={formatCurrency(stats.sales_metrics.other_sales)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="purple"
          />
        </div>
      </div>

      {/* Session & Product Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className={`
            text-xl font-bold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Sessions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Active Sessions"
              value={stats.session_metrics.active_sessions}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatCard
              title="Total Sessions"
              value={stats.session_metrics.total_sessions}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              title="Session Sales"
              value={formatCurrency(stats.session_metrics.total_session_sales)}
              color="indigo"
            />
            <StatCard
              title="Avg Session Value"
              value={formatCurrency(stats.session_metrics.average_session_value)}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h2 className={`
            text-xl font-bold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Inventory
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Products"
              value={stats.product_metrics.total_products}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              title="Active Products"
              value={stats.product_metrics.active_products}
              color="green"
            />
            <StatCard
              title="Low Stock"
              value={stats.product_metrics.low_stock_count}
              alert={stats.product_metrics.low_stock_count > 0}
              color="yellow"
            />
            <StatCard
              title="Out of Stock"
              value={stats.product_metrics.out_of_stock_count}
              alert={stats.product_metrics.out_of_stock_count > 0}
              color="red"
            />
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div>
        <h2 className={`
          text-xl font-bold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Customers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Customers"
            value={stats.customer_metrics.total_customers}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="New Today"
            value={stats.customer_metrics.new_customers_today}
            color="green"
          />
          <StatCard
            title="With Credit"
            value={stats.customer_metrics.customers_with_credit}
            color="orange"
          />
          <StatCard
            title="Credit Balance"
            value={formatCurrency(stats.customer_metrics.total_credit_balance)}
            alert={stats.customer_metrics.total_credit_balance > 0}
            color="red"
          />
          <StatCard
            title="Loyalty Points"
            value={stats.customer_metrics.total_loyalty_points.toLocaleString()}
            color="purple"
          />
        </div>
      </div>

      {/* Sales Trend Chart */}
      <SalesChart
        data={salesTrendData}
        title="Sales Trend"
        type="line"
        height={300}
        formatValue={(v) => formatCurrency(v)}
      />

      {/* Hourly Sales Chart */}
      <SalesChart
        data={hourlySalesData}
        title="Sales by Hour"
        type="bar"
        height={300}
        color="#10B981"
        formatValue={(v) => formatCurrency(v)}
      />

      {/* Session Timeline */}
      {sessionTimeline.length > 0 && (
        <div>
          <h2 className={`
            text-xl font-bold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Sales by Session Timeline
          </h2>
          <div className="space-y-4">
            {sessionTimeline.map((session) => {
              const sessionSalesData: ChartDataPoint[] = session.sales_data.map(point => ({
                label: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                value: point.value,
                timestamp: new Date(point.timestamp)
              }))

              return (
                <div
                  key={session.session_id}
                  className={`
                    rounded-lg p-4 border
                    ${theme === 'dark' 
                      ? 'bg-gray-800/30 border-gray-700' 
                      : 'bg-white border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`
                        font-semibold
                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                      `}>
                        {session.session_number}
                      </h3>
                      <p className={`
                        text-sm
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {new Date(session.opened_at).toLocaleString()} 
                        {session.closed_at && ` - ${new Date(session.closed_at).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`
                        text-lg font-bold
                        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                      `}>
                        {formatCurrency(session.total_sales)}
                      </p>
                      <p className={`
                        text-sm
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {session.transaction_count} transactions
                      </p>
                    </div>
                  </div>
                  {sessionSalesData.length > 0 && (
                    <SalesChart
                      data={sessionSalesData}
                      title=""
                      type="line"
                      height={150}
                      showGrid={false}
                      color={session.is_active ? '#10B981' : '#6B7280'}
                      formatValue={(v) => formatCurrency(v)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className={`
          rounded-xl p-6 border
          ${theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <h3 className={`
            text-lg font-semibold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Top Products
          </h3>
          <div className="space-y-3">
            {stats.top_products.slice(0, 5).map((product, index) => (
              <div
                key={product.product_id}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {product.product_name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {product.quantity_sold} sold
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className={`
          rounded-xl p-6 border
          ${theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <h3 className={`
            text-lg font-semibold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Top Customers
          </h3>
          <div className="space-y-3">
            {stats.top_customers.slice(0, 5).map((customer, index) => (
              <div
                key={customer.customer_id}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {customer.customer_name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {customer.transaction_count} transactions
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(customer.total_spent)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
