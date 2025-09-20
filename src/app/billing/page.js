'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import SimpleNavbar from '@/components/SimpleNavbar'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'

export default function BillingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [bills, setBills] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [businessId, setBusinessId] = useState(null)
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        items: [{ product_id: '', quantity: 1, price: 0, name: '' }],
        discount: 0,
        tax: 0,
        notes: ''
    })

    const loadBusinessId = useCallback(async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
            setLoading(false)
        }
    }, [session?.user?.id])

    const loadData = useCallback(async () => {
        if (!businessId) return
        
        setLoading(true)
        try {
            // Load bills and products with specific column selection
            const [billsData, productsData] = await Promise.all([
                supabase
                    .from('bills')
                    .select(`
                        id,
                        business_id,
                        created_by,
                        customer_name,
                        customer_email,
                        customer_phone,
                        subtotal,
                        discount_rate,
                        discount_amount,
                        tax_rate,
                        tax_amount,
                        total_amount,
                        notes,
                        status,
                        bill_items,
                        created_at,
                        updated_at
                    `)
                    .eq('business_id', businessId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('products')
                    .select(`
                        id,
                        business_id,
                        created_by,
                        name,
                        price,
                        stock_quantity,
                        category,
                        description,
                        sku,
                        brand,
                        min_stock_level,
                        created_at,
                        updated_at
                    `)
                    .eq('business_id', businessId)
            ])

            if (billsData.error) throw billsData.error
            if (productsData.error) throw productsData.error

            setBills(billsData.data || [])
            setProducts(productsData.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
            setBills([])
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [businessId])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinessId()
        }
    }, [status, router, loadBusinessId])

    useEffect(() => {
        if (businessId) {
            loadData()
        }
    }, [businessId, loadData])

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: 1, price: 0, name: '' }]
        })
    }

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items]
        newItems[index][field] = value
        
        // If product_id changed, update name and price
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === value)
            if (selectedProduct) {
                newItems[index].name = selectedProduct.name
                newItems[index].price = selectedProduct.price
            }
        }
        
        setFormData({ ...formData, items: newItems })
    }

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index)
        setFormData({ ...formData, items: newItems })
    }

    const calculateTotal = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        const discountAmount = (subtotal * formData.discount) / 100
        const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100
        return subtotal - discountAmount + taxAmount
    }

    const handleView = (bill) => {
        // For now, show bill details in an alert
        // Later this can be expanded to show a modal or navigate to a detail page
        const billDetails = `
Bill #: ${bill.invoice_number || bill.id}
Customer: ${bill.customer_name}
Email: ${bill.customer_email || 'N/A'}
Phone: ${bill.customer_phone || 'N/A'}
Subtotal: ₹${bill.subtotal?.toLocaleString() || '0'}
Discount: ${bill.discount_rate}% (₹${bill.discount_amount?.toLocaleString() || '0'})
Tax: ${bill.tax_rate}% (₹${bill.tax_amount?.toLocaleString() || '0'})
Total: ₹${bill.total_amount?.toLocaleString() || '0'}
Status: ${bill.status}
Notes: ${bill.notes || 'N/A'}
Created: ${new Date(bill.created_at).toLocaleString()}
        `.trim()
        
        alert(billDetails)
    }

    const handlePrint = (bill) => {
        // Create a simple print-friendly version
        const printContent = `
            <html>
                <head>
                    <title>Bill - ${bill.invoice_number || bill.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .bill-info { margin-bottom: 20px; }
                        .items { margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total { text-align: right; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INVOICE</h1>
                        <p>Bill #: ${bill.invoice_number || bill.id}</p>
                    </div>
                    
                    <div class="bill-info">
                        <h3>Bill To:</h3>
                        <p><strong>${bill.customer_name}</strong></p>
                        ${bill.customer_email ? `<p>Email: ${bill.customer_email}</p>` : ''}
                        ${bill.customer_phone ? `<p>Phone: ${bill.customer_phone}</p>` : ''}
                    </div>
                    
                    <div class="items">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bill.bill_items?.map(item => `
                                    <tr>
                                        <td>${item.product_name}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.price}</td>
                                        <td>₹${item.total}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4">No items</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="total">
                        <p>Subtotal: ₹${bill.subtotal?.toLocaleString() || '0'}</p>
                        <p>Discount (${bill.discount_rate}%): -₹${bill.discount_amount?.toLocaleString() || '0'}</p>
                        <p>Tax (${bill.tax_rate}%): ₹${bill.tax_amount?.toLocaleString() || '0'}</p>
                        <p><strong>Total: ₹${bill.total_amount?.toLocaleString() || '0'}</strong></p>
                    </div>
                    
                    ${bill.notes ? `<div><h3>Notes:</h3><p>${bill.notes}</p></div>` : ''}
                    
                    <div style="margin-top: 30px; text-align: center; color: #666;">
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </body>
            </html>
        `
        
        const printWindow = window.open('', '_blank')
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
    }

    const handleDelete = async (billId) => {
        if (confirm('Are you sure you want to delete this bill?')) {
            try {
                const { error } = await supabase
                    .from('bills')
                    .delete()
                    .eq('id', billId)
                
                if (error) throw error
                
                loadData()
                alert('Bill deleted successfully!')
            } catch (error) {
                console.error('Error deleting bill:', error)
                alert('Error deleting bill')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!businessId) {
            alert('No business found. Please set up a business first.')
            return
        }

        // Validate form data
        if (!formData.customer_name.trim()) {
            alert('Please enter customer name.')
            return
        }

        if (formData.items.length === 0 || formData.items.every(item => !item.product_id)) {
            alert('Please add at least one item to the bill.')
            return
        }

        // Validate items
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i]
            if (!item.product_id) {
                alert(`Please select a product for item ${i + 1}.`)
                return
            }
            if (!item.quantity || item.quantity <= 0) {
                alert(`Please enter a valid quantity for item ${i + 1}.`)
                return
            }
        }

        try {
            console.log('Preparing to create bill...')

            // Ensure all numeric values are properly handled
            const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
            const discountRate = Number(formData.discount) || 0
            const taxRate = Number(formData.tax) || 0
            const discountAmount = (subtotal * discountRate) / 100
            const taxAmount = ((subtotal - discountAmount) * taxRate) / 100
            const totalAmount = subtotal - discountAmount + taxAmount

            const billData = {
                business_id: businessId,
                created_by: session.user.id,
                customer_name: formData.customer_name.trim(),
                customer_email: formData.customer_email?.trim() || null,
                customer_phone: formData.customer_phone?.trim() || null,
                subtotal: Number(subtotal.toFixed(2)),
                discount_rate: Number(discountRate.toFixed(2)),
                discount_amount: Number(discountAmount.toFixed(2)),
                tax_rate: Number(taxRate.toFixed(2)),
                tax_amount: Number(taxAmount.toFixed(2)),
                total_amount: Number(totalAmount.toFixed(2)),
                notes: formData.notes?.trim() || null,
                status: 'draft',
                bill_items: formData.items.map(item => ({
                    product_id: item.product_id,
                    product_name: item.name,
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    total: Number((item.quantity * item.price).toFixed(2))
                }))
            }

            console.log('Attempting to create bill with data:', billData)

            const { data, error } = await supabase
                .from('bills')
                .insert(billData)
                .select()

            console.log('Supabase response:', { data, error })

            if (error) throw error

            setShowForm(false)
            setFormData({
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                items: [{ product_id: '', quantity: 1, price: 0, name: '' }],
                discount: 0,
                tax: 0,
                notes: ''
            })
            
            // Reload bills
            loadData()
            alert('Bill created successfully!')
        } catch (error) {
            console.error('Error creating bill:', error)
            console.error('Error type:', typeof error)
            console.error('Error constructor:', error.constructor.name)
            console.error('Error stringified:', JSON.stringify(error, null, 2))
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                stack: error.stack
            })
            
            // More detailed error message
            let errorMessage = 'Unknown error occurred'
            if (error.message) {
                errorMessage = error.message
            } else if (error.details) {
                errorMessage = error.details
            } else if (error.hint) {
                errorMessage = error.hint
            }
            
            alert(`Error creating bill: ${errorMessage}`)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SimpleNavbar />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="card">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
                            <p className="mt-2 text-gray-600">Create and manage invoices</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary"
                        >
                            Create Bill
                        </button>
                    </div>

                    {/* Create Bill Form */}
                    {showForm && (
                        <div className="card mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Bill</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.customer_phone}
                                            onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Bill Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-md font-medium text-gray-900">Items</h3>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="btn-secondary text-sm"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product
                                                    </label>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        className="input-field"
                                                        required
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map(product => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name} - ₹{product.price}
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
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                        className="input-field"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unit Price
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                        className="input-field"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Total
                                                    </label>
                                                    <div className="input-field bg-gray-50">
                                                        ₹{(item.quantity * item.price).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="btn-secondary text-sm w-full"
                                                        disabled={formData.items.length === 1}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Discount and Tax */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.discount || 0}
                                            onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tax (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tax || 0}
                                            onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="input-field"
                                        rows={3}
                                        placeholder="Additional notes for this bill..."
                                    />
                                </div>

                                {/* Total */}
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Total: ₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button type="submit" className="btn-primary">
                                        Create Bill
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Bills List */}
                    <div className="card">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Bills</h2>
                        {bills.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No bills</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating your first bill.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="btn-primary"
                                    >
                                        Create Bill
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Bill #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
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
                                        {bills.map((bill) => (
                                            <tr key={bill.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {bill.invoice_number || `#${bill.id.slice(-8)}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {bill.customer_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(bill.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{bill.total_amount?.toLocaleString() || '0'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {bill.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleView(bill)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePrint(bill)}
                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                    >
                                                        Print
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(bill.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}