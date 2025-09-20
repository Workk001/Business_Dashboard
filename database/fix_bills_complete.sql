-- Complete fix for bills table
-- This script ensures all required columns exist for bill creation

-- First, ensure the bills table exists
CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(5,2) DEFAULT 0,
    tax DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bill_items column if it doesn't exist
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_items JSONB DEFAULT '[]'::jsonb;

-- Add any missing columns that might be needed
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing bills to have empty bill_items array if null
UPDATE bills SET bill_items = '[]'::jsonb WHERE bill_items IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_business_id ON bills(business_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_by ON bills(created_by);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_bill_items ON bills USING GIN (bill_items);

-- Add RLS policies if they don't exist
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policy for business members to access their business bills
DROP POLICY IF EXISTS "Business members can access their business bills" ON bills;
CREATE POLICY "Business members can access their business bills" ON bills
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for users to insert bills for their business
DROP POLICY IF EXISTS "Users can insert bills for their business" ON bills;
CREATE POLICY "Users can insert bills for their business" ON bills
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for users to update bills for their business
DROP POLICY IF EXISTS "Users can update bills for their business" ON bills;
CREATE POLICY "Users can update bills for their business" ON bills
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for users to delete bills for their business
DROP POLICY IF EXISTS "Users can delete bills for their business" ON bills;
CREATE POLICY "Users can delete bills for their business" ON bills
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );
