'use client'

import { useState } from 'react'
import { useBusiness } from '@/context/BusinessContext'

export default function BusinessSelector() {
    const { businesses, currentBusiness, switchBusiness, loading } = useBusiness()
    const [isOpen, setIsOpen] = useState(false)

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
        )
    }

    if (businesses.length === 0) {
        return null
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{currentBusiness?.name || 'Select Business'}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                        {businesses.map((business) => (
                            <button
                                key={business.id}
                                onClick={() => {
                                    switchBusiness(business)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                                    currentBusiness?.id === business.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <div>
                                    <div className="font-medium">{business.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {business.type} • {business.role}
                                    </div>
                                </div>
                                {currentBusiness?.id === business.id && (
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
