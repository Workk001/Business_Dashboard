// Import validation engine for Phase 4
// Validates CSV/XLSX files before processing

export class ImportValidator {
    constructor(importType) {
        this.importType = importType
        this.validationRules = this.getValidationRules()
    }

    getValidationRules() {
        const rules = {
            products: {
                required: ['name', 'price'],
                optional: ['description', 'category', 'stock_quantity', 'min_stock_level', 'sku', 'brand'],
                // Add column mapping for common variations
                columnMapping: {
                    'Product_Name': 'name',
                    'product_name': 'name',
                    'Product Name': 'name',
                    'Catagory': 'category',
                    'Category': 'category',
                    'category': 'category',
                    'Unit_Price': 'price',
                    'unit_price': 'price',
                    'Price': 'price',
                    'price': 'price',
                    'Stock_Quantity': 'stock_quantity',
                    'stock_quantity': 'stock_quantity',
                    'Stock Quantity': 'stock_quantity',
                    'Quantity': 'stock_quantity',
                    'Product_ID': 'sku',
                    'product_id': 'sku',
                    'SKU': 'sku',
                    'sku': 'sku',
                    'Supplier_Name': 'brand',
                    'supplier_name': 'brand',
                    'Brand': 'brand',
                    'brand': 'brand'
                },
                types: {
                    name: 'string',
                    price: 'number',
                    stock_quantity: 'number',
                    min_stock_level: 'number',
                    description: 'string',
                    category: 'string',
                    sku: 'string',
                    brand: 'string'
                },
                constraints: {
                    price: { min: 0 },
                    stock_quantity: { min: 0 },
                    min_stock_level: { min: 0 }
                }
            },
            bills: {
                required: ['customer_name', 'total_amount'],
                optional: ['customer_email', 'customer_phone', 'status', 'notes', 'due_date'],
                types: {
                    customer_name: 'string',
                    customer_email: 'email',
                    customer_phone: 'string',
                    total_amount: 'number',
                    status: 'string',
                    notes: 'string',
                    due_date: 'date'
                },
                constraints: {
                    total_amount: { min: 0 }
                }
            },
            customers: {
                required: ['name', 'email'],
                optional: ['phone', 'address', 'company'],
                types: {
                    name: 'string',
                    email: 'email',
                    phone: 'string',
                    address: 'string',
                    company: 'string'
                }
            }
        }

        return rules[this.importType] || {}
    }

    validateHeaders(headers) {
        const errors = []
        const { required, columnMapping } = this.validationRules

        // Map headers to standard names
        const mappedHeaders = headers.map(header => {
            return columnMapping && columnMapping[header] ? columnMapping[header] : header
        })

        // Only check for required headers (after mapping)
        // Ignore extra columns - they won't cause validation errors
        const missingRequired = required.filter(header => !mappedHeaders.includes(header))
        if (missingRequired.length > 0) {
            errors.push({
                type: 'missing_headers',
                message: `Missing required columns: ${missingRequired.join(', ')}`,
                details: { missing: missingRequired }
            })
        }

        // Don't check for invalid headers - allow any extra columns
        return errors
    }

    validateRow(row, rowIndex) {
        const errors = []
        const { required, types, constraints, columnMapping } = this.validationRules

        // Map row data to standard field names
        const mappedRow = {}
        for (const [key, value] of Object.entries(row)) {
            const mappedKey = columnMapping && columnMapping[key] ? columnMapping[key] : key
            mappedRow[mappedKey] = value
        }

        // Check required fields
        for (const field of required) {
            if (!mappedRow[field] || mappedRow[field].toString().trim() === '') {
                errors.push({
                    type: 'missing_required',
                    field,
                    message: `${field} is required`,
                    row: rowIndex + 1
                })
            }
        }

        // Validate data types and constraints
        for (const [field, value] of Object.entries(mappedRow)) {
            if (!value || value.toString().trim() === '') continue

            const fieldType = types[field]
            if (!fieldType) continue

            // Type validation
            const typeError = this.validateType(field, value, fieldType)
            if (typeError) {
                errors.push({
                    type: 'invalid_type',
                    field,
                    message: typeError,
                    row: rowIndex + 1,
                    value: value.toString()
                })
            }

            // Constraint validation
            const constraintError = this.validateConstraints(field, value, constraints[field])
            if (constraintError) {
                errors.push({
                    type: 'constraint_violation',
                    field,
                    message: constraintError,
                    row: rowIndex + 1,
                    value: value.toString()
                })
            }
        }

        return errors
    }

