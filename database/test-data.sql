-- Insert test form submission
INSERT INTO form_data (
    full_name,
    mobile_number,
    email,
    address,
    dob,
    joining_date,
    aadhar_number,
    father_name,
    height,
    weight,
    created_at
) VALUES (
    'John Doe',
    '9876543210',
    'john.doe@example.com',
    '123 Main St, City',
    '1990-01-01',
    '2025-02-01',
    '123456789012',
    'James Doe',
    175.5,
    70.2,
    NOW()
) RETURNING id;

-- Insert academic details
INSERT INTO academic_details (
    form_id,
    qualification,
    institute,
    passing_year,
    percentage
) VALUES 
(1, 'B.Tech', 'Example University', 2020, 85.5),
(1, 'HSC', 'Example High School', 2016, 88.0);

-- Insert references
INSERT INTO references (
    form_id,
    name,
    mobile_number,
    relation
) VALUES 
(1, 'Jane Smith', '9876543211', 'Friend'),
(1, 'Mike Johnson', '9876543212', 'Former Colleague');
