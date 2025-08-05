import { ArrowRightIcon, ShieldCheckIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Tài khoản premium</span>{' '}
                  <span className="block text-primary-600 xl:inline">uy tín, giá tốt</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Khám phá bộ sưu tập tài khoản premium chất lượng cao cho YouTube Premium, ChatGPT Plus, Notion Pro và nhiều dịch vụ khác với giá cả phải chăng.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="/products"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Khám phá ngay
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Tại sao chọn chúng tôi</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ưu điểm vượt trội
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <dt className="text-lg leading-6 font-medium text-gray-900">Uy tín & Bảo mật</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Cam kết bảo mật thông tin khách hàng và cung cấp tài khoản chính hãng 100%.
                  </dd>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <dt className="text-lg leading-6 font-medium text-gray-900">Giá cả phải chăng</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Tiết kiệm đến 70% so với giá gốc, phù hợp với sinh viên và freelancer.
                  </dd>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <dt className="text-lg leading-6 font-medium text-gray-900">Giao hàng nhanh</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Nhận tài khoản ngay sau khi thanh toán thành công, hỗ trợ 24/7.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}