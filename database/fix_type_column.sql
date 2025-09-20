-- Fix the type column to accept 'business' value
-- This handles the enum constraint issue

-- First, check if 'business' is a valid enum value
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

-- Set default value for existing records
UPDATE businesses 
SET type = 'business'::business_type
WHERE type IS NULL;

-- Add default constraint to the column
ALTER TABLE businesses 
ALTER COLUMN type SET DEFAULT 'business'::business_type;
