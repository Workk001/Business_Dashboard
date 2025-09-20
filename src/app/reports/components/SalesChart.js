'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function SalesChart({ data, type = 'line', title, height = 300 }) {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data)
        } else {
            // Generate sample data for demonstration
            const sampleData = generateSampleData()
            setChartData(sampleData)
        }
    }, [data])

    const generateSampleData = () => {
        const days = 30
        const data = []
        let baseRevenue = 1000
        
        for (let i = 0; i < days; i++) {
            const date = new Date()
            date.setDate(date.getDate() - (days - i))
            
            // Add some realistic variation
            const variation = (Math.random() - 0.5) * 0.3
            const revenue = Math.round(baseRevenue * (1 + variation))
            const orders = Math.round(revenue / 50 + Math.random() * 10)
            
            data.push({
                date: date.toISOString().split('T')[0],
                revenue,
                orders,
                profit: Math.round(revenue * 0.3),
                customers: Math.round(orders * 0.8)
            })
            
            // Slight upward trend
            baseRevenue += Math.random() * 20
        }
        
        return data
    }

    const formatCurrency = (value) => `$${value.toLocaleString()}`
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name]}
                            labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            name="Revenue"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            name="Profit"
                        />
                    </LineChart>
                )
            
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name]}
                            labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                        <Bar dataKey="orders" fill="#10B981" name="Orders" />
                    </BarChart>
                )
            
            case 'pie':
                const pieData = chartData.slice(-7).map(item => ({
                    name: formatDate(item.date),
                    value: item.revenue
                }))
                
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                )
            
            default:
                return null
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {/* Handle export */}}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Export
                    </button>
                </div>
            </div>
            
            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
            
            {chartData.length === 0 && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mt-2">No data available</p>
                    </div>
                </div>
            )}
        </div>
    )
}
