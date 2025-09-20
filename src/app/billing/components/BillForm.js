'use client'

import { useState, useEffect } from 'react'

export default function BillForm({ bill, products, onSubmit, onCancel, businessId }) {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        tax_rate: 0,
        discount_rate: 0,
        notes: '',
        due_date: '',
        status: 'draft'
    })
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (bill) {
            setFormData({
                customer_name: bill.customer_name || '',
                customer_email: bill.customer_email || '',
                customer_phone: bill.customer_phone || '',
                customer_address: bill.customer_address || {
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: ''
                },
                tax_rate: bill.tax_rate || 0,
                discount_rate: bill.discount_rate || 0,
                notes: bill.notes || '',
                due_date: bill.due_date || '',
                status: bill.status || 'draft'
            })
            setItems(bill.bill_items || [])
        }
    }, [bill])

    const addItem = () => {
        setItems([...items, {
            product_id: '',
            product_name: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            total_price: 0
        }])
    }

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index, field, value) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        
        // If product is selected, update product details
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_name: product.name,
                    unit_price: product.price
                }
            }
        }
        
        // Calculate total price
        if (field === 'quantity' || field === 'unit_price') {
            const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity
            const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : newItems[index].unit_price
            newItems[index].total_price = quantity * unitPrice
        }
        
        setItems(newItems)
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0)
        const taxAmount = subtotal * (formData.tax_rate / 100)
        const discountAmount = subtotal * (formData.discount_rate / 100)
        const total = subtotal + taxAmount - discountAmount

        return { subtotal, taxAmount, discountAmount, total }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { subtotal, taxAmount, discountAmount, total } = calculateTotals()
            
            const submitData = {
                ...formData,
                subtotal,
                tax_amount: taxAmount,
                discount_amount: discountAmount,
                total_amount: total,
                items: items.filter(item => item.product_id && item.quantity > 0)
            }

            await onSubmit(submitData)
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleAddressChange = (field, value) => {
        setFormData({
            ...formData,
            customer_address: {
                ...formData.customer_address,
                [field]: value
            }
        })
    }

    const { subtotal, taxAmount, discountAmount, total } = calculateTotals()

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
                {bill ? 'Edit Bill' : 'Create New Bill'}
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                id="customer_name"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter customer name"
                            />
                        </div>
                        <div>
                            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="customer_email"
                                name="customer_email"
                                value={formData.customer_email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="customer@example.com"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="customer_phone"
                            name="customer_phone"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>

                {/* Bill Items */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-gray-900">Bill Items</h4>
                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Add Item
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No items added. Click &quot;Add Item&quot; to start.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product
                                            </label>
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select product</option>
                                                {products.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} - ${product.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit Price
                                            </label>
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total
                                            </label>
                                            <input
                                                type="text"
                                                value={`$${item.total_price.toFixed(2)}`}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bill Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Rate (%)
                        </label>
                        <input
                            type="number"
                            id="tax_rate"
                            name="tax_rate"
                            value={formData.tax_rate}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="discount_rate" className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Rate (%)
                        </label>
                        <input
                            type="number"
                            id="discount_rate"
                            name="discount_rate"
                            value={formData.discount_rate}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            id="due_date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Subtotal:</span>
                            <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tax ({formData.tax_rate}%):</span>
                            <span className="text-sm font-medium">${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Discount ({formData.discount_rate}%):</span>
                            <span className="text-sm font-medium">-${discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold text-gray-900">Total:</span>
                                <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || items.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (bill ? 'Update Bill' : 'Create Bill')}
                    </button>
                </div>
            </form>
        </div>
    )
}
