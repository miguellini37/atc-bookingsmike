# Deploying to DigitalOcean

This guide covers two deployment methods for the ATC Booking System on DigitalOcean.

## Option 1: DigitalOcean App Platform (Recommended)

**Best for:** Quick deployment, automatic scaling, managed infrastructure
**Cost:** ~$12-15/month (Basic plan)

### Prerequisites
- DigitalOcean account
- GitHub repository with your code
- Domain name (optional, but recommended)

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git push origin claude/modernize-codebase-01HqzrX47QRTw2R1jhdLKk4D
```

### Step 2: Create a Managed Database

1. Log in to DigitalOcean
2. Click **Create** → **Databases**
3. Choose:
   - **Database engine:** MySQL 8
   - **Plan:** Basic ($15/month for production)
   - **Datacenter:** Choose closest to your users
4. Click **Create Database Cluster**
5. Wait 5-10 minutes for provisioning
6. Copy the **Connection String** (you'll need this)

### Step 3: Deploy with App Platform

1. Click **Create** → **Apps**
2. Select **GitHub** and authorize DigitalOcean
3. Choose your repository and branch
4. Configure components:

#### Backend Configuration
```yaml
Name: atc-bookings-backend
Type: Web Service
Source Directory: /backend
Build Command: npm install && npx prisma generate && npm run build
Run Command: npx prisma migrate deploy && npm start
HTTP Port: 3000
Environment Variables:
  NODE_ENV: production
  DATABASE_URL: [paste your MySQL connection string]
  SECRET_KEY: [generate a strong random key]
  CORS_ORIGIN: https://your-app-name.ondigitalocean.app
  LOG_LEVEL: info
```

#### Frontend Configuration
```yaml
Name: atc-bookings-frontend
Type: Static Site
Source Directory: /frontend
Build Command: npm install && VITE_API_URL=https://atc-bookings-backend-xxxxx.ondigitalocean.app npm run build
Output Directory: dist
```

### Step 4: Set Environment Variables

In the App Platform dashboard:
1. Go to **Settings** → **App-Level Environment Variables**
2. Add all required variables from `.env.example`
3. **Important:** Set `CORS_ORIGIN` to your frontend URL

### Step 5: Deploy

1. Click **Create Resources**
2. Wait 5-10 minutes for deployment
3. Your app will be live at `https://your-app-name.ondigitalocean.app`

### Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Update your DNS records as shown
5. SSL certificate will be automatically provisioned

---

## Option 2: DigitalOcean Droplet with Docker

**Best for:** Full control, cost optimization
**Cost:** ~$6-12/month (Basic Droplet)

### Step 1: Create a Droplet

1. Click **Create** → **Droplets**
2. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $12/month (2GB RAM recommended)
   - **Datacenter:** Choose closest to your users
   - **Authentication:** SSH keys (recommended) or password
3. Click **Create Droplet**
4. Note the IP address

### Step 2: Initial Server Setup

SSH into your droplet:
```bash
ssh root@your_droplet_ip
```

Update system and install dependencies:
```bash
# Update packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create a non-root user (recommended)
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### Step 3: Clone Your Repository

```bash
# Install Git if needed
sudo apt install git -y

# Clone your repository
git clone https://github.com/YOUR_USERNAME/atc-bookingsmike.git
cd atc-bookingsmike

# Checkout your branch
git checkout claude/modernize-codebase-01HqzrX47QRTw2R1jhdLKk4D
```

### Step 4: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit with your settings
nano .env
```

Update `.env` with:
```env
NODE_ENV=production
DB_ROOT_PASSWORD=your_secure_password_here
DB_DATABASE=atc_bookings
DB_USER=atc_user
DB_PASSWORD=another_secure_password
DB_PORT=3306
BACKEND_PORT=3000
FRONTEND_PORT=80
SECRET_KEY=generate-a-strong-random-secret-key
CORS_ORIGIN=http://your_droplet_ip
LOG_LEVEL=info
```

