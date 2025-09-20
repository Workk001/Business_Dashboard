import { useSettings } from '@/context/SettingsContext'

export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount)
}

export const getCurrencySymbol = (currency = 'USD') => {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'C$',
        'AUD': 'A$',
        'JPY': '¥'
    }
    return symbols[currency] || '$'
}

// Hook version that uses user settings
export const useFormatCurrency = () => {
    const { settings } = useSettings()
    
    const format = (amount) => {
        return formatCurrency(amount, settings.currency)
    }
    
    return {
        format,
        currency: settings.currency,
        symbol: getCurrencySymbol(settings.currency)
    }
}
