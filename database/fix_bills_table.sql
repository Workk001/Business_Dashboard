-- Fix bills table to support bill items
-- Add bill_items column to store item details as JSON

-- Add bill_items column to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_items JSONB;

-- Add discount and tax columns if they don't exist
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax DECIMAL(5,2) DEFAULT 0;

-- Update existing bills to have empty bill_items array
UPDATE bills SET bill_items = '[]' WHERE bill_items IS NULL;

-- Create index on bill_items for better performance
CREATE INDEX IF NOT EXISTS idx_bills_bill_items ON bills USING GIN (bill_items);
