'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import SimpleNavbar from '@/components/SimpleNavbar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import { aiInsightsEngine } from '@/lib/ai/insights'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'
import { 
  CubeIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [insights, setInsights] = useState([])
    const [loadingInsights, setLoadingInsights] = useState(false)
    const [businessId, setBusinessId] = useState(null)
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalBills: 0,
        totalRevenue: 0,
        lowStockProducts: 0
    })

    const loadBusinessId = useCallback(async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
        }
    }, [session?.user?.id])

    const loadDashboardData = useCallback(async () => {
        if (!businessId) return
        
        setLoadingInsights(true)
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

            // Calculate real stats
            const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
            const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock_level || 0)).length
            
            setStats({
                totalProducts: products.length,
                totalBills: bills.length,
                totalRevenue,
                lowStockProducts
            })
            
            // Generate AI insights from real data
            const businessData = { products, bills, customers }
            const aiInsights = await aiInsightsEngine.generateInsights(businessData)
            setInsights(aiInsights.slice(0, 3)) // Show only top 3 insights on dashboard
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            // Fallback to sample data
            const sampleData = {
                products: [
                    { id: '1', name: 'Wireless Headphones', stock_quantity: 3, min_stock_level: 10 },
                    { id: '2', name: 'Laptop Stand', stock_quantity: 0, min_stock_level: 5 }
                ],
                bills: [],
                customers: []
            }
            
            const aiInsights = await aiInsightsEngine.generateInsights(sampleData)
            setInsights(aiInsights.slice(0, 3))
        } finally {
            setLoadingInsights(false)
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
            loadDashboardData()
        }
    }, [businessId, loadDashboardData])

    if (status === 'loading') {
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
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

    const handleFloatingAction = (action) => {
        switch (action) {
            case 'bill':
                router.push('/billing')
                break
            case 'product':
                router.push('/products')
                break
            case 'report':
                router.push('/reports')
                break
        }
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
                        {/* Welcome Header */}
                        <div className="text-center">
                            <motion.h1 
                                className="text-4xl font-bold text-gray-900 mb-2"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                Welcome back, {session.user?.name || session.user?.email}!
                            </motion.h1>
                            <motion.p 
                                className="text-lg text-gray-600"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Here&apos;s what&apos;s happening with your business today.
                            </motion.p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard
                                title="Total Products"
                                value={stats.totalProducts}
                                icon={CubeIcon}
                                color="blue"
                                format="number"
                            />
                            <StatsCard
                                title="Total Bills"
                                value={stats.totalBills}
                                icon={DocumentTextIcon}
                                color="green"
                                format="number"
                            />
                            <StatsCard
                                title="Total Revenue"
                                value={stats.totalRevenue}
                                icon={CurrencyDollarIcon}
                                color="yellow"
                                format="currency"
                            />
                            <StatsCard
                                title="Low Stock"
                                value={stats.lowStockProducts}
                                icon={ExclamationTriangleIcon}
                                color="red"
                                format="number"
                            />
                        </div>

                        {/* AI Insights Section */}
                        {insights.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
                                    <button
                                        onClick={() => router.push('/ai')}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                                    >
                                        <span>View All Insights</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {insights.map((insight, index) => (
                                        <InsightCard
                                            key={insight.id}
                                            insight={insight}
                                            index={index}
                                            onAction={(insight, action) => {
                                                console.log('Insight action:', action, insight)
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[
                                { 
                                    title: 'Add Products', 
                                    description: 'Start by adding your products', 
                                    icon: CubeIcon, 
                                    color: 'blue',
                                    action: () => router.push('/products')
                                },
                                { 
                                    title: 'Create Bill', 
                                    description: 'Generate a new invoice', 
                                    icon: DocumentTextIcon, 
                                    color: 'green',
                                    action: () => router.push('/billing')
                                },
                                { 
                                    title: 'View Reports', 
                                    description: 'Analyze your business data', 
                                    icon: ChartBarIcon, 
                                    color: 'purple',
                                    action: () => router.push('/reports')
                                },
                                { 
                                    title: 'AI Insights', 
                                    description: 'Get smart recommendations', 
                                    icon: ExclamationTriangleIcon, 
                                    color: 'indigo',
                                    action: () => router.push('/ai')
                                },
                                { 
                                    title: 'Import Data', 
                                    description: 'Bulk import your data', 
                                    icon: DocumentArrowUpIcon, 
                                    color: 'orange',
                                    action: () => router.push('/import')
                                },
                                { 
                                    title: 'Settings', 
                                    description: 'Manage your preferences', 
                                    icon: CogIcon, 
                                    color: 'gray',
                                    action: () => router.push('/settings')
                                }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.title}
                                    onClick={item.action}
                                    className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                >
                                    <div className="text-center">
                                        <div className={`mx-auto h-12 w-12 rounded-lg bg-${item.color}-100 flex items-center justify-center mb-4 group-hover:bg-${item.color}-200 transition-colors`}>
                                            <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            
            {/* Floating Action Button */}
            <FloatingActionButton onAction={handleFloatingAction} />
        </div>
    )
}