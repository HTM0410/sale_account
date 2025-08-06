'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UsersHeaderProps {
  totalCount: number
  roleCounts: Record<string, number>
  searchParams?: {
    search?: string
    role?: string
    page?: string
    from?: string
    to?: string
  }
}

export default function UsersHeader({ totalCount, roleCounts, searchParams }: UsersHeaderProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams?.search || '')
  const [role, setRole] = useState(searchParams?.role || 'all')
  const [from, setFrom] = useState(searchParams?.from || '')
  const [to, setTo] = useState(searchParams?.to || '')

  const roleOptions = [
    { value: 'all', label: 'Tất cả vai trò', count: totalCount },
    { value: 'user', label: 'Người dùng', count: roleCounts.user || 0 },
    { value: 'admin', label: 'Quản trị viên', count: roleCounts.admin || 0 },
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
    
    router.push(`/admin/users?${params.toString()}`)
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
    
    router.push(`/admin/users?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setRole('all')
    setFrom('')
    setTo('')
    router.push('/admin/users')
  }

  return (
    <div className="space-y-6">
      {/* Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý tất cả tài khoản người dùng. Tổng cộng {totalCount} người dùng.
          </p>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleOptions.map((option) => (
          <div
            key={option.value}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-colors ${
              role === option.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setRole(option.value)
              handleFilterChange('role', option.value)
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  option.value === 'admin' ? 'bg-red-100' : 
                  option.value === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {option.value === 'admin' ? (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) : option.value === 'user' ? (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {option.count}
                </div>
                <div className="text-sm text-gray-600">
                  {option.label}
                </div>
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
                  placeholder="Tìm theo tên, email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đăng ký từ ngày
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
            
            {(search || role !== 'all' || from || to) && (
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
            Hiển thị {totalCount} người dùng
          </div>
        </div>
      </div>
    </div>
  )
}