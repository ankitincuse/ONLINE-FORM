const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTM4MzIsImV4cCI6MjA1MzEyOTgzMn0.ucpMs4BaLMktxx4_8ZG_yOgqNerQUhWLjRfQQrj_EC8';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    }
});

module.exports = supabase;
