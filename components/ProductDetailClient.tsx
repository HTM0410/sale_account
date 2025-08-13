'use client'

import { useState } from 'react'
import { ProductPackage } from '@prisma/client'
import ProductPackageList from './ProductPackageList'
import AddToCartButton from './AddToCartButton'

interface ProductDetailClientProps {
  packages: ProductPackage[]
  productId: string
  productName: string
  productPrice: number
  productImageUrl: string
  available: boolean
  stock: number
}

export default function ProductDetailClient({ 
  packages, 
  productId, 
  productName, 
  productPrice, 
  productImageUrl, 
  available, 
  stock 
}: ProductDetailClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(
    packages.length > 0 ? packages[0] : null
  )

  const handlePackageSelect = (packageData: ProductPackage) => {
    setSelectedPackage(packageData)
  }

  return (
    <>
      {/* Product Packages */}
      <div className="mt-8">
        <ProductPackageList 
          packages={packages} 
          onPackageSelect={handlePackageSelect}
        />
      </div>

      {/* Add to cart */}
      <div className="mt-10 flex sm:flex-col1">
        <AddToCartButton 
          productId={productId}
          productName={productName}
          productPrice={productPrice}
          productImageUrl={productImageUrl}
          available={available}
          stock={stock}
          selectedPackage={selectedPackage}
        />
      </div>
    </>
  )
}