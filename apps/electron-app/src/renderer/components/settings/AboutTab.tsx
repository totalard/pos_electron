import { useAppStore } from '../../stores'

export function AboutTab() {
  const { theme } = useAppStore()

  const appInfo = {
    name: 'Nexed ERP',
    version: '1.0.0',
    buildDate: '2024-01-15',
    description: 'A comprehensive Enterprise Resource Planning system for modern businesses',
  }

  const features = [
    'Point of Sale (POS) System',
    'Inventory Management',
    'User Management & Access Control',
    'Multi-currency Support',
    'Tax Configuration',
    'Product & Service Management',
    'Sales Analytics & Reporting',
    'Dark Mode Support',
  ]

  const technologies = [
    { name: 'Electron', description: 'Cross-platform desktop framework' },
    { name: 'React', description: 'UI library' },
    { name: 'TypeScript', description: 'Type-safe JavaScript' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
    { name: 'Python FastAPI', description: 'Backend API framework' },
    { name: 'SQLite', description: 'Database engine' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`
          w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-primary-600 to-primary-800'
            : 'bg-gradient-to-br from-primary-500 to-primary-700'
          }
        `}>
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {appInfo.name}
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Version {appInfo.version}
        </p>
      </div>

      {/* Description */}
      <div className={`
        p-6 rounded-lg text-center
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {appInfo.description}
        </p>
      </div>

      {/* Features */}
      <div className={`
        p-6 rounded-lg
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Key Features
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 p-3 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-800/50'
                  : 'bg-white'
                }
              `}
            >
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className={`
        p-6 rounded-lg
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Built With
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-800/50'
                  : 'bg-white'
                }
              `}
            >
              <p className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {tech.name}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className={`
        p-6 rounded-lg
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          System Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Version
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {appInfo.version}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Build Date
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {appInfo.buildDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Platform
            </span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Electron Desktop
            </span>
          </div>
        </div>
      </div>

      {/* Credits & License */}
      <div className={`
        p-6 rounded-lg text-center
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Credits & License
        </h3>
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Developed with ❤️ by the Nexed Team
        </p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          © 2024 Nexed ERP. All rights reserved.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            This software is licensed for use by authorized users only.
          </p>
        </div>
      </div>

      {/* Support Links */}
      <div className="flex justify-center gap-4">
        <button
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Documentation
        </button>
        <button
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Support
        </button>
      </div>
    </div>
  )
}

