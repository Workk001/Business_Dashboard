-- Step 1: Add 'business' to the enum type
-- Run this first, then run step 2

DO $$
DECLARE
    enum_exists boolean;
BEGIN
    -- Check if 'business' exists in the business_type enum
    SELECT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'business_type' AND e.enumlabel = 'business'
    ) INTO enum_exists;
    
    -- If 'business' doesn't exist, add it to the enum
    IF NOT enum_exists THEN
        ALTER TYPE business_type ADD VALUE 'business';
    END IF;
END $$;
