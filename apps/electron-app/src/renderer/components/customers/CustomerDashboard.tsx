import { useAppStore, useCustomerStore } from '../../stores'
import { Badge } from '../common'

export function CustomerDashboard() {
  const { theme } = useAppStore()
  const { customers } = useCustomerStore()

  // Calculate dashboard statistics
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.credit_balance === 0).length
  const customersWithCredit = customers.filter(c => c.credit_balance > 0).length
  const totalCreditBalance = customers.reduce((sum, c) => sum + c.credit_balance, 0)
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0)
  const avgLoyaltyPoints = totalCustomers > 0 ? Math.round(totalLoyaltyPoints / totalCustomers) : 0
  
  // Credit status breakdown
  const creditStatusBreakdown = {
    good: customers.filter(c => c.credit_status === 'good').length,
    warning: customers.filter(c => c.credit_status === 'warning').length,
    exceeded: customers.filter(c => c.credit_status === 'exceeded').length,
    blocked: customers.filter(c => c.credit_status === 'blocked').length
  }

  // Top customers by credit balance
  const topCreditCustomers = [...customers]
    .filter(c => c.credit_balance > 0)
    .sort((a, b) => b.credit_balance - a.credit_balance)
    .slice(0, 5)

  // Top customers by loyalty points
  const topLoyaltyCustomers = [...customers]
    .sort((a, b) => b.loyalty_points - a.loyalty_points)
    .slice(0, 5)

  const statCards = [
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-700',
      bgColor: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toLocaleString(),
      subtitle: `${totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% of total`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-700',
      bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
    },
    {
      title: 'Customers with Credit',
      value: customersWithCredit.toLocaleString(),
      subtitle: `${totalCustomers > 0 ? Math.round((customersWithCredit / totalCustomers) * 100) : 0}% of total`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-700',
      bgColor: theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50',
      alert: customersWithCredit > 0
    },
    {
      title: 'Total Credit Balance',
      value: `$${totalCreditBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'from-red-500 to-red-700',
      bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50',
      alert: totalCreditBalance > 0
    },
    {
      title: 'Total Loyalty Points',
      value: totalLoyaltyPoints.toLocaleString(),
      subtitle: `Avg: ${avgLoyaltyPoints} pts/customer`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-700',
      bgColor: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
    },
    {
      title: 'Credit Status Health',
      value: `${creditStatusBreakdown.good}`,
      subtitle: 'Good standing',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-700',
      bgColor: theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-xl p-6 transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70'
                : 'bg-white border border-gray-200 hover:shadow-lg'
              }
              ${stat.alert ? 'ring-2 ring-offset-2 ' + (theme === 'dark' ? 'ring-orange-500/50 ring-offset-gray-900' : 'ring-orange-500/30 ring-offset-white') : ''}
            `}
          >
            {/* Background Icon */}
            <div className={`absolute top-4 right-4 ${stat.bgColor} rounded-lg p-3`}>
              <div className={`text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}>
                {stat.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stat.subtitle}
                </p>
              )}
              {stat.alert && (
                <div className="mt-2 flex items-center gap-1 text-orange-600 dark:text-orange-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Needs Attention</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Credit Status Breakdown */}
      <div className={`
        rounded-xl p-6
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Credit Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Good Standing
              </span>
              <Badge variant="success">{creditStatusBreakdown.good}</Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCustomers > 0 ? (creditStatusBreakdown.good / totalCustomers) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Warning
              </span>
              <Badge variant="warning">{creditStatusBreakdown.warning}</Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCustomers > 0 ? (creditStatusBreakdown.warning / totalCustomers) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Exceeded
              </span>
              <Badge variant="danger">{creditStatusBreakdown.exceeded}</Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCustomers > 0 ? (creditStatusBreakdown.exceeded / totalCustomers) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Blocked
              </span>
              <Badge variant="danger">{creditStatusBreakdown.blocked}</Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCustomers > 0 ? (creditStatusBreakdown.blocked / totalCustomers) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Credit Customers */}
        <div className={`
          rounded-xl p-6
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Top Credit Balances
            </h3>
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {topCreditCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCreditCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-orange-400' : 'bg-orange-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {customer.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {customer.phone || customer.email || 'No contact'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">
                      ${customer.credit_balance.toFixed(2)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Limit: ${customer.credit_limit.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No customers with credit balance
            </p>
          )}
        </div>

        {/* Top Loyalty Customers */}
        <div className={`
          rounded-xl p-6
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Top Loyalty Members
            </h3>
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          {topLoyaltyCustomers.length > 0 ? (
            <div className="space-y-3">
              {topLoyaltyCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-purple-400' : 'bg-purple-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {customer.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {customer.phone || customer.email || 'No contact'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-500">
                      {customer.loyalty_points} pts
                    </p>
                    <Badge variant={customer.credit_status === 'good' ? 'success' : customer.credit_status === 'warning' ? 'warning' : 'danger'}>
                      {customer.credit_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No customers with loyalty points
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
