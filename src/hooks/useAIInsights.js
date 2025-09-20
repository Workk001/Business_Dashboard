'use client'

import { useState, useEffect, useCallback } from 'react';
import { aiInsightsEngine } from '../lib/ai/insights';
import { useBusiness } from '../context/BusinessContext';

export const useAIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentBusiness } = useBusiness();

  const fetchInsights = useCallback(async () => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll use the existing insights from the engine
      // In a real implementation, this would fetch from a database
      const data = aiInsightsEngine.getAllInsights();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id]);

  const generateInsights = useCallback(async () => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate insights using the engine
      await aiInsightsEngine.generateInsights({ businessId: currentBusiness.id });
      await fetchInsights(); // Refresh insights
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id, fetchInsights]);

  const markAsRead = useCallback(async (insightId) => {
    try {
      // For now, just update the local state
      // In a real implementation, this would update the database
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, is_read: true }
            : insight
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const getUnreadCount = useCallback(() => {
    return insights.filter(insight => !insight.is_read).length;
  }, [insights]);

  const getInsightsByType = useCallback((type) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const getInsightsByPriority = useCallback((priority) => {
    return insights.filter(insight => insight.priority === priority);
  }, [insights]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    fetchInsights,
    generateInsights,
    markAsRead,
    getUnreadCount,
    getInsightsByType,
    getInsightsByPriority
  };
};
