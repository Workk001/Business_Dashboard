-- Fixed bill creation script with CASCADE to handle dependencies
-- This script addresses the "bill_number" field error and ensures proper bill creation

-- 1. Drop triggers and functions with CASCADE to handle dependencies
DROP TRIGGER IF EXISTS set_bill_number_trigger ON bills CASCADE;
DROP TRIGGER IF EXISTS generate_bill_number_trigger ON bills CASCADE;
DROP TRIGGER IF EXISTS trigger_set_bill_number ON bills CASCADE;

-- 2. Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS generate_bill_number() CASCADE;
DROP FUNCTION IF EXISTS set_bill_number() CASCADE;

-- 3. Ensure the bills table has the correct structure
-- Add any missing columns that might be needed
ALTER TABLE bills 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bill_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Update existing records to have proper default values
UPDATE bills 
SET 
    subtotal = COALESCE(subtotal, 0),
    discount_rate = COALESCE(discount_rate, 0),
    discount_amount = COALESCE(discount_amount, 0),
    tax_rate = COALESCE(tax_rate, 0),
    tax_amount = COALESCE(tax_amount, 0),
    total_amount = COALESCE(total_amount, 0),
    bill_items = COALESCE(bill_items, '[]'::jsonb),
    status = COALESCE(status, 'draft'),
    notes = COALESCE(notes, '')
WHERE 
    subtotal IS NULL OR 
    discount_rate IS NULL OR 
    discount_amount IS NULL OR 
    tax_rate IS NULL OR 
    tax_amount IS NULL OR 
    total_amount IS NULL OR 
    bill_items IS NULL OR 
    status IS NULL;

-- 5. Create a function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_num TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_number
    FROM bills 
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    -- Format as INV-000001, INV-000002, etc.
    invoice_num := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set invoice_number if it's not already provided
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON bills;
CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON bills
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- 7. Ensure RLS policies are correct
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
DROP POLICY IF EXISTS "Users can insert their own bills" ON bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;

-- Create new policies
CREATE POLICY "Users can view their own bills" ON bills
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own bills" ON bills
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own bills" ON bills
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own bills" ON bills
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid()
        )
    );

-- 8. Test the fix by inserting a sample bill
INSERT INTO bills (
    business_id,
    created_by,
    customer_name,
    customer_email,
    customer_phone,
    subtotal,
    discount_rate,
    discount_amount,
    tax_rate,
    tax_amount,
    total_amount,
    notes,
    status,
    bill_items
) VALUES (
    (SELECT business_id FROM business_members LIMIT 1),
    (SELECT user_id FROM business_members LIMIT 1),
    'Test Customer',
    'test@example.com',
    '1234567890',
    100.00,
    10.00,
    10.00,
    5.00,
    4.50,
    94.50,
    'Test bill to verify fix',
    'draft',
    '[{"product_id": "test", "product_name": "Test Product", "quantity": 1, "price": 100.00, "total": 100.00}]'::jsonb
);

-- 9. Verify the test bill was created successfully
SELECT 
    id,
    invoice_number,
    customer_name,
    subtotal,
    total_amount,
    status,
    created_at
FROM bills 
ORDER BY created_at DESC 
LIMIT 1;

-- 10. Clean up the test bill
DELETE FROM bills WHERE customer_name = 'Test Customer';

-- Success message
SELECT 'Bill creation fix applied successfully!' as status;
