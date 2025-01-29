const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for better permissions
const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1MzgzMiwiZXhwIjoyMDUzMTI5ODMyfQ.Ouc9Dx77WwwSqHQbjS5NYuiTcmkJZD-Mjv5Sa6cOBzc';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
