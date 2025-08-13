'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalProducts: number
  productsPerPage: number
}

export default function Pagination({
  currentPage,
  totalPages,
  totalProducts,
  productsPerPage,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updatePage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams)
    
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }, [router, searchParams])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isPending) {
      updatePage(page)
    }
  }

  const goToPrevious = () => {
    if (currentPage > 1 && !isPending) {
      updatePage(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages && !isPending) {
      updatePage(currentPage + 1)
    }
  }

  // Calculate start and end product numbers for current page
  const startProduct = (currentPage - 1) * productsPerPage + 1
  const endProduct = Math.min(currentPage * productsPerPage, totalProducts)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7 // Show max 7 page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages with ellipsis for large numbers
      if (currentPage <= 4) {
        // Near start: show 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near end: show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Results info */}
      <div className="text-sm text-gray-500">
        Hiển thị {startProduct}-{endProduct} trong tổng số {totalProducts} sản phẩm
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1 || isPending}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && currentPage > 1 ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
          {isPending && currentPage > 1 ? 'Đang tải...' : 'Trước'}
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? goToPage(page) : null}
              disabled={typeof page !== 'number' || isPending || page === currentPage}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                typeof page === 'number'
                  ? page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-white text-gray-400 border-gray-300 cursor-default'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={currentPage === totalPages || isPending}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && currentPage < totalPages ? (
            <>
              Đang tải...
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
            </>
          ) : (
            <>
              Tiếp
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Page info */}
      <div className="text-xs text-gray-400 flex items-center gap-2">
        <span>Trang {currentPage} / {totalPages}</span>
        {isPending && (
          <div className="flex items-center gap-1 text-blue-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            <span>Đang tải...</span>
          </div>
        )}
      </div>
    </div>
  )
} 