#!/bin/bash

# JobTracker Extension - Package for Chrome Web Store
# This script creates a production-ready ZIP file

echo "🚀 Packaging JobTracker Extension for Chrome Web Store..."
echo ""

# Step 1: Clean and build
echo "📦 Step 1: Building extension..."
npm run build
node copy-static.js

# Step 2: Create package directory
echo ""
echo "📁 Step 2: Preparing package..."
rm -rf package-for-store
mkdir -p package-for-store

# Step 3: Copy only necessary files from dist/
echo ""
echo "📋 Step 3: Copying files..."
cp -r dist/* package-for-store/
cp -r icons package-for-store/

# Step 4: Create ZIP file
echo ""
echo "🗜️  Step 4: Creating ZIP file..."
cd package-for-store
zip -r ../jobtracker-extension.zip ./*
cd ..

# Step 5: Cleanup
echo ""
echo "🧹 Step 5: Cleaning up..."
rm -rf package-for-store

# Done
echo ""
echo "✅ Package created: jobtracker-extension.zip"
echo ""
echo "📊 Package contents:"
unzip -l jobtracker-extension.zip | head -20
echo ""
echo "🎉 Ready to upload to Chrome Web Store!"
echo ""
echo "Next steps:"
echo "1. Go to: https://chrome.google.com/webstore/devconsole"
echo "2. Upload: jobtracker-extension.zip"
echo "3. Fill in store listing details"
echo "4. Submit for review"
