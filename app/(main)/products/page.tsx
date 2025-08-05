export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: 'YouTube Premium',
      description: 'Trải nghiệm YouTube không quảng cáo, tải video offline',
      price: 49000,
      originalPrice: 179000,
      image: '/images/youtube-premium.jpg',
      category: 'Giải trí',
    },
    {
      id: 2,
      name: 'ChatGPT Plus',
      description: 'Truy cập GPT-4, phản hồi nhanh hơn, ưu tiên sử dụng',
      price: 399000,
      originalPrice: 599000,
      image: '/images/chatgpt-plus.jpg',
      category: 'AI & Công cụ',
    },
    {
      id: 3,
      name: 'Notion Pro',
      description: 'Workspace không giới hạn, tính năng nâng cao',
      price: 99000,
      originalPrice: 299000,
      image: '/images/notion-pro.jpg',
      category: 'Năng suất',
    },
  ]

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Sản phẩm của chúng tôi</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Khám phá bộ sưu tập tài khoản premium chất lượng cao với giá tốt nhất
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-200 aspect-w-1 aspect-h-1 rounded-t-lg overflow-hidden group-hover:opacity-75">
                <div className="w-full h-full object-center object-cover bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{product.name}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {product.category}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  <a href={`/products/${product.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500">{product.description}</p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {product.originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tiết kiệm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
                <button className="mt-4 w-full btn-primary">
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}