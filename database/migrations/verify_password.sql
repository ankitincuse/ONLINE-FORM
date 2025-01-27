-- Create function to verify password
CREATE OR REPLACE FUNCTION verify_password(
    p_username TEXT,
    p_password TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_password_hash TEXT;
BEGIN
    -- Get the stored password hash
    SELECT password_hash INTO v_password_hash
    FROM admin_users
    WHERE username = p_username;

    -- Return true if password matches, false otherwise
    RETURN CASE 
        WHEN v_password_hash IS NULL THEN false
        ELSE crypt(p_password, v_password_hash) = v_password_hash
    END;
END;
$$;
