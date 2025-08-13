'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface OrdersHeaderProps {
  totalCount: number
  statusCounts: Record<string, number>
  searchParams?: {
    search?: string
    status?: string
    page?: string
    from?: string
    to?: string
  }
}

export default function OrdersHeader({ totalCount, statusCounts, searchParams }: OrdersHeaderProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams?.search || '')
  const [status, setStatus] = useState(searchParams?.status || 'all')
  const [from, setFrom] = useState(searchParams?.from || '')
  const [to, setTo] = useState(searchParams?.to || '')

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái', count: totalCount },
    { value: 'pending', label: 'Chờ xử lý', count: statusCounts.pending || 0 },
    { value: 'paid', label: 'Đã thanh toán', count: statusCounts.paid || 0 },
    { value: 'failed', label: 'Thất bại', count: statusCounts.failed || 0 },
    { value: 'cancelled', label: 'Đã hủy', count: statusCounts.cancelled || 0 },
  ]

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    
    if (value === 'all' || value === '') {
      params.delete(filterType)
    } else {
      params.set(filterType, value)
    }
    
    // Reset to page 1 when filtering
    params.delete('page')
    
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('search', search)
  }

  const handleDateFilter = () => {
    const params = new URLSearchParams(currentSearchParams.toString())
    
    if (from) {
      params.set('from', from)
    } else {
      params.delete('from')
    }
    
    if (to) {
      params.set('to', to)
    } else {
      params.delete('to')
    }
    
    // Reset to page 1 when filtering
    params.delete('page')
    
    router.push(`/admin/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setFrom('')
    setTo('')
    router.push('/admin/orders')
  }

  return (
    <div className="space-y-6">
      {/* Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý đơn hàng
          </h1>
          <p className="mt-2 text-gray-600">
            Theo dõi và xử lý tất cả đơn hàng. Tổng cộng {totalCount} đơn hàng.
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusOptions.map((option) => (
          <div
            key={option.value}
            className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-colors ${
              status === option.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setStatus(option.value)
              handleFilterChange('status', option.value)
            }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {option.count}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {option.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo ID đơn hàng, tên khách hàng..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDateFilter}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Áp dụng bộ lọc ngày
            </button>
            
            {(search || status !== 'all' || from || to) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Hiển thị {totalCount} đơn hàng
          </div>
        </div>
      </div>
    </div>
  )
}