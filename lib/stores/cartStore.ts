import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductPackage } from '@prisma/client'

export type CartItem = {
  id: string
  productId: string
  productPackageId?: string | null
  name: string
  description?: string
  price: number
  duration?: number // in months
  quantity: number
  imageUrl: string
  // Để lưu thông tin package nếu có
  packageInfo?: {
    duration: number
    description: string
    originalPrice: number
  }
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  getItemCount: (productId: string, productPackageId?: string | null) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        
        // Tìm item tương tự (cùng product và package)
        const existingItem = items.find((i) => 
          i.productId === item.productId && 
          i.productPackageId === item.productPackageId
        )
        
        if (existingItem) {
          // Cập nhật quantity nếu đã tồn tại
          get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity)
          return
        }
        
        // Thêm item mới
        const newItem: CartItem = {
          ...item,
          id: `${item.productId}-${item.productPackageId || 'default'}-${Date.now()}`
        }
        
        set({ items: [...items, newItem] })
      },
      
      removeItem: (id) => {
        set({ 
          items: get().items.filter((item) => item.id !== id) 
        })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      
      getItemCount: (productId: string, productPackageId?: string | null) => {
        const item = get().items.find((i) => 
          i.productId === productId && 
          i.productPackageId === productPackageId
        )
        return item?.quantity || 0
      },
    }),
    { 
      name: 'cart-storage',
      // Serialize and deserialize functions for proper persistence
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// Helper function để tạo CartItem từ Product và ProductPackage
export const createCartItem = (
  product: { id: string; name: string; price: number; imageUrl: string },
  quantity: number = 1,
  productPackage?: ProductPackage | null
): Omit<CartItem, 'id'> => {
  if (productPackage) {
    return {
      productId: product.id,
      productPackageId: productPackage.id,
      name: product.name,
      description: productPackage.description ?? undefined,
      price: productPackage.price,
      duration: productPackage.duration,
      quantity,
      imageUrl: product.imageUrl,
      packageInfo: {
        duration: productPackage.duration,
        description: productPackage.description ?? '',
        originalPrice: productPackage.price,
      }
    }
  }
  
  // Fallback to product without package
  return {
    productId: product.id,
    productPackageId: null,
    name: product.name,
    price: product.price,
    quantity,
    imageUrl: product.imageUrl,
  }
}