from pydantic import BaseModel, Field
from typing import Optional, List

class BiometricAuthRequest(BaseModel):
    aadhaar_number: str = Field(..., min_length=12, max_length=12)
    face_image_base64: str
    fingerprint_base64: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    
class VoteRequest(BaseModel):
    candidate_id: str

class BasicResponse(BaseModel):
    success: bool
    message: str

class ResultResponse(BaseModel):
    candidate_id: str
    votes: int
