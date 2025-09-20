'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SimpleNavbar from '@/components/SimpleNavbar'
import InsightCards from './components/InsightCards'
import { aiInsightsEngine } from '@/lib/ai/insights'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'

export default function AIPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [insights, setInsights] = useState([])
    const [filter, setFilter] = useState('all')
    const [priority, setPriority] = useState('all')
    const [businessId, setBusinessId] = useState(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinessId()
        }
    }, [status, router, loadBusinessId])

    useEffect(() => {
        if (businessId) {
            loadInsights()
        }
    }, [businessId, loadInsights])

    const loadBusinessId = useCallback(async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
            setLoading(false)
        }
    }, [session?.user?.id])

    const loadInsights = useCallback(async () => {
        if (!businessId) return
        
        setLoading(true)
        
        try {
            // Load real data from database
            const [productsData, billsData, customersData] = await Promise.all([
                supabase.from('products').select('*').eq('business_id', businessId),
                supabase.from('bills').select('*').eq('business_id', businessId),
                supabase.from('customers').select('*').eq('business_id', businessId)
            ])

            if (productsData.error) throw productsData.error
            if (billsData.error) throw billsData.error
            if (customersData.error) throw customersData.error

            const businessData = {
                products: productsData.data || [],
                bills: billsData.data || [],
                customers: customersData.data || []
            }
            
            // Generate AI insights from real data
            const aiInsights = await aiInsightsEngine.generateInsights(businessData)
            setInsights(aiInsights)
            
        } catch (error) {
            console.error('Error loading insights:', error)
            // Fallback to sample data if real data fails
            const businessData = generateSampleBusinessData()
            const aiInsights = await aiInsightsEngine.generateInsights(businessData)
            setInsights(aiInsights)
        } finally {
            setLoading(false)
        }
    }, [businessId])

    const generateSampleBusinessData = () => {
        const now = new Date()
        
        // Generate sample products with various stock levels
        const products = [
            { id: '1', name: 'Wireless Headphones', stock_quantity: 3, min_stock_level: 10, price: 99.99, category: 'Electronics' },
            { id: '2', name: 'Laptop Stand', stock_quantity: 0, min_stock_level: 5, price: 49.99, category: 'Accessories' },
            { id: '3', name: 'Mechanical Keyboard', stock_quantity: 25, min_stock_level: 15, price: 149.99, category: 'Electronics' },
            { id: '4', name: 'Gaming Mouse', stock_quantity: 7, min_stock_level: 10, price: 79.99, category: 'Gaming' },
            { id: '5', name: 'USB-C Hub', stock_quantity: 0, min_stock_level: 8, price: 89.99, category: 'Accessories' },
            { id: '6', name: 'Monitor Stand', stock_quantity: 30, min_stock_level: 12, price: 129.99, category: 'Office' }
        ]

        // Generate sample bills
        const bills = []
        for (let i = 0; i < 25; i++) {
            const billDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            bills.push({
                id: `bill-${i}`,
                created_at: billDate.toISOString(),
                total_amount: Math.round(Math.random() * 500 + 50),
                customer_email: `customer${Math.floor(Math.random() * 10)}@example.com`,
                bill_items: [
                    {
                        product_id: products[Math.floor(Math.random() * products.length)].id,
                        quantity: Math.floor(Math.random() * 3) + 1,
                        price: products[Math.floor(Math.random() * products.length)].price
                    }
                ]
            })
        }

        // Generate sample customers
        const customers = []
        for (let i = 0; i < 12; i++) {
            customers.push({
                id: `customer-${i}`,
                email: `customer${i}@example.com`,
                name: `Customer ${i + 1}`
            })
        }

        return { products, bills, customers }
    }

    const handleInsightAction = (insight, action) => {
        console.log('Insight action:', action, insight)
        
        // Implement specific actions
        switch (action) {
            case 'reorder':
                alert(`Reordering ${insight.actionData.productName}: ${insight.actionData.suggestedOrder} units`)
                break
            case 'urgent_reorder':
                alert(`URGENT: Reordering ${insight.actionData.productName}: ${insight.actionData.suggestedOrder} units`)
                break
            case 'view_details':
                alert(`Viewing details for: ${insight.title}`)
                break
            case 're_engagement_campaign':
                alert(`Starting re-engagement campaign for ${insight.actionData.count} customers`)
                break
            default:
                console.log('Unknown action:', action)
        }
    }

    const filteredInsights = insights.filter(insight => {
        if (filter !== 'all' && insight.type !== filter) return false
        if (priority !== 'all' && insight.priority !== priority) return false
        return true
    })

    const insightTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'stock_alert', label: 'Stock Alerts' },
        { value: 'revenue_forecast', label: 'Revenue Forecast' },
        { value: 'customer_engagement', label: 'Customer Engagement' },
        { value: 'product_optimization', label: 'Product Optimization' }
    ]

    const priorityLevels = [
        { value: 'all', label: 'All Priorities' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ]

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
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="card">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
                        <p className="mt-2 text-gray-600">Smart recommendations powered by AI analysis of your business data</p>
                    </div>

                    {/* Filters */}
                    <div className="card mb-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Type:</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {insightTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Priority:</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {priorityLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Showing {filteredInsights.length} insights</span>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="space-y-6">
                        {filteredInsights.length > 0 ? (
                            <InsightCards 
                                insights={filteredInsights} 
                                onAction={handleInsightAction} 
                            />
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No insights found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try adjusting your filters or check back later for new insights.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* AI Engine Status */}
                    <div className="mt-8 card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">AI Engine Status</h3>
                                <p className="text-sm text-gray-600">
                                    Continuously analyzing your business data for actionable insights
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
