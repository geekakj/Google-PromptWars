import React, { useState, useRef, useEffect } from 'react';

const BiometricVerification = ({ onVerified, isScreenReaderActive }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const handleFile = (e, setFile, label) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);
        if(isScreenReaderActive) {
           window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${label} loaded successfully.`));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if(aadhaar.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits.");
      return;
    }
    if(!faceImage) {
      setError("Please upload a Face Scan.");
      return;
    }
    if(!fingerprint) {
      setError("Please upload a Fingerprint Scan.");
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
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Verification successful. Identity confirmed. Redirecting to ballot."));
        onVerified(data.token);
      } else {
        const msg = data.detail || data.message || "Verification failed. Please check your biometrics.";
        setError(msg);
        if(isScreenReaderActive) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Error: " + msg));
      }
    } catch(err) {
      setError("Unable to connect to verification server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card fade-in">
      <h1 id="verify-title">Voter Verification</h1>
      <p>Secure identity check using Aadhaar and biometric data.</p>
      
      <form onSubmit={handleVerify} aria-labelledby="verify-title">
        <div style={{textAlign: 'left', marginBottom: '8px', color: '#cbd5e1', fontSize: '0.9rem'}}>
          Aadhaar Number (12 numeric digits)
        </div>
        <input 
          type="text" 
          placeholder="Enter 12-digit Aadhaar" 
          value={aadhaar} 
          onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))} 
          maxLength={12}
          aria-required="true"
          aria-label="12 digit Aadhaar number"
        />

        <div className="file-upload-container">
          <label className="upload-box" aria-label="Upload Frontal Face Image">
            <span>📷 Face Scan</span>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, setFaceImage, "Face image")} style={{position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer'}} />
            {faceImage && <img src={faceImage} className="upload-preview" alt="Scan preview" />}
          </label>
          <label className="upload-box" aria-label="Upload Fingerprint Scan">
            <span>👆 Fingerprint Scan</span>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, setFingerprint, "Fingerprint")} style={{position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer'}} />
            {fingerprint && <img src={fingerprint} className="upload-preview" alt="Scan preview" />}
          </label>
        </div>

        <div aria-live="assertive">
          {error && <div className="error-message" role="alert" tabIndex="-1" ref={errorRef}>{error}</div>}
        </div>

        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Verifying...' : 'Confirm Identity'}
        </button>
      </form>
    </div>
  );
};

export default BiometricVerification;
