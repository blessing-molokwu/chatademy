import { useState } from 'react'

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glare = false,
  float = false,
  glow = false,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = `
    relative overflow-hidden
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700
    rounded-2xl
    shadow-card
    transition-all duration-300 ease-out
    ${hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''}
    ${float ? 'animate-float' : ''}
    ${glow ? 'hover:shadow-glow' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  return (
    <div 
      className={baseClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glare effect */}
      {glare && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-glare" />
        </div>
      )}
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ModernCard
