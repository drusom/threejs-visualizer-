# 🚀 Google Cloud Deployment Guide

## Overview
This guide will walk you through deploying your Three.js warehouse visualizer securely on Google Cloud Run with Google Sheets integration.

## Prerequisites
1. Google Cloud Project with billing enabled
2. Google Cloud CLI installed and authenticated
3. Docker installed (if building locally)
4. A Google Sheet with your unit data

## Step 1: Set up Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sheets.googleapis.com
```

## Step 2: Create Service Account

```bash
# Create service account for Sheets access
gcloud iam service-accounts create warehouse-sheets-reader \
    --display-name="Warehouse Sheets Reader"

# Grant Sheets API access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:warehouse-sheets-reader@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Download service account key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=warehouse-sheets-reader@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 3: Store Secrets in Secret Manager

```bash
# Store Google Sheets service account credentials
gcloud secrets create google-sheets-credentials \
    --data-file=service-account-key.json

# Store your Google Sheet ID
echo "your-google-sheet-id-here" | gcloud secrets create google-sheet-id \
    --data-file=-

# Clean up the key file for security
rm service-account-key.json
```

## Step 4: Configure Google Sheets

1. **Share your Google Sheet** with the service account email:
   `warehouse-sheets-reader@your-project-id.iam.gserviceaccount.com`

2. **Set up your sheet headers** (Row 1):
   - `Product` or `Unit Name` or `Building ID` (unit identifier)
   - `Available` or `Availability` or `Status` (availability status)
   - `Size` or `Square Feet` or `Sq Ft` (unit size)
   - `Amenities` or `Features` or `Package` (amenities description)

3. **Data format examples**:
   - Availability: `TRUE`/`FALSE`, `Yes`/`No`, `Available`/`Occupied`
   - Unit names should match your 3D model (e.g., `a1`, `b2`, `c3`)

## Step 5: Deploy to Cloud Run

### Option A: Using Cloud Build (Recommended)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Your app will be deployed automatically!
```

### Option B: Manual Docker Build

```bash
# Build and tag the image
docker build -t gcr.io/$PROJECT_ID/rebel-visualizer .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/rebel-visualizer

# Deploy to Cloud Run
gcloud run deploy rebel-visualizer \
  --image gcr.io/$PROJECT_ID/rebel-visualizer \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID" \
  --set-secrets "GOOGLE_SHEET_ID=google-sheet-id:latest,GCP_SECRET_NAME=google-sheets-credentials:latest"
```

## Step 6: Test Your Deployment

```bash
# Get your service URL
gcloud run services describe rebel-visualizer \
  --region us-central1 \
  --format 'value(status.url)'

# Test the API endpoint
curl "https://your-service-url/api/health"
curl "https://your-service-url/api/unit-data"
```

## Environment Variables

The following environment variables are automatically set by Cloud Run:

- `NODE_ENV`: Set to "production"
- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GOOGLE_SHEET_ID`: Secret containing your Google Sheet ID
- `GCP_SECRET_NAME`: Name of the secret containing credentials (default: "google-sheets-credentials")
- `PORT`: Set by Cloud Run (usually 8080)

## Security Features

✅ **No secrets in code**: All sensitive data stored in Secret Manager  
✅ **Service account authentication**: Secure access to Google Sheets  
✅ **HTTPS only**: Cloud Run provides automatic SSL  
✅ **Container isolation**: Each request runs in an isolated container  
✅ **Minimal permissions**: Service account has only required permissions  

## Troubleshooting

### Check logs:
```bash
gcloud logs read --service=rebel-visualizer --region=us-central1
```

### Common issues:
1. **403 errors**: Check service account permissions
2. **Sheet not found**: Verify GOOGLE_SHEET_ID secret
3. **Build failures**: Check Dockerfile and dependencies

### Local testing:
```bash
# Run the API server locally (requires local secrets setup)
cd api && npm start

# Run frontend with API proxy
npm run dev
```

## Monitoring

Set up monitoring in Google Cloud Console:
1. Go to Cloud Run → rebel-visualizer
2. Click "Metrics" tab for performance data
3. Set up alerting for errors or latency

## Updates

To update your deployment:
```bash
# Make your code changes, then
gcloud builds submit --config cloudbuild.yaml
```

Cloud Run will automatically deploy the new version with zero downtime!

---

🎉 **Your secure warehouse visualizer is now live!** 

Visit your Cloud Run URL to see your Three.js application pulling live data from Google Sheets through a secure API. 