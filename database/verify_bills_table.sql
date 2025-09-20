-- Verify bills table structure
-- This script checks if the bills table has all required columns

-- Check if bills table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bills'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills'
ORDER BY ordinal_position;

-- Check if bill_items column exists and is JSONB
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills' 
AND column_name = 'bill_items';