    validateType(field, value, expectedType) {
        const stringValue = value.toString().trim()

        switch (expectedType) {
            case 'string':
                return null // All values can be strings
            case 'number':
                const cleanedValue = this.cleanNumberValue(stringValue)
                if (isNaN(cleanedValue) || cleanedValue === '') {
                    return `${field} must be a number`
                }
                return null
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(stringValue)) {
                    return `${field} must be a valid email address`
                }
                return null
            case 'date':
                const date = new Date(stringValue)
                if (isNaN(date.getTime())) {
                    return `${field} must be a valid date (YYYY-MM-DD)`
                }
                return null
            default:
                return null
        }
    }

    cleanNumberValue(value) {
        if (!value || value === '') return ''
        
        // Remove currency symbols, commas, and other non-numeric characters except decimal point
        let cleaned = value.toString()
            .replace(/[₹$€£¥,\s]/g, '') // Remove currency symbols and commas
            .replace(/[^\d.-]/g, '') // Keep only digits, decimal point, and minus sign
        
        // Handle empty result
        if (cleaned === '' || cleaned === '-') return ''
        
        return parseFloat(cleaned)
    }

    validateConstraints(field, value, constraints) {
        if (!constraints) return null

        const numValue = parseFloat(value)
        if (isNaN(numValue)) return null

        if (constraints.min !== undefined && numValue < constraints.min) {
            return `${field} must be at least ${constraints.min}`
        }

        if (constraints.max !== undefined && numValue > constraints.max) {
            return `${field} must be at most ${constraints.max}`
        }

        return null
    }

    validateFile(data, headers) {
        const errors = []
        const warnings = []

        // Validate headers
        const headerErrors = this.validateHeaders(headers)
        errors.push(...headerErrors)

        // If headers are invalid, don't validate rows
        if (headerErrors.length > 0) {
            return { errors, warnings, isValid: false }
        }

        // Validate each row
        data.forEach((row, index) => {
            const rowErrors = this.validateRow(row, index)
            errors.push(...rowErrors)
        })

        // Check for duplicate rows (warnings)
        const duplicateRows = this.findDuplicateRows(data)
        if (duplicateRows.length > 0) {
            warnings.push({
                type: 'duplicate_rows',
                message: `Found ${duplicateRows.length} duplicate rows`,
                details: { rows: duplicateRows }
            })
        }

        return {
            errors,
            warnings,
            isValid: errors.length === 0,
            totalRows: data.length,
            validRows: data.length - errors.filter(e => e.type !== 'missing_required').length
        }
    }

    findDuplicateRows(data) {
        const seen = new Set()
        const duplicates = []

        data.forEach((row, index) => {
            // Create a key based on required fields
            const key = this.validationRules.required
                .map(field => row[field] || '')
                .join('|')

            if (seen.has(key)) {
                duplicates.push(index + 1)
            } else {
                seen.add(key)
            }
        })

        return duplicates
    }

    generateErrorReport(validationResult) {
        const { errors, warnings } = validationResult

        const report = {
            summary: {
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                isValid: validationResult.isValid
            },
            errors: this.groupErrorsByType(errors),
            warnings: warnings,
            recommendations: this.generateRecommendations(errors)
        }

        return report
    }

    groupErrorsByType(errors) {
        const grouped = {}

        errors.forEach(error => {
            if (!grouped[error.type]) {
                grouped[error.type] = []
            }
            grouped[error.type].push(error)
        })

        return grouped
    }

    generateRecommendations(errors) {
        const recommendations = []

        const errorTypes = new Set(errors.map(e => e.type))

        if (errorTypes.has('missing_headers')) {
            recommendations.push('Download the template file to ensure you have all required columns')
        }

        if (errorTypes.has('invalid_type')) {
            recommendations.push('Check that numeric fields contain only numbers and dates are in YYYY-MM-DD format')
        }

        if (errorTypes.has('constraint_violation')) {
            recommendations.push('Ensure all numeric values meet the minimum/maximum requirements')
        }

        if (errorTypes.has('missing_required')) {
            recommendations.push('Fill in all required fields before uploading')
        }

        return recommendations
    }
}

// Utility function to parse CSV content
export function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length === 0) return { headers: [], data: [] }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        
        headers.forEach((header, index) => {
            row[header] = values[index] || ''
        })
        
        data.push(row)
    }

    return { headers, data }
}

// Utility function to parse Excel content (simplified - in production, use a library like xlsx)
export function parseExcel(excelContent) {
    // This is a simplified implementation
    // In production, you would use a library like 'xlsx' to parse Excel files
    return { headers: [], data: [] }
}
