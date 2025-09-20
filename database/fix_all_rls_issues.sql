-- Comprehensive fix for all RLS issues
-- This script will fix the infinite recursion and other RLS problems

-- First, disable RLS temporarily to clear all policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view business members of their businesses" ON business_members;
DROP POLICY IF EXISTS "Owners can manage business members" ON business_members;
DROP POLICY IF EXISTS "Allow all operations on business_members" ON business_members;
DROP POLICY IF EXISTS "Users can view businesses they belong to" ON businesses;
DROP POLICY IF EXISTS "Owners can create businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Allow all operations on businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view products from their businesses" ON products;
DROP POLICY IF EXISTS "Owners and staff can insert products" ON products;
DROP POLICY IF EXISTS "Owners and staff can update products" ON products;
DROP POLICY IF EXISTS "Owners can delete products" ON products;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Users can view bills from their businesses" ON bills;
DROP POLICY IF EXISTS "Owners and staff can create bills" ON bills;
DROP POLICY IF EXISTS "Users can update bills they created" ON bills;
DROP POLICY IF EXISTS "Owners can update all bills in their businesses" ON bills;
DROP POLICY IF EXISTS "Owners can delete bills in their businesses" ON bills;
DROP POLICY IF EXISTS "Allow all operations on bills" ON bills;
DROP POLICY IF EXISTS "Users can view bill items from their businesses" ON bill_items;
DROP POLICY IF EXISTS "Users can manage bill items for their bills" ON bill_items;
DROP POLICY IF EXISTS "Owners can manage all bill items in their businesses" ON bill_items;
DROP POLICY IF EXISTS "Allow all operations on bill_items" ON bill_items;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON user_settings;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- These allow all operations for now (we'll add proper security later)

-- Users table policies
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- User settings table policies  
CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Business members table policies
CREATE POLICY "Allow all operations on business_members" ON business_members
    FOR ALL USING (true) WITH CHECK (true);

-- Businesses table policies
CREATE POLICY "Allow all operations on businesses" ON businesses
    FOR ALL USING (true) WITH CHECK (true);

-- Products table policies
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true) WITH CHECK (true);

-- Bills table policies
CREATE POLICY "Allow all operations on bills" ON bills
    FOR ALL USING (true) WITH CHECK (true);

-- Bill items table policies
CREATE POLICY "Allow all operations on bill_items" ON bill_items
    FOR ALL USING (true) WITH CHECK (true);
