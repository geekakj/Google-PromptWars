import hashlib
import os

# Mock database simulating UIDAI
_MOCK_UIDAI_DB = {
    "123456789012": {"name": "Test User 1"},
    "987654321098": {"name": "Test User 2"}
}

# In a real system, this would be a high-entropy secret stored in Secret Manager
PEPPER = os.getenv("VOTER_ID_PEPPER", "default-system-pepper-2024")

def get_voter_hash(aadhaar_number: str) -> str:
    """Creates a secure one-way hash of the Aadhaar to act as the voter ID."""
    # Using a pepper helps prevent rainbow table attacks on the 10^12 possible Aadhaar numbers
    salted_input = f"{aadhaar_number}{PEPPER}"
    return hashlib.sha256(salted_input.encode()).hexdigest()

def verify_biometrics(aadhaar_number: str, face_base64: str, fingerprint_base64: str) -> bool:
    """Mock verification of biometric data against UIDAI."""
    if aadhaar_number not in _MOCK_UIDAI_DB:
        return False
        
    if not face_base64 or not fingerprint_base64:
        return False
        
    # Simulate API call latency + processing match
    return True
