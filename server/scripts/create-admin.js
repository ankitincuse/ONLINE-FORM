const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function createAdminUser() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/online_form'
    });

    try {
        // Create admin_users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Generate hash for Admin@123
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Insert or update admin user
        await pool.query(`
            INSERT INTO admin_users (username, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (username) 
            DO UPDATE SET password_hash = EXCLUDED.password_hash;
        `, ['admin', hashedPassword]);

        console.log('Admin user created successfully!');
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        await pool.end();
    }
}

createAdminUser();
