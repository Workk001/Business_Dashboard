-- Simple fix for businesses table - add missing columns only
-- This avoids JSON and enum issues

-- Add missing columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Set default values for new columns
UPDATE businesses 
SET 
    industry = COALESCE(industry, 'other'),
    website = COALESCE(website, ''),
    phone = COALESCE(phone, '')
WHERE industry IS NULL OR website IS NULL OR phone IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN businesses.industry IS 'Business industry/sector';
COMMENT ON COLUMN businesses.website IS 'Business website URL';
COMMENT ON COLUMN businesses.phone IS 'Business phone number';

-- Create index on industry for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry);



