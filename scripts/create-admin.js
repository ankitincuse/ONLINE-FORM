require('dotenv').config({ path: '../server/.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Initialize Supabase client
const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1MzgzMiwiZXhwIjoyMDUzMTI5ODMyfQ.Ouc9Dx77WwwSqHQbjS5NYuiTcmkJZD-Mjv5Sa6cOBzc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
    try {
        // First, let's delete all existing users
        console.log('Deleting all existing users...');
        const { error: deleteError } = await supabase
            .from('admin_users')
            .delete()
            .neq('id', 0); // Delete all users

        if (deleteError) {
            console.error('Error deleting users:', deleteError);
            process.exit(1);
        }
        console.log('Successfully deleted all existing users');

        // Admin credentials
        const username = 'ankit';
        const password = 'Admin@123';

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        console.log('Creating new admin user...');
        // Insert admin user
        const { data, error } = await supabase
            .from('admin_users')
            .insert({
                username,
                password_hash: passwordHash,
                failed_attempts: 0,
                account_locked: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating admin user:', error);
            process.exit(1);
        }

        console.log('Admin user created successfully:', {
            id: data.id,
            username: data.username
        });

        // Verify the user was created
        console.log('\nVerifying user creation...');
        const { data: users, error: fetchError } = await supabase
            .from('admin_users')
            .select('*');

        if (fetchError) {
            console.error('Error fetching users:', fetchError);
            process.exit(1);
        }

        console.log('All users in database:', users);

        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
