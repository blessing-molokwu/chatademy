import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import ModernButton from './ModernButton'

const AdvancedSearch = ({ 
  onSearch, 
  onFilterChange, 
  placeholder = "Search...",
  filters = {},
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    dateRange: '',
    author: '',
    tags: [],
    status: '',
    type: ''
  })
  const [searchHistory, setSearchHistory] = useState([])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        onSearch?.(searchTerm, activeFilters)
        
        // Add to search history
        if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
          setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 4)])
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, activeFilters, onSearch])

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters, [filterType]: value }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({
      dateRange: '',
      author: '',
      tags: [],
      status: '',
      type: ''
    })
    onFilterChange?.({})
  }

  const removeTag = (tagToRemove) => {
    const newTags = activeFilters.tags.filter(tag => tag !== tagToRemove)
    handleFilterChange('tags', newTags)
  }

  const addTag = (tag) => {
    if (tag && !activeFilters.tags.includes(tag)) {
      handleFilterChange('tags', [...activeFilters.tags, tag])
    }
  }

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-200"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
            hasActiveFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && searchTerm === '' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Searches</h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => setSearchTerm(term)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={activeFilters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">This quarter</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Author
              </label>
              <input
                type="text"
                placeholder="Author name"
                value={activeFilters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={activeFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="in-review">In Review</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TagIcon className="h-4 w-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {activeFilters.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTag(e.target.value.trim())
                  e.target.value = ''
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters && "Filters applied"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
