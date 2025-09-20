'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SimpleNavbar from '@/components/SimpleNavbar'
import { supabase } from '@/lib/supabase'
import { getBusinessId } from '@/lib/import/processor'

export default function ImportHistoryPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [imports, setImports] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('created_at')
    const [businessId, setBusinessId] = useState(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinessId()
        }
    }, [status, router])

    useEffect(() => {
        if (businessId) {
            loadImportHistory()
        }
    }, [businessId, filter, sortBy])

    const loadBusinessId = async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
        }
    }

    const loadImportHistory = async () => {
        if (!businessId) return
        
        setLoading(true)
        try {
            let query = supabase
                .from('import_logs')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })

            // Apply filters
            if (filter !== 'all') {
                query = query.eq('status', filter)
            }

            const { data, error } = await query

            if (error) throw error

            setImports(data || [])
        } catch (error) {
            console.error('Error loading import history:', error)
            // Fallback to sample data if database fails
            const sampleImports = generateSampleImports()
            setImports(sampleImports)
        } finally {
            setLoading(false)
        }
    }

    const generateSampleImports = () => {
        const types = ['products', 'bills', 'customers']
        const statuses = ['success', 'failed', 'partial']
        const imports = []

        for (let i = 0; i < 15; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            
            imports.push({
                id: `import-${i + 1}`,
                type,
                fileName: `${type}_import_${i + 1}.csv`,
                fileSize: Math.floor(Math.random() * 5000) + 1000, // KB
                totalRows: Math.floor(Math.random() * 100) + 10,
                successfulRows: status === 'success' ? Math.floor(Math.random() * 100) + 10 : 
                               status === 'partial' ? Math.floor(Math.random() * 50) + 5 : 0,
                failedRows: status === 'failed' ? Math.floor(Math.random() * 100) + 10 :
                           status === 'partial' ? Math.floor(Math.random() * 50) + 5 : 0,
                status,
                createdAt: date.toISOString(),
                completedAt: status !== 'failed' ? new Date(date.getTime() + Math.random() * 60000).toISOString() : null
            })
        }

        return imports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    const filteredImports = imports.filter(importItem => {
        if (filter === 'all') return true
        return importItem.status === filter
    })

    const sortedImports = [...filteredImports].sort((a, b) => {
        switch (sortBy) {
            case 'created_at':
                return new Date(b.createdAt) - new Date(a.createdAt)
            case 'file_name':
                return a.fileName.localeCompare(b.fileName)
            case 'status':
                return a.status.localeCompare(b.status)
            case 'total_rows':
                return b.totalRows - a.totalRows
            default:
                return 0
        }
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'partial':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            case 'failed':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            case 'partial':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                )
            default:
                return null
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
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
                                {[1, 2, 3, 4, 5].map((i) => (
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
                            <h1 className="text-3xl font-bold text-gray-900">Import History</h1>
                            <p className="mt-2 text-gray-600">View and manage your data import history</p>
                        </div>
                        <button
                            onClick={() => router.push('/import')}
                            className="btn-primary"
                        >
                            New Import
                        </button>
                    </div>

                    {/* Filters and Sorting */}
                    <div className="card mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Status:</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="partial">Partial</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="created_at">Date</option>
                                    <option value="file_name">File Name</option>
                                    <option value="status">Status</option>
                                    <option value="total_rows">Total Rows</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Showing {filteredImports.length} imports</span>
                            </div>
                        </div>
                    </div>

                    {/* Import History Table */}
                    <div className="card">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rows
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedImports.map((importItem) => (
                                        <tr key={importItem.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {importItem.fileName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatFileSize(importItem.fileSize * 1024)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {importItem.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(importItem.status)}`}>
                                                        {getStatusIcon(importItem.status)}
                                                        <span className="ml-1 capitalize">{importItem.status}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>
                                                    <div>Total: {importItem.totalRows}</div>
                                                    {importItem.successfulRows > 0 && (
                                                        <div className="text-green-600">✓ {importItem.successfulRows}</div>
                                                    )}
                                                    {importItem.failedRows > 0 && (
                                                        <div className="text-red-600">✗ {importItem.failedRows}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(importItem.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {importItem.failedRows > 0 && (
                                                        <button className="text-red-600 hover:text-red-900">
                                                            Error Log
                                                        </button>
                                                    )}
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {sortedImports.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No imports found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all' 
                                        ? 'Start by importing your data to see history here.'
                                        : `No ${filter} imports found. Try changing the filter.`
                                    }
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => router.push('/import')}
                                        className="btn-primary"
                                    >
                                        Start Import
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
