import React, { useState, useRef } from 'react';
import '../styles/Form.css';

const Form = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        address: '',
        dob: '',
        joiningDate: '',
        aadharNumber: '',
        fatherName: '',
        photo: null,
        academicDetails: [{ qualification: '', college: '', passingYear: '', percentage: '' }],
        references: [{ name: '', mobileNumber: '', relation: '' }]
    });

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowCamera(true);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setShowCamera(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to base64 image
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);
            setFormData({ ...formData, photo: imageData });

            // Stop the camera
            stopCamera();
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            
            alert('Form submitted successfully!');
            // Reset form or redirect user
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="photo-section">
                <h3>Photo</h3>
                {showCamera ? (
                    <div className="camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', maxWidth: '400px' }}
                        />
                        <button type="button" onClick={capturePhoto}>Capture Photo</button>
                        <button type="button" onClick={stopCamera}>Cancel</button>
                    </div>
                ) : capturedImage ? (
                    <div className="captured-image-container">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            style={{ width: '100%', maxWidth: '200px' }}
                        />
                        <button type="button" onClick={() => {
                            setCapturedImage(null);
                            setFormData({ ...formData, photo: null });
                        }}>Retake Photo</button>
                    </div>
                ) : (
                    <button type="button" onClick={startCamera}>Take Photo</button>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
            <input type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
            <input type="text" name="aadharNumber" placeholder="Aadhar Number" value={formData.aadharNumber} onChange={handleChange} required />
            <input type="text" name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} required />
            
            <h3>Academic Details</h3>
            {formData.academicDetails.map((detail, index) => (
                <div key={index} className="academic-detail">
                    <input type="text" name="qualification" placeholder="Qualification" value={detail.qualification} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="college" placeholder="College/Institute Name" value={detail.college} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="passingYear" placeholder="Passing Year" value={detail.passingYear} onChange={(e) => handleAcademicChange(index, e)} required />
                    <input type="text" name="percentage" placeholder="Percentage" value={detail.percentage} onChange={(e) => handleAcademicChange(index, e)} required />
                </div>
            ))}
            <button type="button" onClick={addAcademicDetail}>Add Academic Detail</button>
            
            <h3>References</h3>
            {formData.references.map((reference, index) => (
                <div key={index} className="reference">
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
