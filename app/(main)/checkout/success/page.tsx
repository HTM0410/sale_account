import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thanh toán thành công - Premium Account Marketplace',
  description: 'Đơn hàng của bạn đã được xử lý thành công',
}

interface SuccessPageProps {
  searchParams: {
    order_id?: string
  }
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  // Check authentication
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  const orderId = searchParams.order_id

  // Get order information if order_id is provided
  let order = null
  if (orderId) {
    try {
      order = await prisma.order.findUnique({
        where: { 
          id: orderId,
          userId: session.user.id || '',
        },
        include: {
          items: {
            include: {
              product: true,
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Đơn hàng #{order.id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {order.status === 'paid' ? 'Đã thanh toán' : order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Sản phẩm đã mua:</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(order.total)}đ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Bước tiếp theo:</h3>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tài khoản premium sẽ được giao trong vòng 5 phút
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Kiểm tra email để nhận thông tin tài khoản
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xem lịch sử đơn hàng trong tài khoản của bạn
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ? 
              <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500 ml-1">
                Liên hệ với chúng tôi
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}