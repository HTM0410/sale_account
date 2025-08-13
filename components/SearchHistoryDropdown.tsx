'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface SearchHistoryItem {
  id: string
  query: string
  filters: {
    category?: string
    min?: string
    max?: string
    sort?: string
  }
  createdAt: string
}

interface SearchHistoryDropdownProps {
  onApplySearch: (_query: string, _filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

export default function SearchHistoryDropdown({
  onApplySearch,
  isOpen,
  onToggle
}: SearchHistoryDropdownProps) {
  const { data: session } = useSession()
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch search history
  const fetchSearchHistory = useCallback(async () => {
    if (!session?.user) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/search/history')
      if (response.ok) {
        const data = await response.json()
        setSearchHistory(data.searchHistory || [])
      } else {
        throw new Error('Failed to fetch search history')
      }
    } catch (error) {
      console.error('Error fetching search history:', error)
      setError('Không thể tải lịch sử tìm kiếm')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user])

  // Delete specific search history item
  const deleteSearchHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/search/history?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setSearchHistory(prev => prev.filter(item => item.id !== id))
      } else {
        throw new Error('Failed to delete search history item')
      }
    } catch (error) {
      console.error('Error deleting search history:', error)
      // Optionally show user notification here
    }
  }

  // Clear all search history
  const clearAllHistory = async () => {
    try {
      const response = await fetch('/api/search/history', {
        method: 'DELETE'
      })
      if (response.ok) {
        setSearchHistory([])
      } else {
        throw new Error('Failed to clear search history')
      }
    } catch (error) {
      console.error('Error clearing search history:', error)
      // Optionally show user notification here
    }
  }

  // Apply search from history
  const applySearch = (item: SearchHistoryItem) => {
    onApplySearch(item.query, item.filters)
    onToggle() // Close dropdown
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vừa xong'
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Fetch search history when dropdown opens
      fetchSearchHistory()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle, fetchSearchHistory])

  // Separate effect for fetching when session changes
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchSearchHistory()
    }
  }, [session?.user, isOpen, fetchSearchHistory])

  if (!session?.user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search History Icon */}
      <button
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        title="Lịch sử tìm kiếm"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Lịch sử tìm kiếm</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Chưa có lịch sử tìm kiếm</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => applySearch(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            &quot;{item.query}&quot;
                          </span>
                          {item.filters.category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.filters.category}
                            </span>
                          )}
                        </div>
                        
                        {/* Filters summary */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.filters.min && item.filters.max && (
                            <span className="text-xs text-gray-500">
                              Giá: {item.filters.min}đ - {item.filters.max}đ
                            </span>
                          )}
                          {item.filters.sort && item.filters.sort !== 'created_desc' && (
                            <span className="text-xs text-gray-500">
                              Sắp xếp: {getSortDisplayName(item.filters.sort)}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSearchHistory(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-600 transition-all"
                        title="Xóa khỏi lịch sử"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get display name for sort options
function getSortDisplayName(sort: string): string {
  switch (sort) {
    case 'price_asc':
      return 'Giá: thấp → cao'
    case 'price_desc':
      return 'Giá: cao → thấp'
    case 'name_asc':
      return 'Tên: A → Z'
    case 'name_desc':
      return 'Tên: Z → A'
    case 'created_asc':
      return 'Cũ nhất'
    case 'created_desc':
      return 'Mới nhất'
    default:
      return 'Mới nhất'
  }
} 