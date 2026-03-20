import React, { useState } from 'react';

const BiometricVerification = ({ onVerified, isScreenReaderActive }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);
        if(isScreenReaderActive) {
           window.speechSynthesis.speak(new SpeechSynthesisUtterance("Image loaded successfully."));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if(aadhaar.length !== 12) {
      setError("Aadhaar number must be 12 digits.");
      return;
    }
    if(!faceImage || !fingerprint) {
      setError("Please provide both Face and Fingerprint data.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaar_number: aadhaar,
          face_image_base64: faceImage,
          fingerprint_base64: fingerprint
        })
      });
      const data = await res.json();
      
      if(res.ok && data.success) {
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Verification successful. Proceeding to voting machine."));
        onVerified(data.token);
      } else {
        setError(data.detail || data.message || "Verification failed");
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Verification failed: " + (data.detail || data.message)));
      }
    } catch(err) {
      setError("Network connection error. Server might be offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card fade-in" aria-live="polite">
      <h1>Voter Verification</h1>
      <p>Please authenticate using your Aadhaar details and biometric inputs.</p>
      
      <form onSubmit={handleVerify}>
        <div style={{textAlign: 'left', marginBottom: '8px', color: '#cbd5e1'}}>Aadhaar Number (Mock: 123456789012)</div>
        <input 
          type="text" 
          placeholder="1234 5678 9012" 
          value={aadhaar} 
          onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))} 
          maxLength={12}
          aria-label="Enter 12 digit Aadhaar number"
        />

        <div className="file-upload-container">
          <div className="upload-box" aria-label="Upload Face Image">
            <span>📷 Face Scan</span>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, setFaceImage)} />
            {faceImage && <img src={faceImage} className="upload-preview" alt="Face preview" />}
          </div>
          <div className="upload-box" aria-label="Upload Fingerprint Scan">
            <span>👆 Fingerprint Scan</span>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, setFingerprint)} />
            {fingerprint && <img src={fingerprint} className="upload-preview" alt="Fingerprint preview" />}
          </div>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Verifying Identity...' : 'Verify Biometrics'}
        </button>
      </form>
    </div>
  );
};

export default BiometricVerification;
