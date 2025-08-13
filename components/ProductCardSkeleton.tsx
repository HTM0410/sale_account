export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Description skeleton */}
        <div className="h-3 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
        
        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
} 