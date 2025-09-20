'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Card = ({ 
  children, 
  className, 
  hover = false,
  clickable = false,
  onClick,
  ...props 
}) => {
  const cardClasses = cn(
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    hover && 'hover:shadow-md transition-shadow duration-200',
    clickable && 'cursor-pointer hover:border-gray-300',
    className
  )

  const MotionCard = motion.div

  return (
    <MotionCard
      className={cardClasses}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </MotionCard>
  )
}

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)} {...props}>
    {children}
  </div>
)

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardContent, CardFooter }
