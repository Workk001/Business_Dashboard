'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getStockLevelColor, formatCurrency } from '@/lib/utils'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CubeIcon 
} from '@heroicons/react/24/outline'

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onView,
  index = 0 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const stockLevel = getStockLevelColor(product.stock_quantity, product.min_stock_level || 0)
  
  const stockBadgeVariants = {
    red: 'danger',
    yellow: 'warning', 
    orange: 'warning',
    green: 'success'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="relative overflow-hidden group"
        hover
      >
        {/* Stock Level Indicator */}
        <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-t-[20px] border-l-transparent ${
          stockLevel === 'red' ? 'border-t-red-500' :
          stockLevel === 'yellow' ? 'border-t-yellow-500' :
          stockLevel === 'orange' ? 'border-t-orange-500' :
          'border-t-green-500'
        }`} />
        
        <div className="p-6">
          {/* Product Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category || 'Uncategorized'}</p>
              </div>
            </div>
            
            <Badge 
              variant={stockBadgeVariants[stockLevel] || 'default'}
              size="sm"
            >
              {stockLevel === 'red' ? 'Out of Stock' :
               stockLevel === 'yellow' ? 'Low Stock' :
               stockLevel === 'orange' ? 'Medium Stock' :
               'In Stock'}
            </Badge>
          </div>

          {/* Product Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock</span>
              <span className="text-sm font-medium text-gray-900">
                {product.stock_quantity} units
              </span>
            </div>
            
            {product.brand && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Brand</span>
                <span className="text-sm text-gray-900">{product.brand}</span>
              </div>
            )}
            
            {product.sku && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SKU</span>
                <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Action Buttons */}
          <motion.div 
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(product)}
              className="flex-1"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(product)}
              className="flex-1"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(product)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

export { ProductCard }
