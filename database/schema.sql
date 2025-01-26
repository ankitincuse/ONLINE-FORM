CREATE TABLE form_data (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    mobile_number VARCHAR(15),
    address TEXT,
    dob DATE,
    joining_date DATE,
    aadhar_number VARCHAR(12),
    father_name VARCHAR(100)
);

CREATE TABLE academic_details (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES form_data(id),
    qualification VARCHAR(100),
    college VARCHAR(100),
    passing_year INTEGER,
    percentage DECIMAL(5, 2)
);

CREATE TABLE references (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES form_data(id),
    name VARCHAR(100),
    mobile_number VARCHAR(15),
    relation VARCHAR(50)
);
