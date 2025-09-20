'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getPriorityColor } from '@/lib/utils'

const InsightCard = ({ 
  insight, 
  onAction,
  index = 0,
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const priorityColor = getPriorityColor(insight.priority)
  
  const colorClasses = {
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50'
  }

  const iconClasses = {
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100'
  }

  const handleAction = (action) => {
    if (onAction) {
      onAction(insight, action)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      {...props}
    >
      <Card 
        className={`border-l-4 ${colorClasses[priorityColor] || colorClasses.blue}`}
        hover
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${iconClasses[priorityColor] || iconClasses.blue}`}>
                {insight.icon && (() => {
                  const IconComponent = insight.icon
                  return <IconComponent className="h-5 w-5" />
                })()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {insight.title}
                  </h3>
                  <Badge 
                    variant={priorityColor === 'red' ? 'danger' : 
                            priorityColor === 'yellow' ? 'warning' : 
                            priorityColor === 'green' ? 'success' : 'default'}
                    size="sm"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {insight.message}
                </p>

                <AnimatePresence>
                  {isExpanded && insight.actionData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-white rounded-md border"
                    >
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Details:</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(insight.actionData, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {insight.action && (
                <Button
                  size="sm"
                  variant={priorityColor === 'red' ? 'danger' : 'primary'}
                  onClick={() => handleAction(insight.action)}
                >
                  {insight.action === 'reorder' ? 'Reorder Now' :
                   insight.action === 'urgent_reorder' ? 'Urgent Reorder' :
                   insight.action === 'view_details' ? 'View Details' :
                   insight.action === 're_engagement_campaign' ? 'Start Campaign' :
                   'Take Action'}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <motion.svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export { InsightCard }
