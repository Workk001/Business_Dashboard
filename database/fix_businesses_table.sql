-- Fix businesses table to include missing columns for business management
-- This adds the missing columns that the business form expects

-- Add missing columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Handle type column separately since it's an enum
-- First check what enum values are allowed
DO $$
BEGIN
    -- If type column doesn't exist, add it as VARCHAR
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'type'
    ) THEN
        ALTER TABLE businesses ADD COLUMN type VARCHAR(50) DEFAULT 'business';
    END IF;
END $$;

-- Update existing businesses to have default values if needed
UPDATE businesses 
SET 
    industry = 'other',
    website = '',
    phone = ''
WHERE industry IS NULL OR website IS NULL OR phone IS NULL;

-- Handle type column update separately for enum
DO $$
DECLARE
    enum_values text[];
BEGIN
    -- Get the allowed enum values
    SELECT array_agg(enumlabel) INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'business_type';
    
    -- If 'business' is not in the enum, use the first available value
    IF NOT ('business' = ANY(enum_values)) THEN
        IF array_length(enum_values, 1) > 0 THEN
            UPDATE businesses 
            SET type = enum_values[1]::business_type
            WHERE type IS NULL;
        END IF;
    ELSE
        UPDATE businesses 
        SET type = 'business'::business_type
        WHERE type IS NULL;
    END IF;
END $$;

-- Handle address column separately since it might be JSON type
-- First check if address column exists and what type it is
DO $$
BEGIN
    -- If address column doesn't exist, add it as TEXT
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'address'
    ) THEN
        ALTER TABLE businesses ADD COLUMN address TEXT;
    END IF;
    
    -- If address is JSON type, update it to be a valid JSON object
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'address' 
        AND data_type = 'json'
    ) THEN
        UPDATE businesses 
        SET address = '{}'::json
        WHERE address IS NULL;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'address' 
        AND data_type = 'text'
    ) THEN
        -- If it's TEXT type, set empty string
        UPDATE businesses 
        SET address = ''
        WHERE address IS NULL;
    END IF;
END $$;

-- Add comments to document the new columns
COMMENT ON COLUMN businesses.industry IS 'Business industry/sector';
COMMENT ON COLUMN businesses.website IS 'Business website URL';
COMMENT ON COLUMN businesses.phone IS 'Business phone number';
COMMENT ON COLUMN businesses.address IS 'Business physical address';

-- Create index on industry for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry);
