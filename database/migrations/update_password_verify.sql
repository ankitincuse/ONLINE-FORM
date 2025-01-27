-- Drop existing function if it exists
DROP FUNCTION IF EXISTS verify_admin_password;

-- Create function to verify admin password with better error handling
CREATE OR REPLACE FUNCTION verify_admin_password(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Check if the user exists and password matches
    SELECT COUNT(*)
    INTO v_count
    FROM admin_users
    WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash);

    -- Return true if exactly one user found with matching credentials
    RETURN v_count = 1;
END;
$$;

-- Test the function with the admin user
SELECT verify_admin_password('admin', 'Admin@123') as should_be_true;

-- Recreate admin user if not exists
INSERT INTO admin_users (username, password_hash)
SELECT 'admin', crypt('Admin@123', gen_salt('bf'))
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE username = 'admin'
);
