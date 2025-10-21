/**
 * Custom SVG illustrations for walkthrough steps
 * Theme-aware, responsive, and modern minimalist design
 */

interface IllustrationProps {
  theme: 'light' | 'dark'
  className?: string
}

/**
 * Welcome illustration - Lightning bolt with sparkles
 */
export function WelcomeIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  const secondaryColor = theme === 'dark' ? '#34D399' : '#10B981'
  const accentColor = theme === 'dark' ? '#F59E0B' : '#F59E0B'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'} opacity="0.5" />
      
      {/* Lightning bolt */}
      <path
        d="M110 40L70 100H100L90 160L130 100H100L110 40Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Sparkles */}
      <path d="M150 50L155 60L160 50L155 40L150 50Z" fill={accentColor} />
      <path d="M40 70L45 80L50 70L45 60L40 70Z" fill={secondaryColor} />
      <path d="M160 130L165 140L170 130L165 120L160 130Z" fill={secondaryColor} />
      <path d="M30 140L35 150L40 140L35 130L30 140Z" fill={accentColor} />
    </svg>
  )
}

/**
 * Dashboard illustration - Grid layout with cards
 */
export function DashboardIllustration({ theme, className = '' }: IllustrationProps) {
  const cardColor = theme === 'dark' ? '#374151' : '#E5E7EB'
  const accentColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x="20" y="20" width="160" height="160" rx="12" fill={theme === 'dark' ? '#1F2937' : '#F9FAFB'} />
      
      {/* Grid cards */}
      <rect x="35" y="35" width="60" height="60" rx="8" fill={cardColor} />
      <rect x="105" y="35" width="60" height="60" rx="8" fill={accentColor} opacity="0.8" />
      <rect x="35" y="105" width="60" height="60" rx="8" fill={cardColor} />
      <rect x="105" y="105" width="60" height="60" rx="8" fill={cardColor} />
      
      {/* Icons on cards */}
      <circle cx="65" cy="65" r="8" fill={accentColor} opacity="0.5" />
      <circle cx="135" cy="65" r="8" fill="white" opacity="0.9" />
      <circle cx="65" cy="135" r="8" fill={accentColor} opacity="0.5" />
      <circle cx="135" cy="135" r="8" fill={accentColor} opacity="0.5" />
    </svg>
  )
}

/**
 * Sales illustration - Shopping cart with items
 */
export function SalesIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  const secondaryColor = theme === 'dark' ? '#34D399' : '#10B981'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="100" cy="100" r="85" fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'} opacity="0.5" />
      
      {/* Cart body */}
      <path
        d="M50 60L60 60L70 120H140L150 60H160"
        stroke={primaryColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Cart items */}
      <rect x="75" y="70" width="20" height="30" rx="4" fill={secondaryColor} />
      <rect x="100" y="65" width="20" height="35" rx="4" fill={primaryColor} />
      <rect x="125" y="75" width="20" height="25" rx="4" fill={secondaryColor} />
      
      {/* Wheels */}
      <circle cx="85" cy="135" r="8" fill={primaryColor} stroke={primaryColor} strokeWidth="2" />
      <circle cx="125" cy="135" r="8" fill={primaryColor} stroke={primaryColor} strokeWidth="2" />
      
      {/* Handle */}
      <path d="M50 60L45 40L55 40" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Products illustration - Box/package with layers
 */
export function ProductsIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#8B5CF6' : '#7C3AED'
  const secondaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="100" cy="100" r="85" fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'} opacity="0.5" />
      
      {/* 3D Box */}
      {/* Top face */}
      <path d="M100 50L150 75L100 100L50 75L100 50Z" fill={primaryColor} opacity="0.9" />
      
      {/* Left face */}
      <path d="M50 75L50 125L100 150L100 100L50 75Z" fill={primaryColor} opacity="0.6" />
      
      {/* Right face */}
      <path d="M100 100L100 150L150 125L150 75L100 100Z" fill={primaryColor} opacity="0.8" />
      
      {/* Center line */}
      <line x1="100" y1="50" x2="100" y2="100" stroke="white" strokeWidth="2" opacity="0.5" />
      
      {/* Decorative elements */}
      <circle cx="75" cy="87" r="4" fill={secondaryColor} />
      <circle cx="125" cy="87" r="4" fill={secondaryColor} />
    </svg>
  )
}

/**
 * Customers illustration - People/users group
 */
