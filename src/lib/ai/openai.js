// Mock OpenAI implementation - replace with real OpenAI when package is installed
// To enable real AI insights, install: npm install openai

let openai = null;

// Try to import OpenAI, but don't fail if it's not available
try {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.log('OpenAI not available - using mock responses');
}

export const generateBusinessInsights = async (businessData) => {
  // If OpenAI is not available, return mock insights
  if (!openai || !process.env.OPENAI_API_KEY) {
    return generateMockInsights(businessData);
  }

  try {
    const prompt = `
    Analyze this business data and provide actionable insights:
    
    Business Type: ${businessData.businessType}
    Total Products: ${businessData.totalProducts}
    Total Bills: ${businessData.totalBills}
    Total Revenue: ${businessData.totalRevenue}
    Recent Sales: ${JSON.stringify(businessData.recentSales)}
    Product Categories: ${JSON.stringify(businessData.categories)}
    Low Stock Items: ${JSON.stringify(businessData.lowStockItems)}
    
    Provide 3-5 specific, actionable insights in this format:
    1. [INSIGHT_TYPE] - [Title]: [Description] (Priority: [high/medium/low])
    2. [INSIGHT_TYPE] - [Title]: [Description] (Priority: [high/medium/low])
    
    Insight types: stock_alert, sales_trend, revenue_forecast, category_performance, pricing_optimization
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a business intelligence assistant. Analyze business data and provide specific, actionable insights that help business owners make better decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateMockInsights(businessData);
  }
};

export const generateStockAlert = async (productData) => {
  // If OpenAI is not available, return mock alert
  if (!openai || !process.env.OPENAI_API_KEY) {
    return generateMockStockAlert(productData);
  }

  try {
    const prompt = `
    Analyze this product's stock situation:
    Product: ${productData.name}
    Current Stock: ${productData.stock}
    Min Stock: ${productData.minStock}
    Sales Rate: ${productData.salesRate} units/day
    Lead Time: ${productData.leadTime} days
    
    Provide a stock alert with:
    1. Alert level (critical/high/medium/low)
    2. Recommended action
    3. Urgency timeline
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an inventory management assistant. Analyze stock levels and provide urgent, actionable alerts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.5
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating stock alert:', error);
    return generateMockStockAlert(productData);
  }
};

export const generateRevenueForecast = async (revenueData) => {
  // If OpenAI is not available, return mock forecast
  if (!openai || !process.env.OPENAI_API_KEY) {
    return generateMockRevenueForecast(revenueData);
  }

  try {
    const prompt = `
    Analyze this revenue data and provide a forecast:
    Current Month Revenue: ${revenueData.currentMonth}
    Previous Month Revenue: ${revenueData.previousMonth}
    Growth Rate: ${revenueData.growthRate}%
    Seasonal Factors: ${revenueData.seasonalFactors}
    
    Provide:
    1. Next month revenue forecast
    2. Growth trend analysis
    3. Recommendations for improvement
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial forecasting assistant. Analyze revenue trends and provide accurate predictions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.6
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating revenue forecast:', error);
    return generateMockRevenueForecast(revenueData);
  }
};

// Mock functions for when OpenAI is not available
const generateMockInsights = (businessData) => {
  const insights = [];
  
  if (businessData.totalProducts === 0) {
    insights.push(
      'pricing_optimization - Add Products: Your business has no products yet. Start by adding your first products to begin generating revenue. (Priority: high)'
    );
  }
  
  if (businessData.lowStockItems.length > 0) {
    insights.push(
      'stock_alert - Low Stock Alert: You have items running low on stock. Consider reordering to avoid stockouts. (Priority: high)'
    );
  }
  
  if (businessData.totalRevenue === 0) {
    insights.push(
      'sales_trend - Generate Sales: No revenue recorded yet. Create some bills to start tracking your sales performance. (Priority: medium)'
    );
  }
  
  if (businessData.totalProducts > 0 && businessData.totalRevenue === 0) {
    insights.push(
      'category_performance - Review Pricing: You have products but no sales. Consider reviewing your pricing strategy or marketing efforts. (Priority: medium)'
    );
  }
  
  insights.push(
    'revenue_forecast - Track Performance: Set up regular reporting to track your business performance and identify growth opportunities. (Priority: low)'
  );
  
  return insights.join('\n');
};

const generateMockStockAlert = (productData) => {
  const stockLevel = productData.stock / productData.minStock;
  
  if (stockLevel <= 0.5) {
    return 'Critical: Stock is at 50% or below minimum level. Reorder immediately to avoid stockout.';
  } else if (stockLevel <= 1) {
    return 'High: Stock is at minimum level. Consider placing an order within 1-2 days.';
  } else if (stockLevel <= 1.5) {
    return 'Medium: Stock is low. Plan to reorder soon.';
  } else {
    return 'Low: Stock levels are adequate for now.';
  }
};

const generateMockRevenueForecast = (revenueData) => {
  const growth = revenueData.growthRate || 0;
  
  if (growth > 10) {
    return 'Strong growth trend detected. Next month forecast: +15% revenue growth expected. Continue current strategies.';
  } else if (growth > 0) {
    return 'Steady growth trend. Next month forecast: +5% revenue growth expected. Consider expansion opportunities.';
  } else {
    return 'Flat or declining trend. Next month forecast: Similar to current month. Focus on marketing and sales improvement.';
  }
};
