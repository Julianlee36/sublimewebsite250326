#!/bin/bash

# Sublime Website Deployment Script
# This script builds and deploys the website

echo "🔄 Starting deployment process..."

# Note about CORS configuration
echo "ℹ️ Updating CORS configuration..."
gsutil cors set cors.json gs://sublimewebsite20250326.firebasestorage.app
if [ $? -eq 0 ]; then
  echo "✅ CORS configuration updated successfully"
else
  echo "⚠️ CORS configuration could not be updated automatically."
  echo "   Manual update may be required via Google Cloud Console:"
  echo "   1. Go to https://console.cloud.google.com/storage/browser/sublimewebsite20250326.firebasestorage.app"
  echo "   2. Click on the 'Permissions' tab"
  echo "   3. Find 'CORS configuration' and paste the contents of cors.json"
fi
echo ""

# 2. Build the application
echo "🏗️ Building the application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build completed successfully"

# 3. Deploy to Firebase
echo "🚀 Deploying to Firebase..."
npx firebase-tools@11.30.0 deploy --only hosting
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "🌎 Website is live at: https://sublimewebsite20250326.web.app"
else
  echo "❌ Deployment failed"
  exit 1
fi

echo "🎉 All done! Your website is now live with updated CORS configuration."