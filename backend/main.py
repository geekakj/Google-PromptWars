from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api import auth, vote
from services.database import init_db
from utils.rate_limiter import rate_limit_middleware
from typing import Dict
import os

app = FastAPI(title="Aadhaar Biometric Voting API", version="1.1.0")

# In production, this should be set to the specific frontend URL
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"], # Restricted methods for security
    allow_headers=["*"],
)

@app.middleware("http")
async def add_rate_limiting(request: Request, call_next):
    return await rate_limit_middleware(request, call_next)

@app.on_event("startup")
def startup_event() -> None:
    init_db()

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vote.router, prefix="/api/vote", tags=["Voting"])

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy", "version": "1.1.0"}
