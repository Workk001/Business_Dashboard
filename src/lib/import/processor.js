// Import processor for Phase 4
// Handles file parsing, validation, and database insertion

import { supabase } from '@/lib/supabase'
import { ImportValidator } from './validation'
import { templateGenerator } from './templates'

export class ImportProcessor {
    constructor(importType, businessId, userId) {
        this.importType = importType
        this.businessId = businessId
        this.userId = userId
        this.validator = new ImportValidator(importType)
    }

    async processFile(file) {
        try {
            // Parse the file
            const { headers, data } = await this.parseFile(file)
            
            // Validate the data
            const validationResult = this.validator.validateFile(data, headers)
            
            // Create import log
            const importLog = await this.createImportLog(file, data.length, validationResult)
            
            if (!validationResult.isValid) {
                // Handle validation errors
                await this.handleValidationErrors(importLog.id, validationResult.errors)
                return {
                    success: false,
                    importLogId: importLog.id,
                    errors: validationResult.errors,
                    message: 'Validation failed. Please check your data format.'
                }
            }

            // Process valid data
            const processResult = await this.processValidData(data, importLog.id)
            
            // Update import log with results
            await this.updateImportLog(importLog.id, processResult)
            
            return {
                success: true,
                importLogId: importLog.id,
                processedRows: processResult.processedRows,
                failedRows: processResult.failedRows,
                message: `Successfully imported ${processResult.processedRows} records`
            }

        } catch (error) {
            console.error('Import processing error:', error)
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            })
            return {
                success: false,
                error: error.message,
                message: `Import failed: ${error.message}`
            }
        }
    }

    async parseFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase()
        
        if (fileExtension === 'csv') {
            return this.parseCSV(file)
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            return this.parseExcel(file)
        } else {
            throw new Error('Unsupported file format')
        }
    }

    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const csvContent = e.target.result
                    const lines = csvContent.split('\n').filter(line => line.trim())
                    
                    if (lines.length === 0) {
                        resolve({ headers: [], data: [] })
                        return
                    }

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

                    resolve({ headers, data })
                } catch (error) {
                    reject(error)
                }
            }
            reader.onerror = reject
            reader.readAsText(file)
        })
    }

    async parseExcel(file) {
        // For now, we'll convert Excel to CSV on the frontend
        // In production, you'd use a library like 'xlsx'
        throw new Error('Excel parsing not yet implemented. Please use CSV format.')
    }

    async createImportLog(file, totalRows, validationResult) {
        const { data, error } = await supabase
            .from('import_logs')
            .insert({
                business_id: this.businessId,
                user_id: this.userId,
                import_type: this.importType,
                file_name: file.name,
                file_size: file.size,
                total_rows: totalRows,
                successful_rows: 0,
                failed_rows: 0,
                status: 'processing',
                validation_errors: validationResult.errors.length > 0 ? validationResult.errors : null
            })
            .select()
            .single()

        if (error) throw error
        return data
    }

    async handleValidationErrors(importLogId, errors) {
        // Log validation errors
        const errorDetails = errors.map((error, index) => ({
            import_log_id: importLogId,
            row_number: error.row || 0,
            row_data: {},
            error_message: error.message,
            error_type: error.type || 'validation'
        }))

        if (errorDetails.length > 0) {
            await supabase
                .from('import_log_details')
                .insert(errorDetails)
        }

        // Update import log status
        await supabase
            .from('import_logs')
            .update({
                status: 'failed',
                failed_rows: errors.length,
                completed_at: new Date().toISOString()
            })
            .eq('id', importLogId)
    }

    async processValidData(data, importLogId) {
        let processedRows = 0
        let failedRows = 0
        const errors = []

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i]
                await this.insertRow(row)
                processedRows++
            } catch (error) {
                failedRows++
                errors.push({
                    import_log_id: importLogId,
                    row_number: i + 1,
                    row_data: data[i],
                    error_message: error.message,
                    error_type: 'database'
                })
            }
        }

        // Insert error details
        if (errors.length > 0) {
            await supabase
                .from('import_log_details')
                .insert(errors)
        }

        return { processedRows, failedRows }
    }

    async insertRow(row) {
        const tableName = this.getTableName()
        const processedRow = this.processRowData(row)
        
        console.log('Inserting into table:', tableName)
        console.log('Data to insert:', processedRow)
        
        const { error } = await supabase
            .from(tableName)
            .insert(processedRow)

        if (error) {
            console.error('Database insert error:', error)
            throw new Error(`Database error: ${error.message}`)
        }
    }

    getTableName() {
        const tableMap = {
            'products': 'products',
            'bills': 'bills',
            'customers': 'customers'
        }
        return tableMap[this.importType]
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

    processRowData(row) {
        const baseData = {
            business_id: this.businessId,
            created_by: this.userId,
            created_at: new Date().toISOString()
        }

        // Apply column mapping for products
        const columnMapping = {
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
        }

        // Map row data to standard field names
        const mappedRow = {}
        for (const [key, value] of Object.entries(row)) {
            const mappedKey = columnMapping[key] || key
            mappedRow[mappedKey] = value
        }

        switch (this.importType) {
            case 'products':
                return {
                    ...baseData,
                    name: mappedRow.name,
                    description: mappedRow.description || '',
                    category: mappedRow.category || '',
                    price: this.cleanNumberValue(mappedRow.price) || 0,
                    stock_quantity: parseInt(this.cleanNumberValue(mappedRow.stock_quantity)) || 0,
                    min_stock_level: parseInt(this.cleanNumberValue(mappedRow.min_stock_level)) || 0,
                    sku: mappedRow.sku || '',
                    brand: mappedRow.brand || ''
                }
            
            case 'bills':
                return {
                    ...baseData,
                    customer_name: row.customer_name,
                    customer_email: row.customer_email || '',
                    customer_phone: row.customer_phone || '',
                    total_amount: parseFloat(row.total_amount) || 0,
                    status: row.status || 'draft',
                    notes: row.notes || '',
                    due_date: row.due_date ? new Date(row.due_date).toISOString() : null
                }
            
            case 'customers':
                return {
                    ...baseData,
                    name: row.name,
                    email: row.email,
                    phone: row.phone || '',
                    address: row.address || '',
                    company: row.company || ''
                }
            
            default:
                throw new Error(`Unknown import type: ${this.importType}`)
        }
    }

    async updateImportLog(importLogId, processResult) {
        const status = processResult.failedRows === 0 ? 'success' : 
                     processResult.processedRows === 0 ? 'failed' : 'partial'

        await supabase
            .from('import_logs')
            .update({
                successful_rows: processResult.processedRows,
                failed_rows: processResult.failedRows,
                status: status,
                completed_at: new Date().toISOString()
            })
            .eq('id', importLogId)
    }
}

// Utility function to get business ID from context
export async function getBusinessId(userId) {
    try {
        const { data, error } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single()

        if (error) {
            console.error('Database error:', error)
            throw new Error(`Database error: ${error.message}`)
        }

        if (!data) {
            throw new Error('No business found for this user. Please set up a business first.')
        }

        return data.business_id
    } catch (error) {
        console.error('Error in getBusinessId:', error)
        throw error
    }
}
