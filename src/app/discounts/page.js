'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import DiscountModal from '../../components/discounts/DiscountModal';
import { getDiscountRules, deleteDiscountRule } from '../../lib/discounts/rules';
import { useBusiness } from '../../context/BusinessContext';
import { Button } from '../../components/Button';

const DiscountsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [discountRules, setDiscountRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchDiscountRules = async () => {
    if (!currentBusiness?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await getDiscountRules(currentBusiness.id);
      setDiscountRules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountRules();
  }, [currentBusiness?.id]);

  const handleCreateRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this discount rule?')) return;
    
    try {
      await deleteDiscountRule(ruleId);
      await fetchDiscountRules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModalSuccess = () => {
    fetchDiscountRules();
  };

  const formatConditions = (conditions) => {
    const parts = [];
    
    if (conditions.min_amount) {
      parts.push(`Min amount: $${conditions.min_amount}`);
    }
    if (conditions.min_quantity) {
      parts.push(`Min quantity: ${conditions.min_quantity}`);
    }
    if (conditions.categories && conditions.categories.length > 0) {
      parts.push(`Categories: ${conditions.categories.join(', ')}`);
    }
    if (conditions.start_date || conditions.end_date) {
      const start = conditions.start_date ? new Date(conditions.start_date).toLocaleDateString() : 'Any';
      const end = conditions.end_date ? new Date(conditions.end_date).toLocaleDateString() : 'Any';
      parts.push(`Valid: ${start} - ${end}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'No conditions';
  };

  const getDiscountDisplay = (rule) => {
    switch (rule.type) {
      case 'percentage':
        return `${rule.discount_value}%`;
      case 'fixed':
        return `$${rule.discount_value}`;
      case 'bulk':
        return `${rule.discount_value}% (bulk)`;
      default:
        return rule.discount_value;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProtectedRoute requiredPermissions={['canViewBills']}>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Discount Rules
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage automatic discount rules for your business
                </p>
              </div>
              <Button
                onClick={handleCreateRule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Create Discount Rule
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : discountRules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No discount rules yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first discount rule to automatically apply discounts to bills
              </p>
              <Button
                onClick={handleCreateRule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {discountRules.map((rule) => (
                <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.is_active 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                          {getDiscountDisplay(rule)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {formatConditions(rule.conditions)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Created {new Date(rule.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DiscountModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            discountRule={editingRule}
            onSuccess={handleModalSuccess}
          />
        </ProtectedRoute>
      </div>
    </div>
  );
};

export default DiscountsPage;
