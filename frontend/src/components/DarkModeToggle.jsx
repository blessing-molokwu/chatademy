import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useDarkMode } from '../contexts/DarkModeContext'

const DarkModeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative p-2 rounded-xl
        bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <SunIcon 
          className={`
            absolute inset-0 w-6 h-6 
            transition-all duration-300 ease-out
            ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `} 
        />
        
        {/* Moon Icon */}
        <MoonIcon 
          className={`
            absolute inset-0 w-6 h-6 
            transition-all duration-300 ease-out
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `} 
        />
      </div>
    </button>
  )
}

export default DarkModeToggle
