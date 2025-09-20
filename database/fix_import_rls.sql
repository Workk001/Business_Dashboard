-- Fix RLS policies for import functionality
-- This ensures users can create import logs for their businesses

-- First, make sure import_logs table exists
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    error_log JSONB,
    validation_errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create import_log_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS import_log_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_log_id UUID NOT NULL REFERENCES import_logs(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    row_data JSONB,
    error_message TEXT NOT NULL,
    error_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_log_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their business import logs" ON import_logs;
DROP POLICY IF EXISTS "Users can create import logs for their businesses" ON import_logs;
DROP POLICY IF EXISTS "Users can update their import logs" ON import_logs;
DROP POLICY IF EXISTS "Users can view their business import log details" ON import_log_details;
DROP POLICY IF EXISTS "Users can create import log details for their business imports" ON import_log_details;

-- Create new RLS policies for import_logs
CREATE POLICY "Users can view their business import logs" ON import_logs
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create import logs for their businesses" ON import_logs
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        ) AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their import logs" ON import_logs
    FOR UPDATE USING (
        user_id = auth.uid() AND
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create RLS policies for import_log_details
CREATE POLICY "Users can view their business import log details" ON import_log_details
    FOR SELECT USING (
        import_log_id IN (
            SELECT id FROM import_logs 
            WHERE business_id IN (
                SELECT business_id FROM business_members 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

CREATE POLICY "Users can create import log details for their business imports" ON import_log_details
    FOR INSERT WITH CHECK (
        import_log_id IN (
            SELECT id FROM import_logs 
            WHERE business_id IN (
                SELECT business_id FROM business_members 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_import_logs_business_id ON import_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_user_id ON import_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_import_type ON import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_log_details_import_log_id ON import_log_details(import_log_id);
