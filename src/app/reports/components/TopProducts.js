'use client'

import { useState, useEffect } from 'react'

export default function TopProducts({ data, title = "Top Products" }) {
    const [products, setProducts] = useState([])
    const [sortBy, setSortBy] = useState('revenue')
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        if (data && data.length > 0) {
            setProducts(data)
        } else {
            // Generate sample data
            const sampleProducts = generateSampleProducts()
            setProducts(sampleProducts)
        }
    }, [data])

    const generateSampleProducts = () => {
        const productNames = [
            'Wireless Headphones', 'Laptop Stand', 'Mechanical Keyboard', 'Gaming Mouse',
            'USB-C Hub', 'Monitor Stand', 'Desk Lamp', 'Cable Organizer',
            'Bluetooth Speaker', 'Phone Case', 'Screen Protector', 'Power Bank'
        ]
        
        return productNames.map((name, index) => ({
            id: `product-${index + 1}`,
            name,
            category: ['Electronics', 'Accessories', 'Gaming', 'Office'][index % 4],
            revenue: Math.round(Math.random() * 5000 + 1000),
            unitsSold: Math.round(Math.random() * 100 + 10),
            profit: Math.round(Math.random() * 1500 + 300),
            growth: (Math.random() - 0.5) * 40, // -20% to +20%
            stock: Math.round(Math.random() * 50 + 5)
        }))
    }

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'revenue':
                // For real products, use price * stock_quantity as revenue proxy
                const revenueA = (a.price || 0) * (a.stock_quantity || 0)
                const revenueB = (b.price || 0) * (b.stock_quantity || 0)
                return revenueB - revenueA
            case 'units':
                return (b.stock_quantity || 0) - (a.stock_quantity || 0)
            case 'profit':
                // Use price as profit proxy for now
                return (b.price || 0) - (a.price || 0)
            case 'growth':
                // No growth data available, sort by price
                return (b.price || 0) - (a.price || 0)
            default:
                return 0
        }
    })

    const formatCurrency = (value) => {
        if (value === undefined || value === null || isNaN(value)) return '₹0'
        return `₹${Number(value).toLocaleString()}`
    }
    const formatGrowth = (value) => {
        if (value === undefined || value === null || isNaN(value)) return <span className="text-gray-500">N/A</span>
        const color = value >= 0 ? 'text-green-600' : 'text-red-600'
        const sign = value >= 0 ? '+' : ''
        return <span className={color}>{sign}{Number(value).toFixed(1)}%</span>
    }

    const getStockStatus = (stock) => {
        if (stock <= 5) return { text: 'Low Stock', color: 'text-red-600 bg-red-100' }
        if (stock <= 15) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' }
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="flex space-x-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="revenue">Sort by Value</option>
                        <option value="units">Sort by Stock Quantity</option>
                        <option value="profit">Sort by Price</option>
                        <option value="growth">Sort by Price</option>
                    </select>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value (Price × Stock)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedProducts.slice(0, 10).map((product) => {
                            const stockStatus = getStockStatus(product.stock_quantity || product.stock)
                            return (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {product.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency((product.price || 0) * (product.stock_quantity || 0))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.stock_quantity || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-900">{product.stock_quantity || 0}</span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                                {stockStatus.text}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                View
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by adding some products to see analytics.</p>
                </div>
            )}
        </div>
    )
}
