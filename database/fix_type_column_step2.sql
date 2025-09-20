-- Step 2: Update existing records and set default
-- Run this AFTER step 1

-- Set default value for existing records
UPDATE businesses 
SET type = 'business'::business_type
WHERE type IS NULL;

-- Add default constraint to the column
ALTER TABLE businesses 
ALTER COLUMN type SET DEFAULT 'business'::business_type;
