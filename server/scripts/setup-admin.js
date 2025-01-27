const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

async function createAdminUser() {
    try {
        const username = 'admin';
        const password = 'Admin@123';  // Updated password
        console.log('Setting up admin user with username:', username);
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');
        
        // Check if admin user already exists
        console.log('Checking for existing admin user...');
        const { data: existingAdmin, error: selectError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();
            
        if (selectError) {
            console.error('Error checking for existing admin:', selectError);
            throw selectError;
        }
            
        if (existingAdmin) {
            console.log('Existing admin found, updating password...');
            // Update existing admin's password
            const { error: updateError } = await supabase
                .from('admin_users')
                .update({ password_hash: hashedPassword })
                .eq('username', username);
                
            if (updateError) {
                console.error('Error updating admin:', updateError);
                throw updateError;
            }
            console.log('Admin password updated successfully');
        } else {
            console.log('No existing admin found, creating new admin user...');
            // Create new admin user
            const { error: insertError } = await supabase
                .from('admin_users')
                .insert([
                    { username, password_hash: hashedPassword }
                ]);
                
            if (insertError) {
                console.error('Error creating admin:', insertError);
                throw insertError;
            }
            console.log('Admin user created successfully');
        }
        
        // Verify the admin user was created/updated
        const { data: verifyAdmin, error: verifyError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();
            
        if (verifyError) {
            console.error('Error verifying admin user:', verifyError);
            throw verifyError;
        }
        
        console.log('Admin user verified in database:', {
            id: verifyAdmin.id,
            username: verifyAdmin.username,
            created_at: verifyAdmin.created_at
        });
        
    } catch (error) {
        console.error('Error creating/updating admin user:', error);
        process.exit(1);
    }
}

// Run the script
createAdminUser();
