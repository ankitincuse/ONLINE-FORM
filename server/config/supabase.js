const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Create Supabase client with specific configuration
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    // Disable schema cache
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

module.exports = supabase;
