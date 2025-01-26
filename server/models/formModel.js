const supabase = require('../config/supabase');

async function saveFormData(formData) {
    try {
        // Insert main form data
        const { data: formResult, error: formError } = await supabase
            .from('form_data')
            .insert([{
                full_name: formData.fullName,
                mobile_number: formData.mobileNumber,
                address: formData.address,
                dob: formData.dob,
                joining_date: formData.joiningDate,
                aadhar_number: formData.aadharNumber,
                father_name: formData.fatherName,
                height: formData.height,
                weight: formData.weight,
                blood_group: formData.bloodGroup,
                passport_photo_url: formData.passportUrl,
                aadhar_card_url: formData.aadharUrl,
                bank_details_url: formData.bankUrl
            }])
            .select()
            .single();

        if (formError) {
            console.error('Form insert error:', formError);
            throw formError;
        }

        const formId = formResult.id;

        // Insert academic details
        if (formData.academicDetails && formData.academicDetails.length > 0) {
            const academicDetailsWithFormId = formData.academicDetails.map(detail => ({
                form_id: formId,
                qualification: detail.qualification,
                college: detail.college,
                passing_year: detail.passingYear,
                percentage: detail.percentage
            }));

            const { error: academicError } = await supabase
                .from('academic_details')
                .insert(academicDetailsWithFormId);

            if (academicError) {
                console.error('Academic details insert error:', academicError);
                throw academicError;
            }
        }

        // Insert references
        if (formData.references && formData.references.length > 0) {
            const referencesWithFormId = formData.references.map(ref => ({
                form_id: formId,
                name: ref.name,
                mobile_number: ref.mobileNumber,
                relation: ref.relation
            }));

            const { error: referenceError } = await supabase
                .from('reference_details')
                .insert(referencesWithFormId);

            if (referenceError) {
                console.error('References insert error:', referenceError);
                throw referenceError;
            }
        }

        return { formId };
    } catch (error) {
        console.error('Error saving form data:', error);
        throw error;
    }
}

module.exports = {
    saveFormData
};
