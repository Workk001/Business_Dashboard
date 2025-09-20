'use client'

import { useState } from 'react'

const iconMap = {
    'exclamation-triangle': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    ),
    'x-circle': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'chart-line': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    'users': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
    ),
    'trophy': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    'alert-circle': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    )
}

const colorMap = {
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
}

const priorityMap = {
    critical: { color: 'text-red-600', label: 'Critical' },
    high: { color: 'text-orange-600', label: 'High' },
    medium: { color: 'text-yellow-600', label: 'Medium' },
    low: { color: 'text-green-600', label: 'Low' }
}

export default function InsightCards({ insights, onAction }) {
    const [expandedCard, setExpandedCard] = useState(null)

    const handleAction = (insight, action) => {
        if (onAction) {
            onAction(insight, action)
        }
        
        // Default actions
        switch (action) {
            case 'reorder':
                console.log('Reorder action:', insight.actionData)
                // Implement reorder logic
                break
            case 'urgent_reorder':
                console.log('Urgent reorder action:', insight.actionData)
                // Implement urgent reorder logic
                break
            case 'view_details':
                console.log('View details action:', insight.actionData)
                // Implement view details logic
                break
            case 're_engagement_campaign':
                console.log('Re-engagement campaign action:', insight.actionData)
                // Implement campaign logic
                break
            default:
                console.log('Unknown action:', action)
        }
    }

    const getActionButton = (insight) => {
        switch (insight.action) {
            case 'reorder':
                return (
                    <button
                        onClick={() => handleAction(insight, 'reorder')}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Reorder Now
                    </button>
                )
            case 'urgent_reorder':
                return (
                    <button
                        onClick={() => handleAction(insight, 'urgent_reorder')}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-700 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Urgent Reorder
                    </button>
                )
            case 'view_details':
                return (
                    <button
                        onClick={() => handleAction(insight, 'view_details')}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        View Details
                    </button>
                )
            case 're_engagement_campaign':
                return (
                    <button
                        onClick={() => handleAction(insight, 're_engagement_campaign')}
                        className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        Start Campaign
                    </button>
                )
            default:
                return null
        }
    }

    if (!insights || insights.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No insights available</h3>
                <p className="mt-1 text-sm text-gray-500">AI insights will appear here as your business data grows.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {insights.map((insight) => (
                <div
                    key={insight.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${colorMap[insight.color] || colorMap.blue}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    insight.color === 'red' ? 'bg-red-100' :
                                    insight.color === 'yellow' ? 'bg-yellow-100' :
                                    insight.color === 'green' ? 'bg-green-100' :
                                    insight.color === 'blue' ? 'bg-blue-100' :
                                    'bg-purple-100'
                                }`}>
                                    {iconMap[insight.icon] || iconMap['alert-circle']}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-sm font-medium">
                                        {insight.title}
                                    </h3>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        priorityMap[insight.priority]?.color || 'text-gray-600'
                                    } bg-white`}>
                                        {priorityMap[insight.priority]?.label || insight.priority}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">
                                    {insight.message}
                                </p>
                                
                                {insight.actionData && expandedCard === insight.id && (
                                    <div className="mt-3 p-3 bg-white rounded-md border">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Details:</h4>
                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                            {JSON.stringify(insight.actionData, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {getActionButton(insight)}
                            <button
                                onClick={() => setExpandedCard(expandedCard === insight.id ? null : insight.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
