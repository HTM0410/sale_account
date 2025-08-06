import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lỗi thanh toán - Premium Account Marketplace', 
  description: 'Có lỗi xảy ra trong quá trình thanh toán',
}

interface ErrorPageProps {
  searchParams: {
    error?: string
    redirect_status?: string
  }
}

export default async function CheckoutErrorPage({ searchParams }: ErrorPageProps) {
  const session = await getServerSession(authOptions)
  
  const error = searchParams.error
  const redirectStatus = searchParams.redirect_status

  // Determine error message based on error type
  let errorTitle = 'Thanh toán không thành công'
  let errorMessage = 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'
  let errorDetail = ''

  if (redirectStatus) {
    switch (redirectStatus) {
      case 'failed':
        errorTitle = 'Thanh toán thất bại'
        errorMessage = 'Giao dịch thanh toán không thể hoàn tất. Thẻ của bạn có thể đã bị từ chối.'
        errorDetail = 'Vui lòng kiểm tra thông tin thẻ và thử lại, hoặc sử dụng phương thức thanh toán khác.'
        break
      case 'canceled':
        errorTitle = 'Thanh toán đã hủy'
        errorMessage = 'Bạn đã hủy quá trình thanh toán.'
        errorDetail = 'Giỏ hàng của bạn vẫn được lưu. Bạn có thể quay lại bất cứ lúc nào để hoàn tất đơn hàng.'
        break
      default:
        break
    }
  }

  if (error) {
    switch (error) {
      case 'card_declined':
        errorTitle = 'Thẻ bị từ chối'
        errorMessage = 'Ngân hàng đã từ chối giao dịch này.'
        errorDetail = 'Vui lòng liên hệ ngân hàng của bạn hoặc thử sử dụng thẻ khác.'
        break
      case 'insufficient_funds':
        errorTitle = 'Số dư không đủ'
        errorMessage = 'Tài khoản của bạn không có đủ số dư để thực hiện giao dịch.'
        errorDetail = 'Vui lòng kiểm tra số dư tài khoản hoặc sử dụng thẻ khác.'
        break
      case 'expired_card':
        errorTitle = 'Thẻ đã hết hạn'
        errorMessage = 'Thẻ tín dụng của bạn đã hết hạn.'
        errorDetail = 'Vui lòng sử dụng thẻ khác hoặc liên hệ ngân hàng để gia hạn.'
        break
      case 'processing_error':
        errorTitle = 'Lỗi xử lý'
        errorMessage = 'Đã xảy ra lỗi kỹ thuật trong quá trình xử lý thanh toán.'
        errorDetail = 'Vui lòng thử lại sau ít phút. Nếu vấn đề vẫn tiếp tục, hãy liên hệ hỗ trợ.'
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {errorTitle}
            </h1>
            <p className="text-gray-600 mb-2">
              {errorMessage}
            </p>
            {errorDetail && (
              <p className="text-sm text-gray-500">
                {errorDetail}
              </p>
            )}
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-red-800">
                <h3 className="font-semibold mb-2">Những gì bạn có thể làm:</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Kiểm tra thông tin thẻ tín dụng và thử lại</li>
                  <li>Đảm bảo thẻ có đủ số dư và chưa hết hạn</li>
                  <li>Thử sử dụng phương thức thanh toán khác</li>
                  <li>Liên hệ ngân hàng nếu vấn đề vẫn tiếp diễn</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What happens to cart */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <h3 className="font-semibold mb-1">Đừng lo lắng!</h3>
                <p>Giỏ hàng của bạn vẫn được lưu. Không có khoản nào được tính phí và bạn có thể thử thanh toán lại bất cứ lúc nào.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Thử thanh toán lại
              </Link>
            ) : (
              <Link
                href="/signin?callbackUrl=/checkout"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Đăng nhập để thanh toán
              </Link>
            )}
            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Quay lại giỏ hàng
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
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn giải quyết mọi vấn đề thanh toán.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@example.com" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Gửi email hỗ trợ
                </a>
                <a 
                  href="tel:+841234567890" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Gọi hotline
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}