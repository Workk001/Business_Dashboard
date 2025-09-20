'use client'

import { useState, useCallback } from 'react'

export default function FileUpload({ 
    onFileSelect, 
    acceptedTypes = ['.csv', '.xlsx', '.xls'],
    maxSize = 10 * 1024 * 1024, // 10MB
    disabled = false 
}) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [error, setError] = useState('')

    const validateFile = (file) => {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        if (!acceptedTypes.includes(fileExtension)) {
            return `Invalid file type. Please upload a ${acceptedTypes.join(', ')} file.`
        }

        // Check file size
        if (file.size > maxSize) {
            return `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB.`
        }

        return null
    }

    const handleFile = useCallback((file) => {
        setError('')
        
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        onFileSelect(file)
    }, [onFileSelect, maxSize, acceptedTypes])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        if (!disabled) {
            setIsDragOver(true)
        }
    }, [disabled])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        
        if (disabled) return

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFile(files[0])
        }
    }, [handleFile, disabled])

    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            handleFile(files[0])
        }
    }, [handleFile])

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && document.getElementById('file-input').click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={disabled}
                />
                
                <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    
                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {isDragOver ? 'Drop your file here' : 'Upload your file'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Drag and drop or click to browse
                        </p>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                        <p>Accepted formats: {acceptedTypes.join(', ')}</p>
                        <p>Maximum size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
