import pytest
from fastapi.testclient import TestClient
from main import app
from services.mock_uidai import get_voter_hash
import os
from typing import Generator, Any

os.environ["DATABASE_URL"] = "test_voting.db"

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db() -> Generator[Any, Any, Any]:
    # Setup test database
    from services.database import init_db
    init_db()
    yield
    # Teardown
    if os.path.exists("test_voting.db"):
        os.remove("test_voting.db")

def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_verify_and_vote_flow() -> None:
    # 1. Verify with valid mock credentials
    auth_data = {
        "aadhaar_number": "123456789012",
        "face_image_base64": "mock_face",
        "fingerprint_base64": "mock_print"
    }
    response = client.post("/api/auth/verify", json=auth_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    
    token = data["token"]
    
    # 2. Cast a vote
    vote_data = {"candidate_id": "candidate_1"}
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/vote/cast", json=vote_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # 3. Try to cast again
    response = client.post("/api/vote/cast", json=vote_data, headers=headers)
    assert response.status_code == 403
    
    # 4. Try to re-verify using same Aadhaar (should block since already voted)
    response = client.post("/api/auth/verify", json=auth_data)
    assert response.status_code == 200
    assert response.json()["success"] is False
    assert "already cast" in response.json()["message"]
