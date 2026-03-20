from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.schemas import VoteRequest, BasicResponse, ResultResponse
from services.database import record_vote, has_voted, get_results
from utils.security import verify_token
from typing import List

router = APIRouter()
security = HTTPBearer()

def get_current_voter(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload["sub"]

@router.post("/cast", response_model=BasicResponse)
async def cast_vote(request: VoteRequest, voter_hash: str = Depends(get_current_voter)) -> BasicResponse:
    if has_voted(voter_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vote already cast.")
        
    try:
        record_vote(voter_hash, request.candidate_id)
        return BasicResponse(success=True, message="Vote cast successfully.")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to cast vote.")

@router.get("/results", response_model=List[ResultResponse])
async def election_results() -> List[ResultResponse]:
    """Endpoint purely for demonstration purposes to see if voting works."""
    return get_results()
