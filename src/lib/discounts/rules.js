import { supabase } from '../supabase';

export const createDiscountRule = async (businessId, ruleData) => {
  try {
    const { data, error } = await supabase
      .from('discount_rules')
      .insert({
        business_id: businessId,
        name: ruleData.name,
        type: ruleData.type,
        conditions: ruleData.conditions,
        discount_value: ruleData.discount_value,
        is_active: ruleData.is_active ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating discount rule:', error);
    throw error;
  }
};

export const getDiscountRules = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching discount rules:', error);
    throw error;
  }
};

export const updateDiscountRule = async (ruleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('discount_rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating discount rule:', error);
    throw error;
  }
};

export const deleteDiscountRule = async (ruleId) => {
  try {
    const { error } = await supabase
      .from('discount_rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting discount rule:', error);
    throw error;
  }
};

export const evaluateDiscountRules = (rules, billData) => {
  const applicableRules = [];

  for (const rule of rules) {
    if (isRuleApplicable(rule, billData)) {
      applicableRules.push(rule);
    }
  }

  // Sort by discount value (highest first)
  return applicableRules.sort((a, b) => b.discount_value - a.discount_value);
};

const isRuleApplicable = (rule, billData) => {
  const { conditions } = rule;
  
  // Check minimum amount condition
  if (conditions.min_amount && billData.totalAmount < conditions.min_amount) {
    return false;
  }

  // Check category condition
  if (conditions.categories && conditions.categories.length > 0) {
    const billCategories = billData.items.map(item => item.category).filter(Boolean);
    const hasMatchingCategory = conditions.categories.some(category => 
      billCategories.includes(category)
    );
    if (!hasMatchingCategory) {
      return false;
    }
  }

  // Check quantity condition
  if (conditions.min_quantity && billData.totalQuantity < conditions.min_quantity) {
    return false;
  }

  // Check date range condition
  if (conditions.start_date || conditions.end_date) {
    const billDate = new Date(billData.createdAt);
    if (conditions.start_date && billDate < new Date(conditions.start_date)) {
      return false;
    }
    if (conditions.end_date && billDate > new Date(conditions.end_date)) {
      return false;
    }
  }

  return true;
};

export const calculateDiscount = (rule, billData) => {
  const { type, discount_value } = rule;
  const { totalAmount } = billData;

  switch (type) {
    case 'percentage':
      return (totalAmount * discount_value) / 100;
    case 'fixed':
      return Math.min(discount_value, totalAmount);
    case 'bulk':
      // For bulk discounts, apply based on quantity tiers
      const quantity = billData.totalQuantity;
      if (quantity >= 10) {
        return (totalAmount * discount_value) / 100;
      }
      return 0;
    default:
      return 0;
  }
};