### Step 5: Update Frontend API URL

Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://your_droplet_ip:3000',  // Update this
      changeOrigin: true,
    },
  },
},
```

### Step 6: Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 7: Set Up Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### Step 8: Access Your Application

- Frontend: `http://your_droplet_ip`
- Backend API: `http://your_droplet_ip:3000`
- Health check: `http://your_droplet_ip:3000/health`

### Step 9: Set Up SSL with Nginx and Let's Encrypt (Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/atc-bookings
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/atc-bookings /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your_domain.com
```

### Step 10: Auto-restart on Reboot

```bash
# Docker containers will auto-restart (already configured in docker-compose.yml)
# Verify restart policy:
docker inspect atc-bookings-backend | grep -A 5 RestartPolicy
```

---

## Database Setup for Both Options

### Initialize Database

Once deployed, initialize the database:

**For App Platform:**
```bash
# SSH into your backend app component
doctl apps exec [app-id] --component backend -- npx prisma migrate deploy
```

**For Droplet:**
```bash
cd ~/atc-bookingsmike
docker-compose exec backend npx prisma migrate deploy
```

### Create First API Key

Connect to the database and create your first API key manually:

**For App Platform:**
Use the database console in DigitalOcean dashboard

**For Droplet:**
```bash
docker-compose exec database mysql -u atc_user -p atc_bookings

# Then run:
INSERT INTO api_keys (cid, name, `key`, division, subdivision, created_at, updated_at)
VALUES ('1234567', 'Admin', 'your-generated-api-key-here', 'EUR', 'GBR', NOW(), NOW());
```

---

## Monitoring and Maintenance

### View Logs

**App Platform:**
- View in DigitalOcean dashboard under **Runtime Logs**

**Droplet:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Update Deployment

**App Platform:**
- Push to GitHub, automatic deployment triggers

**Droplet:**
```bash
cd ~/atc-bookingsmike
git pull origin claude/modernize-codebase-01HqzrX47QRTw2R1jhdLKk4D
docker-compose down
docker-compose up -d --build
```

### Backup Database

**App Platform:**
- Automated backups included with managed database

**Droplet:**
```bash
# Create backup
docker-compose exec database mysqldump -u atc_user -p atc_bookings > backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec -T database mysql -u atc_user -p atc_bookings < backup_20240115.sql
```

---

## Cost Comparison

| Service | App Platform | Droplet |
|---------|-------------|---------|
| Database | $15/month (Managed MySQL) | $0 (Included) |
| Backend | $5/month (Basic) | $0 (Included) |
| Frontend | $5/month (Static Site) | $0 (Included) |
| Droplet | - | $12/month |
| **Total** | **~$25/month** | **~$12/month** |

**App Platform Pros:**
- Zero DevOps
- Auto-scaling
- Automatic SSL
- Built-in CI/CD
- Managed database with backups

**Droplet Pros:**
- Lower cost
- Full control
- Can host multiple apps
- No platform limitations

---

## Troubleshooting

### Backend won't start
```bash
# Check environment variables
docker-compose exec backend printenv

# Check database connection
docker-compose exec backend npx prisma db push
```

### Frontend can't reach backend
- Verify CORS_ORIGIN matches your frontend URL
- Check backend is running: `curl http://localhost:3000/health`

### Database connection failed
- Verify DATABASE_URL is correct
- Check database container is running: `docker-compose ps`

### Port already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 [PID]
```

---

## Security Checklist

- [ ] Changed default SECRET_KEY
- [ ] Changed database passwords
- [ ] Enabled firewall (UFW)
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] Non-root user for SSH
- [ ] SSH key authentication enabled
- [ ] Fail2ban installed (optional but recommended)

---

## Need Help?

- DigitalOcean Documentation: https://docs.digitalocean.com
- Community Forum: https://www.digitalocean.com/community
- GitHub Issues: Create an issue in your repository
