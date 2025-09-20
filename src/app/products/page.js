'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import SimpleNavbar from '@/components/SimpleNavbar'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'
import { 
  PlusIcon, 
  ViewColumnsIcon, 
  Squares2X2Icon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function ProductsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [businessId, setBusinessId] = useState(null)
    const [viewMode, setViewMode] = useState('table') // 'table' or 'card'
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([])
    const [filterCategory, setFilterCategory] = useState('all')
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock_quantity: '',
        category: '',
        description: '',
        sku: '',
        brand: ''
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinessId()
        }
    }, [status, router, loadBusinessId])

    useEffect(() => {
        if (businessId) {
            loadProducts()
        }
    }, [businessId, loadProducts])

    const loadBusinessId = useCallback(async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
            setLoading(false)
        }
    }, [session?.user?.id])

    const loadProducts = useCallback(async () => {
        if (!businessId) return
        
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })

            if (error) throw error

            setProducts(data || [])
        } catch (error) {
            console.error('Error loading products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [businessId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!businessId) {
            alert('No business found. Please set up a business first.')
            return
        }

        try {
            const productData = {
                business_id: businessId,
                created_by: session.user.id,
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                category: formData.category,
                description: formData.description,
                sku: formData.sku,
                brand: formData.brand,
                min_stock_level: 0
            }

            const { error } = await supabase
                .from('products')
                .insert(productData)

            if (error) throw error

            setShowForm(false)
            setFormData({ 
                name: '', 
                price: '', 
                stock_quantity: '', 
                category: '', 
                description: '',
                sku: '',
                brand: ''
            })
            
            // Reload products
            loadProducts()
            alert('Product added successfully!')
        } catch (error) {
            console.error('Error adding product:', error)
            alert('Error adding product. Please try again.')
        }
    }

    const handleEdit = async (productData) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: productData.name,
                    price: productData.price,
                    stock_quantity: productData.stock_quantity,
                    category: productData.category,
                    brand: productData.brand,
                    sku: productData.sku
                })
                .eq('id', productData.id)

            if (error) throw error

            loadProducts()
            alert('Product updated successfully!')
        } catch (error) {
            console.error('Error updating product:', error)
            alert('Error updating product. Please try again.')
        }
    }

    const handleDelete = async (product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id)

            if (error) throw error

            loadProducts()
            alert('Product deleted successfully!')
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Error deleting product. Please try again.')
        }
    }

    const handleBulkSelect = (productId, checked) => {
        if (checked) {
            setSelectedProducts([...selectedProducts, productId])
        } else {
            setSelectedProducts(selectedProducts.filter(id => id !== productId))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return
        
        if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedProducts)

            if (error) throw error

            setSelectedProducts([])
            loadProducts()
            alert(`${selectedProducts.length} products deleted successfully!`)
        } catch (error) {
            console.error('Error deleting products:', error)
            alert('Error deleting products. Please try again.')
        }
    }

    // Filter products based on search and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory
        
        return matchesSearch && matchesCategory
    })

    // Get unique categories for filter
    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SimpleNavbar />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <LoadingCard key={i} />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SimpleNavbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                                <p className="mt-2 text-gray-600">Manage your product inventory</p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <Button onClick={() => setShowForm(true)}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Filters and Controls */}
                        <Card>
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                                    {/* Search */}
                                    <div className="flex-1 max-w-md">
                                        <div className="relative">
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="flex items-center space-x-4">
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category === 'all' ? 'All Categories' : category}
                                                </option>
                                            ))}
                                        </select>

                                        {/* View Mode Toggle */}
                                        <div className="flex border border-gray-300 rounded-md">
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                            >
                                                <ViewColumnsIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('card')}
                                                className={`p-2 ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                            >
                                                <Squares2X2Icon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                {selectedProducts.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-blue-800">
                                                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                                            </span>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={handleBulkDelete}
                                                >
                                                    Delete Selected
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedProducts([])}
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </Card>

                        {/* Add Product Form */}
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card>
                                    <div className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h2>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Price *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Stock Quantity *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.stock_quantity}
                                                        onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="e.g., Electronics, Food, Clothing"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        SKU
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.sku}
                                                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Product SKU"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Brand
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.brand}
                                                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Brand name"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex space-x-4">
                                                <Button type="submit">
                                                    Add Product
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => setShowForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Products List */}
                        <Card>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Product Inventory ({filteredProducts.length})
                                    </h2>
                                </div>
                                
                                {filteredProducts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchTerm || filterCategory !== 'all' 
                                                ? 'Try adjusting your search or filters.' 
                                                : 'Get started by adding your first product.'
                                            }
                                        </p>
                                        {!searchTerm && filterCategory === 'all' && (
                                            <div className="mt-6">
                                                <Button onClick={() => setShowForm(true)}>
                                                    Add Product
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <ProductTable
                                        products={filteredProducts}
                                        viewMode={viewMode}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onBulkSelect={handleBulkSelect}
                                        selectedProducts={selectedProducts}
                                    />
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}