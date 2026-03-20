from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, vote
from services.database import init_db
from typing import Dict

app = FastAPI(title="Aadhaar Biometric Voting API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event() -> None:
    init_db()

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vote.router, prefix="/api/vote", tags=["Voting"])

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "healthy"}
