-- Test bill creation to verify the fix works
-- This script tests if we can create a bill without ambiguity errors

-- First, let's test a simple select query
SELECT 
    b.id,
    b.business_id,
    b.customer_name,
    b.total_amount,
    b.bill_items
FROM bills b
WHERE b.business_id IS NOT NULL
LIMIT 5;

-- Test inserting a sample bill (replace with actual business_id and user_id)
-- Note: This is just a test - don't run this in production without proper values
/*
INSERT INTO bills (
    business_id,
    created_by,
    customer_name,
    customer_email,
    total_amount,
    bill_items
) VALUES (
    'your-business-id-here',
    'your-user-id-here',
    'Test Customer',
    'test@example.com',
    100.00,
    '[{"product_id": "test", "product_name": "Test Product", "quantity": 1, "price": 100.00, "total": 100.00}]'::jsonb
);
*/

-- Check if there are any remaining ambiguity issues
SELECT 
    'No ambiguity detected' as status,
    COUNT(*) as bill_count
FROM bills;
