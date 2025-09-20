-- Temporarily disable RLS for testing
-- This will allow user creation without authentication context

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_settings table  
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on business_members table
ALTER TABLE business_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on businesses table
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
