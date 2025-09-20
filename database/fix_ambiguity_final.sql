-- Final fix for bill_number ambiguity error
-- This script addresses the specific error you're encountering

-- First, let's check if there are any bill_number columns causing conflicts
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'bill_number'
AND table_schema = 'public';

-- Check if there are any views or functions that might be causing the issue
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND (table_name LIKE '%bill%' OR table_name LIKE '%invoice%')
ORDER BY table_name;

-- If bill_number exists anywhere, let's rename it to avoid conflicts
DO $$
BEGIN
    -- Check if bill_number column exists in any table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'bill_number'
    ) THEN
        -- Rename bill_number to invoice_number in bills table if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bills' 
            AND column_name = 'bill_number'
        ) THEN
            ALTER TABLE bills RENAME COLUMN bill_number TO invoice_number;
        END IF;
        
        -- Rename bill_number to invoice_number in bill_items table if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bill_items' 
            AND column_name = 'bill_number'
        ) THEN
            ALTER TABLE bill_items RENAME COLUMN bill_number TO invoice_number;
        END IF;
    END IF;
END $$;

-- Ensure bills table has the correct structure
CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL,
    created_by UUID NOT NULL,
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

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add business_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bills_business_id_fkey'
        AND table_name = 'bills'
    ) THEN
        ALTER TABLE bills ADD CONSTRAINT bills_business_id_fkey 
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
    
    -- Add created_by foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bills_created_by_fkey'
        AND table_name = 'bills'
    ) THEN
        ALTER TABLE bills ADD CONSTRAINT bills_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add any missing columns
ALTER TABLE bills ADD COLUMN IF NOT EXISTS business_id UUID;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax DECIMAL(5,2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_items JSONB;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Set default values
UPDATE bills SET bill_items = '[]'::jsonb WHERE bill_items IS NULL;
UPDATE bills SET status = 'pending' WHERE status IS NULL;
UPDATE bills SET total_amount = 0 WHERE total_amount IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bills_business_id ON bills(business_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_by ON bills(created_by);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_bill_items ON bills USING GIN (bill_items);

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
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

-- Final verification
SELECT 
    'bills' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills'
ORDER BY ordinal_position;
