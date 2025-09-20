-- Check what values are allowed in the business_type enum
SELECT enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'business_type'
ORDER BY e.enumsortorder;
