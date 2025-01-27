const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1MzgzMiwiZXhwIjoyMDUzMTI5ODMyfQ.Ouc9Dx77WwwSqHQbjS5NYuiTcmkJZD-Mjv5Sa6cOBzc';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function recreateTables() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, '../database/supabase-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split the schema into individual statements
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        console.log('Dropping existing tables...');
        const { error: dropError } = await supabase
            .from('form_data')
            .delete()
            .neq('id', 0);
            
        if (dropError) {
            console.error('Error dropping form_data:', dropError);
        }
        
        const { error: dropAcademicError } = await supabase
            .from('academic_details')
            .delete()
            .neq('id', 0);
            
        if (dropAcademicError) {
            console.error('Error dropping academic_details:', dropAcademicError);
        }
        
        const { error: dropReferenceError } = await supabase
            .from('reference_details')
            .delete()
            .neq('id', 0);
            
        if (dropReferenceError) {
            console.error('Error dropping reference_details:', dropReferenceError);
        }
        
        console.log('Creating tables...');
        for (const statement of statements) {
            const { error } = await supabase
                .from('sql_queries')
                .insert({ query: statement });
                
            if (error) {
                console.error('Error executing statement:', statement);
                console.error('Error details:', error);
                throw error;
            }
        }
        
        console.log('Database tables recreated successfully!');
    } catch (error) {
        console.error('Failed to recreate tables:', error);
        process.exit(1);
    }
}

recreateTables();
