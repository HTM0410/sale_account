import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import CredentialDeliveryForm from '@/components/admin/CredentialDeliveryForm'

interface DeliverPageProps {
  params: {
    id: string
  }
}

export default async function DeliverPage({ params }: DeliverPageProps) {
  // Check authentication
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/signin')
  }

  // Check admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id || session.user.email || '' },
    select: { role: true }
  })

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get order details
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              description: true
            }
          }
        }
      },
      accountDelivery: true
    }
  })

  if (!order) {
    redirect('/admin/orders')
  }

  // Check if order is paid
  if (order.status !== 'paid') {
    redirect('/admin/orders')
  }

  const productName = order.items[0]?.product.name || 'Unknown Product'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Giao thông tin tài khoản
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Đơn hàng #{order.id} - {productName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Khách hàng</p>
              <p className="font-medium text-gray-900">{order.user.name || order.user.email}</p>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin đơn hàng
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Chi tiết sản phẩm</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-sm text-gray-600">{item.product.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.quantity} x {item.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin thanh toán</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tổng tiền:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.total.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đã thanh toán
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ngày đặt:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery status */}
          {order.accountDelivery && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Thông tin tài khoản đã được giao
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Đã giao vào: {order.accountDelivery.sentAt ? new Date(order.accountDelivery.sentAt).toLocaleString('vi-VN') : 'Chưa xác định'}<br/>
                      Ghi chú: {order.accountDelivery.deliveryNotes || 'Không có ghi chú'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery form */}
        <CredentialDeliveryForm 
          orderId={order.id}
          productName={productName}
        />
      </div>
    </div>
  )
} 