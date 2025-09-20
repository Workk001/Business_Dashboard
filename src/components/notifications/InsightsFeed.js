'use client'

import React from 'react';
import { useAIInsights } from '../../hooks/useAIInsights';
import AlertCard from './AlertCard';
import { Button } from '../Button';

const InsightsFeed = () => {
  const { 
    insights, 
    loading, 
    error, 
    generateInsights, 
    markAsRead,
    getUnreadCount 
  } = useAIInsights();

  const unreadCount = getUnreadCount();

  const handleGenerateInsights = async () => {
    await generateInsights();
  };

  const handleMarkAsRead = async (insightId) => {
    await markAsRead(insightId);
  };

  if (loading && insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {loading ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-red-800 dark:text-red-200 text-sm">
              Error: {error}
            </p>
          </div>
        )}

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No insights yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Generate AI-powered insights to get started with business intelligence.
            </p>
            <Button
              onClick={handleGenerateInsights}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Generate First Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <AlertCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={() => handleMarkAsRead(insight.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsFeed;
