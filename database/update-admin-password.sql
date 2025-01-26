-- Update admin user's password to 'Admin@123'
UPDATE admin_users 
SET password_hash = '$2b$10$8X0GkFgB5B5Jp0P1Xl3YUu.gQgQIxqPF6WTD0BJKyZh1oL8lFPCiO'
WHERE username = 'admin';
