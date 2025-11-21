#!/bin/bash

# Development Setup Script for ATC Booking System
# This script sets up the database and seeds it with sample data

set -e

echo "🚀 ATC Booking System - Development Setup"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Please edit .env with your database settings before continuing.${NC}"
    echo ""
    read -p "Press enter when ready to continue..."
fi

echo -e "${GREEN}Step 1: Installing dependencies...${NC}"
npm install

echo ""
echo -e "${GREEN}Step 2: Generating Prisma client...${NC}"
npm run db:generate

echo ""
echo -e "${GREEN}Step 3: Running database migrations...${NC}"
npm run db:migrate

echo ""
echo -e "${GREEN}Step 4: Seeding database with sample data...${NC}"
npm run db:seed

echo ""
echo -e "${GREEN}==========================================="
echo "✨ Setup Complete!"
echo "==========================================="
echo ""
echo "Your database now contains:"
echo "  • 10 sample controllers with API keys"
echo "  • 4 active bookings (happening right now)"
echo "  • 10+ upcoming bookings"
echo "  • 8 completed bookings"
echo ""
echo "Next steps:"
echo "  1. Start the backend: npm run dev"
echo "  2. Start the frontend: cd ../frontend && npm install && npm run dev"
echo "  3. Visit http://localhost:5173 to see your bookings!"
echo ""
echo "To view sample API keys, check the seed output above."
echo "To manage the database visually: npm run db:studio"
echo ""
