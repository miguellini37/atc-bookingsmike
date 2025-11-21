#!/bin/bash

# ATC Booking System - DigitalOcean Droplet Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 ATC Booking System - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please do not run as root. Use a regular user with sudo privileges.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Installing dependencies...${NC}"
sudo apt update
sudo apt install -y curl git

echo -e "${GREEN}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${YELLOW}Docker installed. You may need to log out and back in for group changes to take effect.${NC}"
else
    echo "Docker already installed"
fi

echo -e "${GREEN}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install -y docker-compose
else
    echo "Docker Compose already installed"
fi

echo -e "${GREEN}Step 4: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env

    # Generate random passwords
    DB_ROOT_PASS=$(openssl rand -base64 32)
    DB_USER_PASS=$(openssl rand -base64 32)
    SECRET_KEY=$(openssl rand -base64 32)

    # Update .env file
    sed -i "s/DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=$DB_ROOT_PASS/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_USER_PASS/" .env
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env

    echo -e "${GREEN}.env file created with secure random passwords${NC}"
    echo -e "${YELLOW}Please edit .env and update CORS_ORIGIN with your domain/IP${NC}"

    read -p "Press enter to continue after editing .env..."
else
    echo ".env file already exists"
fi

echo -e "${GREEN}Step 5: Building and starting services...${NC}"
docker-compose up -d --build

echo -e "${GREEN}Step 6: Waiting for database to be ready...${NC}"
sleep 10

echo -e "${GREEN}Step 7: Running database migrations...${NC}"
docker-compose exec -T backend npx prisma migrate deploy

echo -e "${GREEN}Step 8: Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 3000/tcp
    echo "Firewall configured"
else
    echo -e "${YELLOW}UFW not available, skipping firewall setup${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Your application is now running:"
echo "  Frontend: http://$(curl -s ifconfig.me)"
echo "  Backend:  http://$(curl -s ifconfig.me):3000"
echo "  Health:   http://$(curl -s ifconfig.me):3000/health"
echo ""
echo "Next steps:"
echo "1. Create your first API key in the admin panel"
echo "2. Set up SSL with Let's Encrypt (see DEPLOYMENT.md)"
echo "3. Configure your domain DNS"
echo ""
echo "Useful commands:"
echo "  docker-compose ps              # View running services"
echo "  docker-compose logs -f         # View logs"
echo "  docker-compose restart         # Restart services"
echo "  docker-compose down            # Stop services"
echo ""
echo -e "${YELLOW}Your SECRET_KEY for admin login:${NC}"
echo -e "${GREEN}$SECRET_KEY${NC}"
echo ""
echo "Save this key securely!"
