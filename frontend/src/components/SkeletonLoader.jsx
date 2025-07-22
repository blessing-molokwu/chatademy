const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '',
  animate = true 
}) => {
  const baseClasses = `
    bg-gray-200 dark:bg-gray-700 rounded-2xl
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `

  const skeletonTypes = {
    card: (
      <div className={`${baseClasses} p-6 space-y-4`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
        </div>
      </div>
    ),
    
    list: (
      <div className={`${baseClasses} p-4`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      </div>
    ),
    
    stat: (
      <div className={`${baseClasses} p-6`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          </div>
        </div>
      </div>
    ),
    
    text: (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
      </div>
    ),
    
    button: (
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse w-24" />
    ),
    
    avatar: (
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    ),
    
    table: (
      <div className={`${baseClasses} p-6 space-y-4`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const skeleton = skeletonTypes[type] || skeletonTypes.card

  if (count === 1) {
    return skeleton
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {skeleton}
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader
