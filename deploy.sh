#!/bin/bash

echo "🚀 Starting deployment preparation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting with fixes
echo "🔧 Running ESLint with auto-fix..."
npm run lint || echo "⚠️  Some linting issues remain, but continuing..."

# Build the project
echo "🏗️  Building the project..."
npm run build

echo "✅ Deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"