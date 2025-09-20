-- Quick check of bills table status
-- Run this in Supabase SQL editor to see current table structure

-- Check if bills table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'bills'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as table_status;

-- Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'bills' 
AND schemaname = 'public';

-- Check RLS policies
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'bills' 
AND schemaname = 'public';
