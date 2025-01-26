import React, { useState } from 'react';

const Form = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        address: '',
        dob: '',
        joiningDate: '',
        aadharNumber: '',
        fatherName: '',
        academicDetails: [{ qualification: '', college: '', passingYear: '', percentage: '' }],
        references: [{ name: '', mobileNumber: '', relation: '' }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAcademicChange = (index, e) => {
        const { name, value } = e.target;
        const updatedAcademicDetails = [...formData.academicDetails];
        updatedAcademicDetails[index][name] = value;
        setFormData({ ...formData, academicDetails: updatedAcademicDetails });
    };

    const handleReferenceChange = (index, e) => {
        const { name, value } = e.target;
        const updatedReferences = [...formData.references];
        updatedReferences[index][name] = value;
        setFormData({ ...formData, references: updatedReferences });
    };

    const addAcademicDetail = () => {
        setFormData({ ...formData, academicDetails: [...formData.academicDetails, { qualification: '', college: '', passingYear: '', percentage: '' }] });
    };

    const addReference = () => {
        setFormData({ ...formData, references: [...formData.references, { name: '', mobileNumber: '', relation: '' }] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit form data to backend
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
            <input type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
            <input type="text" name="aadharNumber" placeholder="Aadhar Number" value={formData.aadharNumber} onChange={handleChange} required />
            <input type="text" name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} required />
            <h3>Academic Details</h3>
            {formData.academicDetails.map((detail, index) => (
                <div key={index}>
                    <input type="text" name="qualification" placeholder="Qualification" value={detail.qualification} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="college" placeholder="College/Institute Name" value={detail.college} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="passingYear" placeholder="Passing Year" value={detail.passingYear} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="percentage" placeholder="Percentage" value={detail.percentage} onChange={(e) => handleAcademicChange(index, e)} required />
                </div>
            ))}
            <button type="button" onClick={addAcademicDetail}>Add Academic Detail</button>
            <h3>References</h3>
            {formData.references.map((reference, index) => (
                <div key={index}>
                    <input type="text" name="name" placeholder="Reference Name" value={reference.name} onChange={(e) => handleReferenceChange(index, e)} required />
                    <input type="text" name="mobileNumber" placeholder="Mobile Number" value={reference.mobileNumber} onChange={(e) => handleReferenceChange(index, e)} required />
                    <input type="text" name="relation" placeholder="Relation" value={reference.relation} onChange={(e) => handleReferenceChange(index, e)} required />
                </div>
            ))}
            <button type="button" onClick={addReference}>Add Reference</button>
            <button type="submit">Submit</button>
        </form>
    );
};

export default Form;
