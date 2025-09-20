'use client'

import React, { useState } from 'react';
import { useAIInsights } from '../../hooks/useAIInsights';
import AlertCard from './AlertCard';
import { Button } from '../Button';

const NotificationCenter = () => {
  const { 
    insights, 
    loading, 
    generateInsights, 
    markAsRead,
    getUnreadCount,
    getInsightsByType,
    getInsightsByPriority 
  } = useAIInsights();

  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const unreadCount = getUnreadCount();

  const filteredInsights = insights.filter(insight => {
    const typeMatch = filter === 'all' || insight.type === filter;
    const priorityMatch = priorityFilter === 'all' || insight.priority === priorityFilter;
    return typeMatch && priorityMatch;
  });

  const handleMarkAllAsRead = async () => {
    const unreadInsights = insights.filter(insight => !insight.is_read);
    for (const insight of unreadInsights) {
      await markAsRead(insight.id);
    }
  };

  const insightTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'stock_alert', label: 'Stock Alerts' },
    { value: 'sales_trend', label: 'Sales Trends' },
    { value: 'revenue_forecast', label: 'Revenue Forecast' },
    { value: 'category_performance', label: 'Category Performance' },
    { value: 'pricing_optimization', label: 'Pricing Optimization' }
  ];

  const priorityLevels = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={generateInsights}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {insightTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {priorityLevels.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && insights.length === 0 ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' && priorityFilter === 'all' 
                ? 'No insights available. Generate some insights to get started.'
                : 'No notifications match your current filters.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <AlertCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={() => markAsRead(insight.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
