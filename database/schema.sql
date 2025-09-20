-- Business Dashboard Database Schema
-- This file contains the complete database schema with RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'staff', 'accountant');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued');
CREATE TYPE bill_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE business_type AS ENUM ('clothing', 'grocery', 'electronics', 'restaurant', 'pharmacy', 'hardware', 'other');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type business_type NOT NULL,
    description TEXT,
    address JSONB, -- {street, city, state, zip, country}
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    tax_id VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business members table (many-to-many relationship)
CREATE TABLE business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    notifications JSONB DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User passwords table (for custom auth)
CREATE TABLE user_passwords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    category VARCHAR(100),
    brand VARCHAR(100),
    status product_status DEFAULT 'active',
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) CHECK (cost >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 0 CHECK (min_stock_level >= 0),
    max_stock_level INTEGER,
    unit VARCHAR(20) DEFAULT 'pcs',
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height}
    images JSONB DEFAULT '[]', -- Array of image URLs
    tags TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, sku)
);

-- Bills table
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address JSONB, -- {street, city, state, zip, country}
    status bill_status DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, bill_number)
);

-- Bill items table (for line items in bills)
CREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Store product name for historical records
    description TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_businesses_created_by ON businesses(created_by);
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_business_members_role ON business_members(role);
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_sku ON products(business_id, sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_bills_business_id ON bills(business_id);
CREATE INDEX idx_bills_bill_number ON bills(business_id, bill_number);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created_by ON bills(created_by);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_items_product_id ON bill_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_passwords_updated_at BEFORE UPDATE ON user_passwords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for businesses table
CREATE POLICY "Users can view businesses they belong to" ON businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = businesses.id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Owners can create businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their businesses" ON businesses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = businesses.id 
            AND user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = true
        )
    );

-- RLS Policies for business_members table
CREATE POLICY "Users can view business members of their businesses" ON business_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_members bm2
            WHERE bm2.business_id = business_members.business_id 
            AND bm2.user_id = auth.uid() 
            AND bm2.is_active = true
        )
    );

CREATE POLICY "Owners can manage business members" ON business_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM business_members bm
            WHERE bm.business_id = business_members.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- RLS Policies for user_settings table
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_passwords table
CREATE POLICY "Users can view their own password" ON user_passwords
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own password" ON user_passwords
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own password" ON user_passwords
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for products table
CREATE POLICY "Users can view products from their businesses" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = products.business_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Owners and staff can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = products.business_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'staff')
            AND is_active = true
        )
    );

CREATE POLICY "Owners and staff can update products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = products.business_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'staff')
            AND is_active = true
        )
    );

CREATE POLICY "Owners can delete products" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = products.business_id 
            AND user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = true
        )
    );

-- RLS Policies for bills table
CREATE POLICY "Users can view bills from their businesses" ON bills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = bills.business_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Owners and staff can create bills" ON bills
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = bills.business_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'staff')
            AND is_active = true
        )
    );

CREATE POLICY "Users can update bills they created" ON bills
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Owners can update all bills in their businesses" ON bills
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = bills.business_id 
            AND user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = true
        )
    );

CREATE POLICY "Owners can delete bills in their businesses" ON bills
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM business_members 
            WHERE business_id = bills.business_id 
            AND user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = true
        )
    );

-- RLS Policies for bill_items table
CREATE POLICY "Users can view bill items from their businesses" ON bill_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bills b
            JOIN business_members bm ON b.business_id = bm.business_id
            WHERE b.id = bill_items.bill_id 
            AND bm.user_id = auth.uid() 
            AND bm.is_active = true
        )
    );

CREATE POLICY "Users can manage bill items for their bills" ON bill_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE id = bill_items.bill_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Owners can manage all bill items in their businesses" ON bill_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bills b
            JOIN business_members bm ON b.business_id = bm.business_id
            WHERE b.id = bill_items.bill_id 
            AND bm.user_id = auth.uid() 
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- Create a function to generate bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number(business_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    bill_number TEXT;
    business_prefix TEXT;
BEGIN
    -- Get business prefix (first 3 letters of business name or default)
    SELECT COALESCE(UPPER(SUBSTRING(name FROM 1 FOR 3)), 'BILL')
    INTO business_prefix
    FROM businesses
    WHERE id = business_uuid;
    
    -- Get the next sequential number for this business
    SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM business_prefix || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM bills
    WHERE business_id = business_uuid
    AND bill_number ~ ('^' || business_prefix || '-\d+$');
    
    -- Format as PREFIX-000001, PREFIX-000002, etc.
    bill_number := business_prefix || '-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN bill_number;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate bill numbers
CREATE OR REPLACE FUNCTION set_bill_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
        NEW.bill_number := generate_bill_number(NEW.business_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_bill_number
    BEFORE INSERT ON bills
    FOR EACH ROW
    EXECUTE FUNCTION set_bill_number();

-- Create a function to calculate bill totals
CREATE OR REPLACE FUNCTION calculate_bill_total(bill_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    subtotal DECIMAL(10,2);
    tax_amount DECIMAL(10,2);
    discount_amount DECIMAL(10,2);
    total DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from bill items
    SELECT COALESCE(SUM(total_price), 0)
    INTO subtotal
    FROM bill_items
    WHERE bill_id = bill_uuid;
    
    -- Get tax and discount rates from bill
    SELECT 
        COALESCE(tax_rate, 0),
        COALESCE(discount_rate, 0)
    INTO tax_amount, discount_amount
    FROM bills
    WHERE id = bill_uuid;
    
    -- Calculate tax and discount amounts
    tax_amount := subtotal * (tax_amount / 100);
    discount_amount := subtotal * (discount_amount / 100);
    
    -- Calculate total
    total := subtotal + tax_amount - discount_amount;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-calculate bill totals
CREATE OR REPLACE FUNCTION update_bill_totals()
RETURNS TRIGGER AS $$
DECLARE
    bill_uuid UUID;
    subtotal DECIMAL(10,2);
    total DECIMAL(10,2);
BEGIN
    -- Get bill_id from the trigger context
    IF TG_TABLE_NAME = 'bill_items' THEN
        bill_uuid := NEW.bill_id;
    ELSE
        bill_uuid := NEW.id;
    END IF;
    
    -- Calculate subtotal
    SELECT COALESCE(SUM(total_price), 0)
    INTO subtotal
    FROM bill_items
    WHERE bill_id = bill_uuid;
    
    -- Calculate total
    total := calculate_bill_total(bill_uuid);
    
    -- Update the bill
    UPDATE bills
    SET 
        subtotal = subtotal,
        tax_amount = subtotal * (COALESCE(tax_rate, 0) / 100),
        discount_amount = subtotal * (COALESCE(discount_rate, 0) / 100),
        total_amount = total,
        updated_at = NOW()
    WHERE id = bill_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-calculating totals
CREATE TRIGGER trigger_update_bill_totals_items
    AFTER INSERT OR UPDATE OR DELETE ON bill_items
    FOR EACH ROW
    EXECUTE FUNCTION update_bill_totals();

CREATE TRIGGER trigger_update_bill_totals_bills
    AFTER UPDATE OF tax_rate, discount_rate ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_bill_totals();

-- Create a function to add business owner as member
CREATE OR REPLACE FUNCTION add_business_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the creator as owner of the business
    INSERT INTO business_members (business_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add owner as member
CREATE TRIGGER trigger_add_business_owner
    AFTER INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION add_business_owner_as_member();
