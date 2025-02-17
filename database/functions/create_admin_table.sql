CREATE OR REPLACE FUNCTION create_admin_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create admin users table if it doesn't exist
    CREATE TABLE IF NOT EXISTS admin_users (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS if not already enabled
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

    -- Create policy if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'admin_users' 
            AND policyname = 'Enable all access for admin_users'
        ) THEN
            CREATE POLICY "Enable all access for admin_users" ON admin_users
                FOR ALL TO PUBLIC
                USING (true)
                WITH CHECK (true);
        END IF;
    END $$;

    -- Grant permissions
    GRANT ALL ON admin_users TO anon;
    GRANT USAGE ON SEQUENCE admin_users_id_seq TO anon;
END;
$$;
