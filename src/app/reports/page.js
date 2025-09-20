'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SimpleNavbar from '@/components/SimpleNavbar'
import SalesChart from './components/SalesChart'
import TopProducts from './components/TopProducts'
import ExportButtons from './components/ExportButtons'
import InsightCards from '../ai/components/InsightCards'
import { aiInsightsEngine } from '@/lib/ai/insights'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'

export default function ReportsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [insights, setInsights] = useState([])
    const [chartData, setChartData] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [businessId, setBusinessId] = useState(null)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBills: 0,
        totalProducts: 0,
        averageOrderValue: 0
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinessId()
        }
    }, [status, router])

    useEffect(() => {
        if (businessId) {
            loadData()
        }
    }, [businessId])

    const loadBusinessId = async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
            setLoading(false)
        }
    }

    const loadData = async () => {
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

            const products = productsData.data || []
            const bills = billsData.data || []
            const customers = customersData.data || []

            // Generate chart data from real bills
            const chartData = generateChartDataFromBills(bills)
            setChartData(chartData)

            // Calculate real stats
            const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
            const averageOrderValue = bills.length > 0 ? totalRevenue / bills.length : 0
            
            setStats({
                totalRevenue,
                totalBills: bills.length,
                totalProducts: products.length,
                averageOrderValue
            })

            // Generate top products from real data
            const topProductsData = generateTopProducts(products)
            setTopProducts(topProductsData)
            
            // Generate AI insights from real data
            const businessData = { products, bills, customers }
            const aiInsights = await aiInsightsEngine.generateInsights(businessData)
            setInsights(aiInsights)
            
        } catch (error) {
            console.error('Error loading data:', error)
            // Fallback to sample data if real data fails
            const sampleData = generateSampleData()
            setChartData(sampleData.chartData)
            setStats(sampleData.stats)
            setTopProducts(sampleData.products.slice(0, 5))
        } finally {
            setLoading(false)
        }
    }

    const generateChartDataFromBills = (bills) => {
        const chartData = []
        const now = new Date()
        
        // Group bills by date for the last 30 days
        const billsByDate = {}
        bills.forEach(bill => {
            const billDate = new Date(bill.created_at).toISOString().split('T')[0]
            if (!billsByDate[billDate]) {
                billsByDate[billDate] = { revenue: 0, orders: 0 }
            }
            billsByDate[billDate].revenue += bill.total_amount || 0
            billsByDate[billDate].orders += 1
        })
        
        // Generate chart data for last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dateStr = date.toISOString().split('T')[0]
            const dayData = billsByDate[dateStr] || { revenue: 0, orders: 0 }
            
            chartData.push({
                date: dateStr,
                revenue: dayData.revenue,
                orders: dayData.orders,
                profit: Math.round(dayData.revenue * 0.3),
                customers: dayData.orders
            })
        }
        
        return chartData
    }

    const generateTopProducts = (products) => {
        return products
            .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
            .slice(0, 5)
            .map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                stock_quantity: product.stock_quantity,
                category: product.category,
                brand: product.brand
            }))
    }

    const generateSampleData = () => {
        // Generate sample chart data
        const chartData = []
        const now = new Date()
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const revenue = Math.round(Math.random() * 2000 + 500)
            const orders = Math.round(revenue / 50 + Math.random() * 10)
            
            chartData.push({
                date: date.toISOString().split('T')[0],
                revenue,
                orders,
                profit: Math.round(revenue * 0.3),
                customers: Math.round(orders * 0.8)
            })
        }

        // Generate sample products
        const products = [
            { id: '1', name: 'Wireless Headphones', stock_quantity: 5, min_stock_level: 10, price: 99.99 },
            { id: '2', name: 'Laptop Stand', stock_quantity: 0, min_stock_level: 5, price: 49.99 },
            { id: '3', name: 'Mechanical Keyboard', stock_quantity: 25, min_stock_level: 15, price: 149.99 },
            { id: '4', name: 'Gaming Mouse', stock_quantity: 8, min_stock_level: 10, price: 79.99 }
        ]

        // Generate sample bills
        const bills = []
        for (let i = 0; i < 20; i++) {
            const billDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            bills.push({
                id: `bill-${i}`,
                created_at: billDate.toISOString(),
                total_amount: Math.round(Math.random() * 500 + 50),
                customer_email: `customer${i}@example.com`
            })
        }

        // Generate sample customers
        const customers = []
        for (let i = 0; i < 15; i++) {
            customers.push({
                id: `customer-${i}`,
                email: `customer${i}@example.com`,
                name: `Customer ${i + 1}`
            })
        }

        return {
            chartData,
            products,
            bills,
            customers,
            stats: {
                totalRevenue: chartData.reduce((sum, day) => sum + day.revenue, 0),
                totalBills: bills.length,
                totalProducts: products.length,
                averageOrderValue: bills.reduce((sum, bill) => sum + bill.total_amount, 0) / bills.length
            }
        }
    }

    const handleInsightAction = (insight, action) => {
        console.log('Insight action:', action, insight)
        // Implement specific actions based on insight type
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="card">
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
                            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                            <p className="mt-2 text-gray-600">Track your business performance and AI insights</p>
                        </div>
                        <ExportButtons data={chartData} filename="business-report" />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Revenue
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            ₹{stats.totalRevenue.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Bills
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.totalBills}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Products
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.totalProducts}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Avg Order Value
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            ₹{stats.averageOrderValue.toFixed(2)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    {insights.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
                            <InsightCards insights={insights} onAction={handleInsightAction} />
                        </div>
                    )}

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <SalesChart 
                            data={chartData} 
                            type="line" 
                            title="Revenue Trend (Last 30 Days)"
                            height={300}
                        />
                        <SalesChart 
                            data={chartData} 
                            type="bar" 
                            title="Daily Orders"
                            height={300}
                        />
                    </div>

                    {/* Top Products */}
                    <div className="mb-8">
                        <TopProducts data={topProducts} title="Product Performance" />
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">New bill created for $250.00</p>
                                    <p className="text-sm text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">Product &quot;Laptop&quot; added to inventory</p>
                                    <p className="text-sm text-gray-500">4 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">Low stock alert for &quot;Mouse&quot;</p>
                                    <p className="text-sm text-gray-500">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}