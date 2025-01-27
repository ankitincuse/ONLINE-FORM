-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create or update admin user
CREATE OR REPLACE FUNCTION upsert_admin_user(
    p_username VARCHAR,
    p_password VARCHAR
) RETURNS VOID AS $$
BEGIN
    -- Delete existing admin user if exists
    DELETE FROM admin_users WHERE username = p_username;
    
    -- Insert new admin user with hashed password
    INSERT INTO admin_users (username, password_hash)
    VALUES (
        p_username,
        crypt(p_password, gen_salt('bf'))  -- Using bcrypt for password hashing
    );
END;
$$ LANGUAGE plpgsql;

-- Insert new admin user with credentials
SELECT upsert_admin_user('incusehr_admin', 'IncusEHR@2024');
