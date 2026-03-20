#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy Warmup Challenge (voting-backend + voting-frontend) to Google Cloud Run.
    Project: akjlab-promptwars | Region: us-central1

.PREREQUISITE
    1. Google Cloud CLI installed and authenticated:
       gcloud auth login
       gcloud config set project akjlab-promptwars

    2. Secrets stored in Secret Manager:
       printf "YOUR_GEMINI_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
       printf "YOUR_JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=-

    3. Required APIs enabled (run setup once):
       gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
           artifactregistry.googleapis.com secretmanager.googleapis.com

.USAGE
    cd "Warmup Challenge"
    .\deploy.ps1
#>

$PROJECT_ID = "akjlab-promptwars"
$REGION     = "us-central1"

Write-Host "`n=== Deploying Warmup Challenge to $PROJECT_ID ===" -ForegroundColor Cyan

# ── Confirm project ────────────────────────────────────────────────────────────
gcloud config set project $PROJECT_ID

# ── Deploy Backend ─────────────────────────────────────────────────────────────
Write-Host "`n[1/3] Deploying Backend (voting-backend)..." -ForegroundColor Yellow

gcloud run deploy voting-backend `
    --source ./backend `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,JWT_SECRET=JWT_SECRET:latest"

if ($LASTEXITCODE -ne 0) { Write-Error "Backend deploy failed!"; exit 1 }

# ── Get backend URL ────────────────────────────────────────────────────────────
Write-Host "`n[2/3] Fetching Backend URL..." -ForegroundColor Yellow

$BACKEND_URL = gcloud run services describe voting-backend `
    --region $REGION `
    --format "value(status.url)"

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green

# ── Deploy Frontend ────────────────────────────────────────────────────────────
Write-Host "`n[3/3] Deploying Frontend (voting-frontend)..." -ForegroundColor Yellow

gcloud run deploy voting-frontend `
    --source ./frontend `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --build-env-vars="VITE_API_URL=$BACKEND_URL"

if ($LASTEXITCODE -ne 0) { Write-Error "Frontend deploy failed!"; exit 1 }

# ── Summary ────────────────────────────────────────────────────────────────────
$FRONTEND_URL = gcloud run services describe voting-frontend `
    --region $REGION `
    --format "value(status.url)"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "   Backend  : $BACKEND_URL" -ForegroundColor White
Write-Host "   Frontend : $FRONTEND_URL" -ForegroundColor White
Write-Host "   API Docs : $BACKEND_URL/docs" -ForegroundColor White
Write-Host "   Health   : $BACKEND_URL/health" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
