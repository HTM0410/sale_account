export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  originalPrice: number
  stock: number
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  products: {
    productId: string
    quantity: number
    price: number
  }[]
  total: number
  status: 'pending' | 'paid' | 'delivered' | 'cancelled'
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AccountDelivery {
  id: string
  orderId: string
  credentials: string
  deliveryStatus: 'pending' | 'delivered'
  sentAt?: Date
  createdAt: Date
}