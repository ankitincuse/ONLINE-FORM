-- Check admin user details
SELECT id, username, password_hash, created_at 
FROM admin_users 
WHERE username = 'admin';
