-- Phase 4: Dataset Upload & Import Schema
-- This file contains the database schema for import functionality

-- Import logs table
CREATE TABLE import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    import_type VARCHAR(50) NOT NULL, -- 'products', 'bills', 'customers'
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'processing', -- 'processing', 'success', 'failed', 'partial'
    error_log JSONB, -- Detailed error information for failed rows
    validation_errors JSONB, -- Validation errors before processing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(business_id, id)
);

-- Import log details table (for detailed row-level errors)
CREATE TABLE import_log_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_log_id UUID NOT NULL REFERENCES import_logs(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    row_data JSONB, -- The actual row data that failed
    error_message TEXT NOT NULL,
    error_type VARCHAR(50) NOT NULL, -- 'validation', 'database', 'duplicate', 'format'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_import_logs_business_id ON import_logs(business_id);
CREATE INDEX idx_import_logs_user_id ON import_logs(user_id);
CREATE INDEX idx_import_logs_import_type ON import_logs(import_type);
CREATE INDEX idx_import_logs_status ON import_logs(status);
CREATE INDEX idx_import_logs_created_at ON import_logs(created_at);
CREATE INDEX idx_import_log_details_import_log_id ON import_log_details(import_log_id);

-- RLS Policies for import_logs
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see import logs for their businesses
CREATE POLICY "Users can view their business import logs" ON import_logs
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy: Users can only insert import logs for their businesses
CREATE POLICY "Users can create import logs for their businesses" ON import_logs
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        ) AND user_id = auth.uid()
    );

-- Policy: Users can only update their own import logs
CREATE POLICY "Users can update their import logs" ON import_logs
    FOR UPDATE USING (
        user_id = auth.uid() AND
        business_id IN (
            SELECT business_id FROM business_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for import_log_details
ALTER TABLE import_log_details ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see import log details for their business imports
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

-- Policy: Users can only insert import log details for their business imports
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

-- Create function to update import log status
CREATE OR REPLACE FUNCTION update_import_log_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the parent import_log when details are added
    UPDATE import_logs 
    SET 
        successful_rows = (
            SELECT COUNT(*) FROM import_log_details 
            WHERE import_log_id = NEW.import_log_id AND error_type = 'success'
        ),
        failed_rows = (
            SELECT COUNT(*) FROM import_log_details 
            WHERE import_log_id = NEW.import_log_id AND error_type != 'success'
        ),
        status = CASE 
            WHEN (
                SELECT COUNT(*) FROM import_log_details 
                WHERE import_log_id = NEW.import_log_id AND error_type != 'success'
            ) = 0 THEN 'success'
            WHEN (
                SELECT COUNT(*) FROM import_log_details 
                WHERE import_log_id = NEW.import_log_id AND error_type = 'success'
            ) = 0 THEN 'failed'
            ELSE 'partial'
        END,
        completed_at = CASE 
            WHEN (
                SELECT COUNT(*) FROM import_log_details 
                WHERE import_log_id = NEW.import_log_id
            ) = (
                SELECT total_rows FROM import_logs WHERE id = NEW.import_log_id
            ) THEN NOW()
            ELSE NULL
        END
    WHERE id = NEW.import_log_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update import log status
CREATE TRIGGER trigger_update_import_log_status
    AFTER INSERT ON import_log_details
    FOR EACH ROW
    EXECUTE FUNCTION update_import_log_status();

-- Create function to generate import statistics
CREATE OR REPLACE FUNCTION get_import_statistics(business_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    import_type VARCHAR(50),
    total_imports BIGINT,
    successful_imports BIGINT,
    failed_imports BIGINT,
    partial_imports BIGINT,
    total_rows_imported BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.import_type,
        COUNT(*) as total_imports,
        COUNT(*) FILTER (WHERE il.status = 'success') as successful_imports,
        COUNT(*) FILTER (WHERE il.status = 'failed') as failed_imports,
        COUNT(*) FILTER (WHERE il.status = 'partial') as partial_imports,
        SUM(il.successful_rows) as total_rows_imported,
        ROUND(
            (COUNT(*) FILTER (WHERE il.status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as success_rate
    FROM import_logs il
    WHERE il.business_id = business_uuid
        AND il.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY il.import_type
    ORDER BY il.import_type;
END;
$$ LANGUAGE plpgsql;
