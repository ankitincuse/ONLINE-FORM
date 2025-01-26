const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

async function resetAdminPassword() {
    try {
        // Generate new hash for Admin@123
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('Generated new hash:', hashedPassword);

        // Update admin user
        const { data, error } = await supabase
            .from('admin_users')
            .update({ password_hash: hashedPassword })
            .eq('username', 'admin')
            .select();

        if (error) {
            console.error('Error updating admin:', error);
            return;
        }

        console.log('Admin password updated successfully!');
        console.log('You can now login with:');
        console.log('Username: admin');
        console.log('Password: Admin@123');
    } catch (error) {
        console.error('Error:', error);
    }
}

resetAdminPassword();
