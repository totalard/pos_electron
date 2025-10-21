import { useAppStore, useCustomerStore } from '../../stores'
import { Badge } from '../common'

export function CustomerAnalytics() {
  const { theme } = useAppStore()
  const { customers } = useCustomerStore()

  // Calculate analytics data
  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.credit_balance, 0)
  const avgCreditBalance = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0)

  // Customer acquisition trend (mock data - would come from API in real app)
  const monthlyAcquisition = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 32 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 35 }
  ]

  // Credit utilization analysis
  const creditUtilization = customers.map(c => ({
    name: c.name,
    utilization: c.credit_limit > 0 ? (c.credit_balance / c.credit_limit) * 100 : 0,
    balance: c.credit_balance,
    limit: c.credit_limit
  })).sort((a, b) => b.utilization - a.utilization).slice(0, 10)

  // Loyalty engagement
  const loyaltyTiers = [
    { tier: 'Bronze', range: '0-100', count: customers.filter(c => c.loyalty_points >= 0 && c.loyalty_points < 100).length },
    { tier: 'Silver', range: '100-500', count: customers.filter(c => c.loyalty_points >= 100 && c.loyalty_points < 500).length },
    { tier: 'Gold', range: '500-1000', count: customers.filter(c => c.loyalty_points >= 500 && c.loyalty_points < 1000).length },
    { tier: 'Platinum', range: '1000+', count: customers.filter(c => c.loyalty_points >= 1000).length }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Avg Credit Balance
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ${avgCreditBalance.toFixed(2)}
          </p>
        </div>

        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Revenue (Credit)
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Active Loyalty Members
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {customers.filter(c => c.loyalty_points > 0).length}
          </p>
        </div>

        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Avg Loyalty Points
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {totalCustomers > 0 ? Math.round(totalLoyaltyPoints / totalCustomers) : 0}
          </p>
        </div>
      </div>

      {/* Customer Acquisition Trend */}
      <div className={`
        p-6 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Customer Acquisition Trend
        </h3>
        <div className="space-y-3">
          {monthlyAcquisition.map((data, index) => {
            const maxCount = Math.max(...monthlyAcquisition.map(d => d.count))
            const percentage = (data.count / maxCount) * 100
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {data.month}
                  </span>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {data.count} customers
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Utilization */}
        <div className={`
          p-6 rounded-xl
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Top Credit Utilization
          </h3>
          {creditUtilization.length > 0 ? (
            <div className="space-y-3">
              {creditUtilization.map((item, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg
                    ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                    <Badge variant={item.utilization > 90 ? 'danger' : item.utilization > 70 ? 'warning' : 'success'}>
                      {item.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      ${item.balance.toFixed(2)} / ${item.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.utilization > 90 ? 'bg-red-500' :
                        item.utilization > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No credit utilization data available
            </p>
          )}
        </div>

        {/* Loyalty Tiers */}
        <div className={`
          p-6 rounded-xl
          ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Loyalty Program Distribution
          </h3>
          <div className="space-y-4">
            {loyaltyTiers.map((tier, index) => {
              const colors = ['from-amber-700 to-amber-900', 'from-gray-400 to-gray-600', 'from-yellow-400 to-yellow-600', 'from-purple-500 to-purple-700']
              const bgColors = ['bg-amber-500/10', 'bg-gray-500/10', 'bg-yellow-500/10', 'bg-purple-500/10']
              
              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg
                    ${theme === 'dark' ? bgColors[index] : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index]}`} />
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {tier.tier}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tier.range} points
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tier.count}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {totalCustomers > 0 ? ((tier.count / totalCustomers) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-500`}
                      style={{ width: `${totalCustomers > 0 ? (tier.count / totalCustomers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className={`
        p-6 rounded-xl
        ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}
      `}>
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Key Insights
            </h4>
            <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• {customers.filter(c => c.credit_status === 'exceeded').length} customers have exceeded their credit limit</li>
              <li>• {customers.filter(c => c.loyalty_points >= 1000).length} customers are in the Platinum loyalty tier</li>
              <li>• Average credit utilization is {totalCustomers > 0 ? ((customers.reduce((sum, c) => sum + (c.credit_limit > 0 ? (c.credit_balance / c.credit_limit) : 0), 0) / totalCustomers) * 100).toFixed(1) : 0}%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
