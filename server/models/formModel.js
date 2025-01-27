const supabase = require('../config/supabase');

async function saveFormData(formData) {
    try {
        // Prepare form data with only the fields we want to insert
        const formDataToSave = {
            full_name: formData.full_name,
            mobile_number: formData.mobile_number,
            email: formData.email || null,
            address: formData.address,
            dob: formData.dob,
            joining_date: formData.joining_date,
            aadhar_number: formData.aadhar_number,
            pan_number: formData.pan_number || null,
            father_name: formData.father_name,
            height: formData.height ? parseFloat(formData.height) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            passport_photo_url: formData.passport_photo_url || null,
            aadhar_card_url: formData.aadhar_card_url || null,
            bank_details_url: formData.bank_details_url || null
        };

        // Use rpc call to insert data
        const { data: formResult, error: formError } = await supabase.rpc('insert_form_data', formDataToSave);

        if (formError) {
            console.error('Error saving form data:', formError);
            throw new Error(formError.message || 'Failed to save form data');
        }

        if (!formResult) {
            throw new Error('No form data returned after insert');
        }

        const formId = formResult;

        // Save academic details
        if (formData.academic_details && formData.academic_details.length > 0) {
            const academicRecords = formData.academic_details.map(record => ({
                form_id: formId,
                qualification: record.qualification,
                institute: record.institute,
                passing_year: parseInt(record.passing_year),
                percentage: parseFloat(record.percentage)
            }));

            const { error: academicError } = await supabase
                .from('academic_details')
                .insert(academicRecords);

            if (academicError) {
                console.error('Error saving academic details:', academicError);
                throw new Error(academicError.message || 'Failed to save academic details');
            }
        }

        // Save reference details
        if (formData.reference_details && formData.reference_details.length > 0) {
            const referenceRecords = formData.reference_details.map(record => ({
                form_id: formId,
                name: record.name,
                contact: record.contact,
                relation: record.relation
            }));

            const { error: referenceError } = await supabase
                .from('reference_details')
                .insert(referenceRecords);

            if (referenceError) {
                console.error('Error saving reference details:', referenceError);
                throw new Error(referenceError.message || 'Failed to save reference details');
            }
        }

        return { formId, success: true };
    } catch (error) {
        console.error('Error in saveFormData:', error);
        throw error;
    }
}

module.exports = {
    saveFormData
};
