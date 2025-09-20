import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatNumber(number) {
  return new Intl.NumberFormat('en-IN').format(number)
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStockLevelColor(stock, minStock) {
  if (stock === 0) return 'red'
  if (stock <= minStock) return 'yellow'
  if (stock <= minStock * 2) return 'orange'
  return 'green'
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'green'
    default: return 'gray'
  }
}
