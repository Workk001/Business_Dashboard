'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SimpleNavbar from '@/components/SimpleNavbar'
import FileUpload from '@/components/import/FileUpload'
import { templateGenerator } from '@/lib/import/templates'
import { ImportProcessor, getBusinessId } from '@/lib/import/processor'

const importTypes = [
    {
        id: 'products',
        name: 'Products',
        description: 'Import your product catalog with inventory data',
        icon: '📦',
        color: 'blue'
    },
    {
        id: 'bills',
        name: 'Bills',
        description: 'Import historical invoices and billing data',
        icon: '🧾',
        color: 'green'
    },
    {
        id: 'customers',
        name: 'Customers',
        description: 'Import customer contact information and details',
        icon: '👥',
        color: 'purple'
    }
]

export default function ImportPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [selectedType, setSelectedType] = useState(null)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState(null)
    const [businessId, setBusinessId] = useState(null)

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            loadBusinessId()
        }
    }, [status, session])

    const loadBusinessId = async () => {
        try {
            const id = await getBusinessId(session.user.id)
            setBusinessId(id)
        } catch (error) {
            console.error('Error loading business ID:', error)
            // Show user-friendly error message
            alert(`Error: ${error.message}\n\nPlease make sure you have a business set up and try again.`)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50">
                <SimpleNavbar />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        router.push('/auth/login')
        return null
    }

    const handleTypeSelect = (type) => {
        setSelectedType(type)
        setUploadedFile(null)
    }

    const handleFileSelect = (file) => {
        setUploadedFile(file)
    }

    const handleDownloadTemplate = (importType) => {
        try {
            templateGenerator.downloadTemplate(importType)
        } catch (error) {
            console.error('Error downloading template:', error)
            alert('Error downloading template. Please try again.')
        }
    }

    const handleUpload = async () => {
        if (!uploadedFile || !selectedType) {
            alert('Please select a file and import type first.')
            return
        }

        if (!businessId) {
            alert('No business found. Please set up a business first before importing data.')
            return
        }

        setIsUploading(true)
        setUploadResult(null)
        
        try {
            const processor = new ImportProcessor(selectedType.id, businessId, session.user.id)
            const result = await processor.processFile(uploadedFile)
            
            setUploadResult(result)
            
            if (result.success) {
                // Reset form after successful upload
                setTimeout(() => {
                    setUploadedFile(null)
                    setSelectedType(null)
                    setUploadResult(null)
                }, 3000)
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploadResult({
                success: false,
                message: 'Upload failed. Please try again.',
                error: error.message
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SimpleNavbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
                        <p className="mt-2 text-gray-600">
                            Import your business data quickly and efficiently using our template-based system
                        </p>
                    </div>

                    {!selectedType ? (
                        // Type Selection
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {importTypes.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => handleTypeSelect(type)}
                                    className="card cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">{type.icon}</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {type.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {type.description}
                                        </p>
                                        <button className="btn-primary w-full">
                                            Import {type.name}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Upload Process
                        <div className="max-w-4xl mx-auto">
                            <div className="card">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Import {selectedType.name}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Upload your {selectedType.name.toLowerCase()} data file
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Template Download */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Download Template First
                                            </h3>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Use our template to ensure your data is formatted correctly
                                            </p>
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleDownloadTemplate(selectedType.id)}
                                                    className="btn-primary text-sm"
                                                >
                                                    Download {selectedType.name} Template
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="mb-6">
                                    <FileUpload
                                        onFileSelect={handleFileSelect}
                                        acceptedTypes={['.csv', '.xlsx', '.xls']}
                                        maxSize={10 * 1024 * 1024} // 10MB
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Uploaded File Info */}
                                {uploadedFile && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-medium text-green-800">
                                                    File selected: {uploadedFile.name}
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Result */}
                                {uploadResult && (
                                    <div className={`mb-6 p-4 rounded-lg border ${
                                        uploadResult.success 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                {uploadResult.success ? (
                                                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className={`text-sm font-medium ${
                                                    uploadResult.success ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                    {uploadResult.success ? 'Import Successful!' : 'Import Failed'}
                                                </h3>
                                                <p className={`mt-1 text-sm ${
                                                    uploadResult.success ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    {uploadResult.message}
                                                </p>
                                                {uploadResult.success && uploadResult.processedRows && (
                                                    <p className="mt-1 text-sm text-green-600">
                                                        Processed {uploadResult.processedRows} rows successfully
                                                        {uploadResult.failedRows > 0 && `, {uploadResult.failedRows} failed`}
                                                    </p>
                                                )}
                                                {uploadResult.errors && uploadResult.errors.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-red-800">Errors found:</p>
                                                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                                            {uploadResult.errors.slice(0, 5).map((error, index) => (
                                                                <li key={index}>
                                                                    Row {error.row}: {error.message}
                                                                </li>
                                                            ))}
                                                            {uploadResult.errors.length > 5 && (
                                                                <li>... and {uploadResult.errors.length - 5} more errors</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Business ID Warning */}
                                {!businessId && (
                                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    No Business Found
                                                </h3>
                                                <p className="mt-1 text-sm text-yellow-700">
                                                    Please set up a business first before importing data. Go to Settings to create a business.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className="btn-secondary"
                                        disabled={isUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!uploadedFile || isUploading || !businessId}
                                        className="btn-primary"
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </>
                                        ) : (
                                            'Upload & Import'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
