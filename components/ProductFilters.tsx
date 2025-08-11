'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'

interface ProductFiltersProps {
  categories: string[]
  currentCategory?: string
  currentSearch?: string
  currentMin?: string
  currentMax?: string
}

export default function ProductFilters({
  categories,
  currentCategory,
  currentSearch,
  currentMin,
  currentMax,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch || '')
  const [isPending, startTransition] = useTransition()
  const [minPrice, setMinPrice] = useState<string>(currentMin || '')
  const [maxPrice, setMaxPrice] = useState<string>(currentMax || '')

  const updateFilters = useCallback((updates: { category?: string; search?: string; min?: string; max?: string; clear?: boolean }) => {
    const params = new URLSearchParams(searchParams)
    
    if (updates.clear) {
      params.delete('category')
      params.delete('search')
      params.delete('min')
      params.delete('max')
    } else {
      if (updates.category !== undefined) {
        if (updates.category) {
          params.set('category', updates.category)
        } else {
          params.delete('category')
        }
      }
      
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set('search', updates.search)
        } else {
          params.delete('search')
        }
      }

      if (updates.min !== undefined) {
        if (updates.min) {
          params.set('min', updates.min)
        } else {
          params.delete('min')
        }
      }

      if (updates.max !== undefined) {
        if (updates.max) {
          params.set('max', updates.max)
        } else {
          params.delete('max')
        }
      }
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleCategoryChange = (category: string) => {
    updateFilters({ category: category === currentCategory ? '' : category })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchValue })
  }

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ min: minPrice, max: maxPrice })
  }

  const clearAllFilters = () => {
    setSearchValue('')
    updateFilters({ clear: true })
  }

  const hasActiveFilters = currentCategory || currentSearch || currentMin || currentMax

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 py-2">Danh mục:</span>
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              !currentCategory
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              disabled={isPending}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors disabled:opacity-50 ${
                currentCategory === category
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Price Range */}
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Giá:</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Từ"
            value={minPrice}
            onChange={(e)=>setMinPrice(e.target.value)}
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Đến"
            value={maxPrice}
            onChange={(e)=>setMaxPrice(e.target.value)}
            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Áp dụng
          </button>
        </form>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            disabled={isPending}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
            {currentCategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Danh mục: {currentCategory}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tìm kiếm: &quot;{currentSearch}&quot;
                <button
                  onClick={() => {
                    setSearchValue('')
                    updateFilters({ search: '' })
                  }}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {(currentMin || currentMax) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Giá: {currentMin ? `${currentMin}đ` : '0đ'} - {currentMax ? `${currentMax}đ` : '∞'}
                <button
                  onClick={() => {
                    setMinPrice('')
                    setMaxPrice('')
                    updateFilters({ min: '', max: '' })
                  }}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}