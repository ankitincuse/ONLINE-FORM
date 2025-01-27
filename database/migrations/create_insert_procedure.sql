-- Create a stored procedure for inserting form data
CREATE OR REPLACE FUNCTION insert_form_data(
    full_name VARCHAR,
    mobile_number VARCHAR,
    email VARCHAR,
    address TEXT,
    dob DATE,
    joining_date DATE,
    aadhar_number VARCHAR,
    pan_number VARCHAR,
    father_name VARCHAR,
    height DECIMAL,
    weight DECIMAL,
    passport_photo_url TEXT,
    aadhar_card_url TEXT,
    bank_details_url TEXT
) RETURNS BIGINT AS $$
DECLARE
    inserted_id BIGINT;
BEGIN
    INSERT INTO form_data (
        full_name,
        mobile_number,
        email,
        address,
        dob,
        joining_date,
        aadhar_number,
        pan_number,
        father_name,
        height,
        weight,
        passport_photo_url,
        aadhar_card_url,
        bank_details_url
    ) VALUES (
        insert_form_data.full_name,
        insert_form_data.mobile_number,
        insert_form_data.email,
        insert_form_data.address,
        insert_form_data.dob,
        insert_form_data.joining_date,
        insert_form_data.aadhar_number,
        insert_form_data.pan_number,
        insert_form_data.father_name,
        insert_form_data.height,
        insert_form_data.weight,
        insert_form_data.passport_photo_url,
        insert_form_data.aadhar_card_url,
        insert_form_data.bank_details_url
    ) RETURNING id INTO inserted_id;
    
    RETURN inserted_id;
END;
$$ LANGUAGE plpgsql;
