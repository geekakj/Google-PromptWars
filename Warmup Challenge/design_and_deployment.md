# System Design and Deployment Document
**Aadhaar Biometric Voting System powered by Gemini**

## 1. Architecture Overview
The system follows a client-server architecture with a clear separation of concerns, ensuring modularity and debuggability.

### 1.1 Components
*   **Frontend (Client):** A React-based SPA (Vite), styled with Vanilla CSS.
*   **Backend (API Server):** A Python FastAPI application providing high-performance, asynchronous endpoints for verification and vote processing.
*   **External Integration (Google Gemini):** Used for advanced analysis of biometric feeds to detect spoofing (e.g., photos of photos) and for providing an accessible, conversational interface to users who need help navigating the booth.
*   **External Integration (Mock UIDAI):** Simulates the interface with the Indian Government's Aadhaar database for biometric hashing and matching.
*   **Storage (Google Cloud SQL):** PostgreSQL for storing encrypted vote tallies and voter statuses.

## 2. Security and Compliance (Robustness Checklist)
*   **Code Quality:** Strict separation into `api`, `services`, `models`, and `tests` directories. Adherence to PEP 8 (Python).
*   **Security:**
    *   No biometric data is saved persistently (only transiently processed in memory).
    *   Communication is exclusively over HTTPS/TLS 1.3.
    *   Votes are anonymized. The system only tracks *who* has voted (using a hashed Aadhaar ID), not *whom* they voted for.
*   **Efficiency:** FastAPI utilizes ASGI for high throughput. Frontend uses Vite for fast cold starts and optimized production builds.
*   **Testing:** Comprehensive `pytest` coverage for backend logic.
*   **Accessibility:** WAI-ARIA compliant frontend. High contrast mode, large text options, and a Gemini-powered text-to-speech assistant for visual/motor impairments.

## 3. Google Services Integration
1.  **Google Gemini (GenAI API):** Analyzes the biometric images to perform complex liveness checks that simple heuristics might miss and acts as an interactive assistant.
2.  **Google Cloud Run:** Serverless container execution environment for hosting both frontend and backend securely.
3.  **Google Cloud Build:** Automates the testing and deployment pipeline upon code commit.

## 4. Deployment Details (Google Cloud)
### Prerequisites
1.  A Google Cloud Project with Billing enabled.
2.  APIs enabled: Cloud Run API, Cloud Build API, Gemini API (Vertex AI).
3.  Google Cloud CLI (`gcloud`) installed locally.

### Deployment Steps
The repository includes Dockerfiles for both frontend and backend, along with a `cloudbuild.yaml` file.

**Manual Deployment via gcloud:**
```bash
# 1. Build and Deploy Backend
gcloud run deploy voting-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your_key,DATABASE_URL=your_db_url,JWT_SECRET=your_jwt_secret"

# 2. Build and Deploy Frontend
gcloud run deploy voting-frontend \
  --source ./frontend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="VITE_API_URL=URL_OF_DEPLOYED_BACKEND"
```

### Environment Variables Required
*   `GEMINI_API_KEY`: Key for accessing Google Gemini.
*   `DATABASE_URL`: Connection string for the secure database (e.g., PostgreSQL).
*   `JWT_SECRET`: Secret key for signing internal tokens between components.
*   `VITE_API_URL`: Backend URL for the frontend application.
