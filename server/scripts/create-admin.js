const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

async function createAdminUser() {
    try {
        // Generate hash for Admin@123
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Insert admin user
        const { data, error } = await supabase
            .from('admin_users')
            .insert([
                {
                    username: 'admin',
                    password_hash: hashedPassword
                }
            ]);

        if (error) throw error;
        console.log('Admin user created successfully!');
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
}

createAdminUser();
