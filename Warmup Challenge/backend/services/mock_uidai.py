import hashlib

# Mock database simulating UIDAI
_MOCK_UIDAI_DB = {
    "123456789012": {"name": "Test User 1"},
    "987654321098": {"name": "Test User 2"}
}

def get_voter_hash(aadhaar_number: str) -> str:
    """Creates a secure one-way hash of the Aadhaar to act as the voter ID."""
    # In a real system, we'd add salt securely
    return hashlib.sha256(aadhaar_number.encode()).hexdigest()

def verify_biometrics(aadhaar_number: str, face_base64: str, fingerprint_base64: str) -> bool:
    """Mock verification of biometric data against UIDAI."""
    if aadhaar_number not in _MOCK_UIDAI_DB:
        return False
        
    if not face_base64 or not fingerprint_base64:
        return False
        
    # Simulate API call latency + processing match
    return True
