'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const LoadingSpinner = ({ 
  size = 'md',
  className,
  ...props 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <motion.div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <motion.svg
        className={cn('animate-spin text-blue-600', sizes[size])}
        fill="none"
        viewBox="0 0 24 24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </motion.svg>
    </motion.div>
  )
}

const SkeletonLoader = ({ className, ...props }) => (
  <motion.div
    className={cn('animate-pulse bg-gray-200 rounded', className)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    {...props}
  />
)

const LoadingCard = ({ className, ...props }) => (
  <div className={cn('p-6 space-y-4', className)} {...props}>
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-4 w-1/2" />
    <SkeletonLoader className="h-8 w-1/4" />
  </div>
)

export { LoadingSpinner, SkeletonLoader, LoadingCard }
