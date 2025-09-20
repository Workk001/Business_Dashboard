// AI Insights Engine - Phase 3
import { 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'

export class AIInsightsEngine {
    constructor() {
        this.insights = []
    }

    async generateInsights(businessData) {
        const { products, bills, customers } = businessData
        this.insights = []

        await this.analyzeStockLevels(products)
        await this.analyzeRevenueTrends(bills)
        await this.analyzeCustomerBehavior(customers, bills)
        await this.analyzeProductPerformance(products)
        await this.analyzeInventoryValue(products)
        await this.analyzeCategoryInsights(products)

        return this.insights
    }

    async analyzeStockLevels(products) {
        if (!products || products.length === 0) return

        // Find products with low stock (below minimum level)
        const lowStockProducts = products.filter(p => 
            (p.stock_quantity || 0) <= (p.min_stock_level || 0) && (p.stock_quantity || 0) > 0
        )

        // Find out of stock products
        const outOfStockProducts = products.filter(p => 
            (p.stock_quantity || 0) === 0
        )

        // Add low stock alerts
        lowStockProducts.forEach(product => {
            this.insights.push({
                id: `stock-low-${product.id}`,
                type: 'stock_alert',
                priority: 'high',
                title: 'Low Stock Alert',
                message: `${product.name} is running low (${product.stock_quantity} units remaining)`,
                action: 'reorder',
                actionData: {
                    productId: product.id,
                    productName: product.name,
                    currentStock: product.stock_quantity,
                    suggestedOrder: Math.max(50, (product.min_stock_level || 10) * 2)
                },
                icon: ExclamationTriangleIcon,
                color: 'red'
            })
        })

        // Add out of stock alerts
        outOfStockProducts.forEach(product => {
            this.insights.push({
                id: `stock-out-${product.id}`,
                type: 'stock_alert',
                priority: 'critical',
                title: 'Out of Stock',
                message: `${product.name} is completely out of stock`,
                action: 'urgent_reorder',
                actionData: {
                    productId: product.id,
                    productName: product.name,
                    currentStock: 0,
                    suggestedOrder: Math.max(100, (product.min_stock_level || 10) * 3)
                },
                icon: ExclamationTriangleIcon,
                color: 'red'
            })
        })

        // Add stock summary if there are many low stock items
        if (lowStockProducts.length > 5) {
            this.insights.push({
                id: 'stock-summary',
                type: 'stock_summary',
                priority: 'medium',
                title: 'Stock Management Needed',
                message: `${lowStockProducts.length} products are running low on stock`,
                action: 'bulk_reorder',
                actionData: {
                    lowStockCount: lowStockProducts.length,
                    outOfStockCount: outOfStockProducts.length
                },
                icon: CubeIcon,
                color: 'orange'
            })
        }
    }

    async analyzeRevenueTrends(bills) {
        if (!bills || bills.length === 0) return

        const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
        const avgDailyRevenue = totalRevenue / 30
        const predictedMonthlyRevenue = avgDailyRevenue * 30

        this.insights.push({
            id: 'revenue-prediction',
            type: 'revenue_forecast',
            priority: 'medium',
            title: 'Revenue Forecast',
            message: `Predicted monthly revenue: ₹${predictedMonthlyRevenue.toLocaleString()}`,
            action: 'view_details',
            actionData: { 
                predicted: predictedMonthlyRevenue,
                current: totalRevenue
            },
            icon: ChartBarIcon,
            color: 'blue'
        })
    }

    async analyzeCustomerBehavior(customers, bills) {
        if (!customers || !bills) return

        const now = new Date()
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const activeCustomers = new Set(
            bills
                .filter(bill => new Date(bill.created_at) >= last30Days)
                .map(bill => bill.customer_email)
        )

        const inactiveCustomers = customers.filter(customer => 
            !activeCustomers.has(customer.email)
        )

        if (inactiveCustomers.length > 0) {
            this.insights.push({
                id: 'inactive-customers',
                type: 'customer_engagement',
                priority: 'medium',
                title: 'Inactive Customers',
                message: `${inactiveCustomers.length} customers haven't made a purchase in 30 days`,
                action: 're_engagement_campaign',
                actionData: {
                    count: inactiveCustomers.length
                },
                icon: UserGroupIcon,
                color: 'yellow'
            })
        }
    }

    async analyzeProductPerformance(products) {
        if (!products || products.length === 0) return

        // Find top performing products by inventory value
        const productsByValue = products
            .map(p => ({
                ...p,
                totalValue: (p.price || 0) * (p.stock_quantity || 0)
            }))
            .sort((a, b) => b.totalValue - a.totalValue)

        const topProduct = productsByValue[0]
        if (topProduct && topProduct.totalValue > 0) {
            this.insights.push({
                id: 'top-product',
                type: 'product_performance',
                priority: 'low',
                title: 'Top Performing Product',
                message: `${topProduct.name} has the highest inventory value (₹${topProduct.totalValue.toLocaleString()})`,
                action: 'view_product',
                actionData: {
                    productId: topProduct.id,
                    productName: topProduct.name,
                    totalValue: topProduct.totalValue
                },
                icon: ChartBarIcon,
                color: 'green'
            })
        }
    }

    async analyzeInventoryValue(products) {
        if (!products || products.length === 0) return

        const totalInventoryValue = products.reduce((sum, product) => 
            sum + ((product.price || 0) * (product.stock_quantity || 0)), 0
        )

        if (totalInventoryValue > 0) {
            this.insights.push({
                id: 'inventory-value',
                type: 'inventory_summary',
                priority: 'low',
                title: 'Total Inventory Value',
                message: `Your total inventory is worth ₹${totalInventoryValue.toLocaleString()}`,
                action: 'view_inventory',
                actionData: {
                    totalValue: totalInventoryValue,
                    productCount: products.length
                },
                icon: CurrencyDollarIcon,
                color: 'blue'
            })
        }
    }

    async analyzeCategoryInsights(products) {
        if (!products || products.length === 0) return

        // Group products by category
        const categoryStats = {}
        products.forEach(product => {
            const category = product.category || 'Uncategorized'
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    count: 0,
                    totalValue: 0,
                    avgPrice: 0
                }
            }
            categoryStats[category].count++
            categoryStats[category].totalValue += (product.price || 0) * (product.stock_quantity || 0)
        })

        // Calculate average prices
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category]
            stats.avgPrice = stats.totalValue / stats.count
        })

        // Find the category with most products
        const topCategory = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b.count - a.count)[0]

        if (topCategory && topCategory[1].count > 1) {
            this.insights.push({
                id: 'top-category',
                type: 'category_insight',
                priority: 'low',
                title: 'Top Category',
                message: `${topCategory[0]} is your largest category with ${topCategory[1].count} products`,
                action: 'view_category',
                actionData: {
                    category: topCategory[0],
                    count: topCategory[1].count,
                    totalValue: topCategory[1].totalValue
                },
                icon: CubeIcon,
                color: 'purple'
            })
        }
    }

    getAllInsights() {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return this.insights.sort((a, b) => 
            priorityOrder[a.priority] - priorityOrder[b.priority]
        )
    }
}

export const aiInsightsEngine = new AIInsightsEngine()