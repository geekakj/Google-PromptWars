from fastapi import APIRouter, HTTPException, status
from models.schemas import BiometricAuthRequest, AuthResponse
from services.mock_uidai import verify_biometrics, get_voter_hash
from services.google_gemini import analyze_liveness_and_spoofing
from services.database import has_voted
from utils.security import create_access_token

router = APIRouter()

@router.post("/verify", response_model=AuthResponse)
async def verify_voter(request: BiometricAuthRequest) -> AuthResponse:
    # 1. Anti-spoofing check with Gemini (Liveness)
    is_live = analyze_liveness_and_spoofing(request.face_image_base64)
    if not is_live:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Spoofing detected in face image.")
    
    # 2. UIDAI Biometric Verification Mock
    is_verified = verify_biometrics(request.aadhaar_number, request.face_image_base64, request.fingerprint_base64)
    if not is_verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Biometric verification failed.")

    voter_hash = get_voter_hash(request.aadhaar_number)
    
    # 3. Check if already voted
    if has_voted(voter_hash):
        return AuthResponse(success=False, message="Voter has already cast their vote.")
        
    # 4. Generate short-lived token for voting session
    token = create_access_token({"sub": voter_hash})
    
    return AuthResponse(success=True, message="Verification successful.", token=token)
