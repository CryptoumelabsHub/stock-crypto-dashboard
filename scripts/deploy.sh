#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment process...${NC}"

# Run type checking
echo "Running type check..."
npm run type-check

# Run tests
echo "Running tests..."
npm test

# Run linting
echo "Running linter..."
npm run lint

# Build the application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Set up production database
echo "Setting up production database..."
npm run db:setup

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel deploy --prod

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Print post-deployment instructions
echo -e "\n${GREEN}Post-deployment checklist:${NC}"
echo "1. Verify Sentry is receiving events"
echo "2. Check Web Vitals in Vercel Analytics"
echo "3. Verify all API endpoints are working"
echo "4. Test authentication flow"
echo "5. Monitor error rates"

# Print monitoring URLs
echo -e "\n${GREEN}Monitoring URLs:${NC}"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Sentry Dashboard: https://sentry.io"
echo "- API Status: https://your-domain.com/api/health"
