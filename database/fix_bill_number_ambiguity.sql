-- Fix bill_number column ambiguity issue
-- This script addresses the "column reference 'bill_number' is ambiguous" error

-- First, let's check if there are any conflicting columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'bill_number'
AND table_schema = 'public';

-- If bill_number exists in multiple tables, we need to be more specific
-- Let's check the current bills table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills'
ORDER BY ordinal_position;

-- If there's a bill_number column in bills table that's causing issues, let's rename it
-- or make sure it's unique
DO $$
BEGIN
    -- Check if bill_number column exists in bills table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bills' 
        AND column_name = 'bill_number'
    ) THEN
        -- Rename the column to avoid ambiguity
        ALTER TABLE bills RENAME COLUMN bill_number TO invoice_number;
        
        -- Add a comment to document the change
        COMMENT ON COLUMN bills.invoice_number IS 'Unique invoice number for the bill';
    END IF;
END $$;

-- Ensure the bills table has a proper structure without ambiguous columns
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
    bill_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing columns
ALTER TABLE bills ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE bills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing bills to have empty bill_items array if null
UPDATE bills SET bill_items = '[]'::jsonb WHERE bill_items IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_business_id ON bills(business_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_by ON bills(created_by);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_bill_items ON bills USING GIN (bill_items);

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Business members can access their business bills" ON bills;
DROP POLICY IF EXISTS "Users can insert bills for their business" ON bills;
DROP POLICY IF EXISTS "Users can update bills for their business" ON bills;
DROP POLICY IF EXISTS "Users can delete bills for their business" ON bills;

-- Create new RLS policies
CREATE POLICY "Business members can access their business bills" ON bills
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert bills for their business" ON bills
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update bills for their business" ON bills
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete bills for their business" ON bills
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );
