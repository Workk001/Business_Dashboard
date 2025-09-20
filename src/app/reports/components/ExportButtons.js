'use client'

import { useState } from 'react'

export default function ExportButtons({ data, filename = 'business-report' }) {
    const [isExporting, setIsExporting] = useState(false)
    const [exportFormat, setExportFormat] = useState('csv')

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('No data to export')
            return
        }

        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header]
                    // Handle values that might contain commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                }).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToPDF = async (data, filename) => {
        // For now, we'll use a simple approach
        // In production, you'd want to use a library like jsPDF or Puppeteer
        try {
            // Create a simple HTML table
            const tableHtml = `
                <html>
                    <head>
                        <title>${filename}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            h1 { color: #333; }
                        </style>
                    </head>
                    <body>
                        <h1>${filename}</h1>
                        <table>
                            <thead>
                                <tr>
                                    ${Object.keys(data[0] || {}).map(header => `<th>${header}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(row => 
                                    `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
                                ).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `

            const printWindow = window.open('', '_blank')
            printWindow.document.write(tableHtml)
            printWindow.document.close()
            printWindow.print()
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF. Please try again.')
        }
    }

    const handleExport = async () => {
        setIsExporting(true)
        
        try {
            if (exportFormat === 'csv') {
                exportToCSV(data, filename)
            } else if (exportFormat === 'pdf') {
                await exportToPDF(data, filename)
            }
        } catch (error) {
            console.error('Export error:', error)
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Format:</label>
                <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                </select>
            </div>
            
            <button
                onClick={handleExport}
                disabled={isExporting || !data || data.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExporting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export {exportFormat.toUpperCase()}
                    </>
                )}
            </button>
        </div>
    )
}