export function CustomersIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#F59E0B' : '#F59E0B'
  const secondaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  const tertiaryColor = theme === 'dark' ? '#34D399' : '#10B981'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="100" cy="100" r="85" fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'} opacity="0.5" />
      
      {/* Center person (larger) */}
      <circle cx="100" cy="80" r="18" fill={primaryColor} />
      <path d="M70 130C70 115 83 105 100 105C117 105 130 115 130 130V145H70V130Z" fill={primaryColor} />
      
      {/* Left person */}
      <circle cx="60" cy="90" r="14" fill={secondaryColor} opacity="0.8" />
      <path d="M40 130C40 118 48 110 60 110C72 110 80 118 80 130V140H40V130Z" fill={secondaryColor} opacity="0.8" />
      
      {/* Right person */}
      <circle cx="140" cy="90" r="14" fill={tertiaryColor} opacity="0.8" />
      <path d="M120 130C120 118 128 110 140 110C152 110 160 118 160 130V140H120V130Z" fill={tertiaryColor} opacity="0.8" />
    </svg>
  )
}

/**
 * Settings illustration - Gear with tools
 */
export function SettingsIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#6366F1' : '#4F46E5'
  const secondaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="100" cy="100" r="85" fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'} opacity="0.5" />
      
      {/* Main gear */}
      <circle cx="100" cy="100" r="35" fill={primaryColor} />
      <circle cx="100" cy="100" r="20" fill={theme === 'dark' ? '#1F2937' : '#FFFFFF'} />
      
      {/* Gear teeth */}
      <rect x="95" y="55" width="10" height="15" rx="2" fill={primaryColor} />
      <rect x="95" y="130" width="10" height="15" rx="2" fill={primaryColor} />
      <rect x="55" y="95" width="15" height="10" rx="2" fill={primaryColor} />
      <rect x="130" y="95" width="15" height="10" rx="2" fill={primaryColor} />
      
      {/* Diagonal teeth */}
      <rect x="70" y="70" width="10" height="15" rx="2" fill={primaryColor} transform="rotate(-45 75 77.5)" />
      <rect x="120" y="70" width="10" height="15" rx="2" fill={primaryColor} transform="rotate(45 125 77.5)" />
      <rect x="70" y="115" width="10" height="15" rx="2" fill={primaryColor} transform="rotate(45 75 122.5)" />
      <rect x="120" y="115" width="10" height="15" rx="2" fill={primaryColor} transform="rotate(-45 125 122.5)" />
      
      {/* Small gear */}
      <circle cx="145" cy="65" r="18" fill={secondaryColor} />
      <circle cx="145" cy="65" r="10" fill={theme === 'dark' ? '#1F2937' : '#FFFFFF'} />
      <rect x="142" y="45" width="6" height="8" rx="1" fill={secondaryColor} />
      <rect x="142" y="73" width="6" height="8" rx="1" fill={secondaryColor} />
      <rect x="127" y="62" width="8" height="6" rx="1" fill={secondaryColor} />
      <rect x="155" y="62" width="8" height="6" rx="1" fill={secondaryColor} />
    </svg>
  )
}

/**
 * Success/Complete illustration - Checkmark with celebration
 */
export function SuccessIllustration({ theme, className = '' }: IllustrationProps) {
  const primaryColor = theme === 'dark' ? '#34D399' : '#10B981'
  const accentColor = theme === 'dark' ? '#F59E0B' : '#F59E0B'
  const secondaryColor = theme === 'dark' ? '#60A5FA' : '#3B82F6'
  
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="100" cy="100" r="85" fill={primaryColor} opacity="0.1" />
      <circle cx="100" cy="100" r="60" fill={primaryColor} opacity="0.2" />
      
      {/* Checkmark circle */}
      <circle cx="100" cy="100" r="45" fill={primaryColor} />
      
      {/* Checkmark */}
      <path
        d="M75 100L90 115L125 80"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Celebration confetti */}
      <circle cx="50" cy="50" r="4" fill={accentColor} />
      <circle cx="150" cy="50" r="4" fill={secondaryColor} />
      <circle cx="40" cy="100" r="3" fill={secondaryColor} />
      <circle cx="160" cy="100" r="3" fill={accentColor} />
      <circle cx="50" cy="150" r="4" fill={secondaryColor} />
      <circle cx="150" cy="150" r="4" fill={accentColor} />
      
      {/* Stars */}
      <path d="M60 40L62 46L68 46L63 50L65 56L60 52L55 56L57 50L52 46L58 46L60 40Z" fill={accentColor} />
      <path d="M140 40L142 46L148 46L143 50L145 56L140 52L135 56L137 50L132 46L138 46L140 40Z" fill={secondaryColor} />
    </svg>
  )
}

