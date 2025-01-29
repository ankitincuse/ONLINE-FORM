const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://wmonulauzpsxbnncbcri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb251bGF1enBzeGJubmNiY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTM4MzIsImV4cCI6MjA1MzEyOTgzMn0.ucpMs4BaLMktxx4_8ZG_yOgqNerQUhWLjRfQQrj_EC8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateTables() {
    try {
        console.log('Creating tables...');

        // Drop existing tables
        console.log('Dropping existing tables...');
        await supabase.from('reference_details').delete().neq('id', 0);
        await supabase.from('academic_details').delete().neq('id', 0);
        await supabase.from('form_data').delete().neq('id', 0);
        await supabase.from('admin_users').delete().neq('id', 0);

        // Create admin_users table
        console.log('Creating admin_users table...');
        const { error: adminError } = await supabase
            .from('admin_users')
            .insert({
                username: 'ankit',
                password_hash: '$2b$10$3euPcmQFCiblsZeEu5s7p.9wvEWFx1g1P0YWyL0tUEU.A88nL/2Eq',
                failed_attempts: 0,
                account_locked: false
            });

        if (adminError) {
            console.error('Error creating admin user:', adminError);
            throw adminError;
        }

        // Insert test data
        await insertTestData();

        console.log('Tables created successfully');

    } catch (error) {
        console.error('Failed to recreate tables:', error);
        process.exit(1);
    }
}

async function insertTestData() {
    try {
        console.log('Inserting test data...');

        // Insert form submissions
        const { data: formData, error: formError } = await supabase
            .from('form_data')
            .insert([
                {
                    full_name: 'John Doe',
                    mobile_number: '9876543210',
                    email: 'john@example.com',
                    address: '123 Main St, City',
                    dob: '1990-01-01',
                    joining_date: '2024-02-01',
                    father_name: 'James Doe',
                    height: 175,
                    weight: 70,
                    aadhar_number: '1234-5678-9012'
                },
                {
                    full_name: 'Jane Smith',
                    mobile_number: '9876543211',
                    email: 'jane@example.com',
                    address: '456 Oak St, Town',
                    dob: '1992-05-15',
                    joining_date: '2024-02-15',
                    father_name: 'John Smith',
                    height: 165,
                    weight: 60,
                    aadhar_number: '9876-5432-1098'
                }
            ])
            .select();

        if (formError) {
            throw formError;
        }

        // Insert academic details
        const academicData = [];
        for (const form of formData) {
            academicData.push(
                {
                    form_id: form.id,
                    qualification: 'B.Tech',
                    institute: 'ABC University',
                    passing_year: 2020,
                    percentage: 85
                },
                {
                    form_id: form.id,
                    qualification: '12th',
                    institute: 'XYZ School',
                    passing_year: 2016,
                    percentage: 90
                }
            );
        }

        const { error: academicError } = await supabase
            .from('academic_details')
            .insert(academicData);

        if (academicError) {
            throw academicError;
        }

        // Insert reference details
        const referenceData = [];
        for (const form of formData) {
            referenceData.push(
                {
                    form_id: form.id,
                    name: 'Robert Johnson',
                    mobile_number: '9876543212',
                    relation: 'Friend'
                },
                {
                    form_id: form.id,
                    name: 'Mary Williams',
                    mobile_number: '9876543213',
                    relation: 'Colleague'
                }
            );
        }

        const { error: referenceError } = await supabase
            .from('reference_details')
            .insert(referenceData);

        if (referenceError) {
            throw referenceError;
        }

        console.log('Test data inserted successfully');

    } catch (error) {
        console.error('Failed to insert test data:', error);
        throw error;
    }
}

// Run the script
recreateTables();
