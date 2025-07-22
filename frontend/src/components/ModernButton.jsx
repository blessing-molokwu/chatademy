import { useState } from 'react'

const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  glare = true,
  glow = false,
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-indigo-600 
      hover:from-blue-700 hover:to-indigo-700
      text-white shadow-lg
      ${glow ? 'hover:shadow-glow' : ''}
    `,
    secondary: `
      bg-white dark:bg-gray-800 
      border border-gray-300 dark:border-gray-600
      text-gray-700 dark:text-gray-300
      hover:bg-gray-50 dark:hover:bg-gray-700
    `,
    ghost: `
      bg-transparent 
      text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-800
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-pink-600
      hover:from-red-700 hover:to-pink-700
      text-white shadow-lg
    `
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const baseClasses = `
    relative overflow-hidden
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-300 ease-out
    transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Glare effect */}
      {glare && isHovered && !disabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glare" />
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  )
}

export default ModernButton
