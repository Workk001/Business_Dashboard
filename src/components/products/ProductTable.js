'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProductCard } from './ProductCard'
import { getStockLevelColor, formatCurrency } from '@/lib/utils'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const ProductTable = ({ 
  products, 
  onEdit, 
  onDelete, 
  onView,
  onBulkSelect,
  selectedProducts = [],
  viewMode = 'table' // 'table' or 'card'
}) => {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  const handleEdit = (product) => {
    setEditingId(product.id)
    setEditData({
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category || '',
      brand: product.brand || '',
      sku: product.sku || ''
    })
  }

  const handleSave = (productId) => {
    onEdit?.({ ...editData, id: productId })
    setEditingId(null)
    setEditData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleBulkSelect = (productId, checked) => {
    if (onBulkSelect) {
      onBulkSelect(productId, checked)
    }
  }

  const isSelected = (productId) => selectedProducts.includes(productId)

  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={(e) => {
                    // Handle select all
                    products.forEach(product => {
                      handleBulkSelect(product.id, e.target.checked)
                    })
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => {
              const stockLevel = getStockLevelColor(product.stock_quantity, product.min_stock_level || 0)
              const isEditing = editingId === product.id
              
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected(product.id)}
                      onChange={(e) => handleBulkSelect(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.price}
                        onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.stock_quantity}
                        onChange={(e) => setEditData({...editData, stock_quantity: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {product.stock_quantity}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <Input
                        value={editData.category}
                        onChange={(e) => setEditData({...editData, category: e.target.value})}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {product.category || 'Uncategorized'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={stockLevel === 'red' ? 'danger' : 
                              stockLevel === 'yellow' ? 'warning' : 
                              stockLevel === 'orange' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {stockLevel === 'red' ? 'Out of Stock' :
                       stockLevel === 'yellow' ? 'Low Stock' :
                       stockLevel === 'orange' ? 'Medium Stock' :
                       'In Stock'}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView?.(product)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete?.(product)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { ProductTable }
