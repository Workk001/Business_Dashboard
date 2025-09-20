// Template generator for Phase 4 imports
// Generates downloadable template files for different data types

export class TemplateGenerator {
    constructor() {
        this.templates = {
            products: {
                headers: [
                    'name',
                    'description', 
                    'category',
                    'price',
                    'stock_quantity',
                    'min_stock_level',
                    'sku',
                    'brand'
                ],
                sampleData: [
                    {
                        name: 'Wireless Headphones',
                        description: 'High-quality wireless headphones with noise cancellation',
                        category: 'Electronics',
                        price: '99.99',
                        stock_quantity: '50',
                        min_stock_level: '10',
                        sku: 'WH-001',
                        brand: 'TechBrand'
                    },
                    {
                        name: 'Laptop Stand',
                        description: 'Adjustable aluminum laptop stand',
                        category: 'Accessories',
                        price: '49.99',
                        stock_quantity: '25',
                        min_stock_level: '5',
                        sku: 'LS-002',
                        brand: 'OfficePro'
                    }
                ],
                instructions: [
                    'Required fields: name, price',
                    'Optional fields: description, category, stock_quantity, min_stock_level, sku, brand',
                    'Price must be a number (e.g., 99.99)',
                    'Stock quantities must be whole numbers',
                    'Category should be consistent (e.g., Electronics, Clothing, Food)'
                ]
            },
            bills: {
                headers: [
                    'customer_name',
                    'customer_email',
                    'customer_phone',
                    'total_amount',
                    'status',
                    'notes',
                    'due_date'
                ],
                sampleData: [
                    {
                        customer_name: 'John Smith',
                        customer_email: 'john.smith@email.com',
                        customer_phone: '+1-555-0123',
                        total_amount: '299.99',
                        status: 'pending',
                        notes: 'Payment due in 30 days',
                        due_date: '2024-02-15'
                    },
                    {
                        customer_name: 'Jane Doe',
                        customer_email: 'jane.doe@company.com',
                        customer_phone: '+1-555-0456',
                        total_amount: '149.50',
                        status: 'paid',
                        notes: 'Paid via credit card',
                        due_date: '2024-01-30'
                    }
                ],
                instructions: [
                    'Required fields: customer_name, total_amount',
                    'Optional fields: customer_email, customer_phone, status, notes, due_date',
                    'Status options: draft, pending, paid, overdue, cancelled',
                    'Due date format: YYYY-MM-DD (e.g., 2024-02-15)',
                    'Total amount must be a number (e.g., 299.99)'
                ]
            },
            customers: {
                headers: [
                    'name',
                    'email',
                    'phone',
                    'address',
                    'company'
                ],
                sampleData: [
                    {
                        name: 'Alice Johnson',
                        email: 'alice.johnson@email.com',
                        phone: '+1-555-0789',
                        address: '123 Main St, City, State 12345',
                        company: 'ABC Corporation'
                    },
                    {
                        name: 'Bob Wilson',
                        email: 'bob.wilson@company.com',
                        phone: '+1-555-0321',
                        address: '456 Oak Ave, City, State 67890',
                        company: 'XYZ Ltd'
                    }
                ],
                instructions: [
                    'Required fields: name, email',
                    'Optional fields: phone, address, company',
                    'Email must be a valid email address',
                    'Phone can include country code and formatting',
                    'Address can be a single line or multiple lines'
                ]
            }
        }
    }

    generateCSV(importType) {
        const template = this.templates[importType]
        if (!template) {
            throw new Error(`Unknown import type: ${importType}`)
        }

        const { headers, sampleData } = template
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n'
        
        sampleData.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || ''
                // Escape values that contain commas or quotes
                if (value.includes(',') || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value
            })
            csvContent += values.join(',') + '\n'
        })

        return csvContent
    }

    generateInstructions(importType) {
        const template = this.templates[importType]
        if (!template) {
            return []
        }

        return template.instructions
    }

    downloadTemplate(importType, format = 'csv') {
        try {
            const content = this.generateCSV(importType)
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            
            link.setAttribute('href', url)
            link.setAttribute('download', `${importType}_template.csv`)
            link.style.visibility = 'hidden'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading template:', error)
            throw error
        }
    }

    getTemplateInfo(importType) {
        const template = this.templates[importType]
        if (!template) {
            return null
        }

        return {
            headers: template.headers,
            requiredFields: this.getRequiredFields(importType),
            optionalFields: this.getOptionalFields(importType),
            instructions: template.instructions,
            sampleCount: template.sampleData.length
        }
    }

    getRequiredFields(importType) {
        const template = this.templates[importType]
        if (!template) return []

        // Define required fields for each type
        const requiredFields = {
            products: ['name', 'price'],
            bills: ['customer_name', 'total_amount'],
            customers: ['name', 'email']
        }

        return requiredFields[importType] || []
    }

    getOptionalFields(importType) {
        const template = this.templates[importType]
        if (!template) return []

        const requiredFields = this.getRequiredFields(importType)
        return template.headers.filter(header => !requiredFields.includes(header))
    }

    validateTemplateHeaders(importType, headers) {
        const template = this.templates[importType]
        if (!template) return { isValid: false, errors: ['Unknown import type'] }

        const errors = []
        const requiredFields = this.getRequiredFields(importType)

        // Check for missing required fields
        const missingRequired = requiredFields.filter(field => !headers.includes(field))
        if (missingRequired.length > 0) {
            errors.push(`Missing required columns: ${missingRequired.join(', ')}`)
        }

        // Check for invalid fields
        const validFields = template.headers
        const invalidFields = headers.filter(header => !validFields.includes(header))
        if (invalidFields.length > 0) {
            errors.push(`Invalid columns: ${invalidFields.join(', ')}`)
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }
}

// Export singleton instance
export const templateGenerator = new TemplateGenerator()
