'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, DocumentTextIcon, CubeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'

const FloatingActionButton = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      id: 'bill',
      label: 'New Bill',
      icon: DocumentTextIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onAction('bill')
    },
    {
      id: 'product',
      label: 'Add Product',
      icon: CubeIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onAction('product')
    },
    {
      id: 'report',
      label: 'Quick Report',
      icon: ChartBarIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onAction('report')
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={action.onClick}
                  className={`${action.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <PlusIcon className="h-6 w-6" />
      </motion.button>
    </div>
  )
}

export { FloatingActionButton }
