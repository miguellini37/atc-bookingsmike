# Quick Start Guide - DigitalOcean Deployment

Choose your deployment method:

---

## 🎯 Option 1: App Platform (Easiest - 5 minutes)

**Perfect for beginners. Fully managed, zero DevOps required.**

### Steps:
1. **Create Database:** DigitalOcean → Create → Databases → MySQL 8
2. **Create App:** DigitalOcean → Create → Apps → Connect GitHub
3. **Configure:**
   - Backend: `/backend` folder, run `npm start`
   - Frontend: `/frontend` folder, static site
4. **Set Environment Variables:**
   - `DATABASE_URL`: [from database dashboard]
   - `SECRET_KEY`: [generate random 32-char string]
   - `CORS_ORIGIN`: [your frontend URL]
5. **Deploy!** 🚀

**Cost:** ~$25/month | **Time:** 5 minutes

[Full Guide →](DEPLOYMENT.md#option-1-digitalocean-app-platform-recommended)

---

## 💻 Option 2: Droplet with Docker (Best Value - 15 minutes)

**For developers who want control. Half the cost.**

### Quick Deploy:

```bash
# 1. Create Ubuntu 22.04 Droplet ($12/month)
# 2. SSH into droplet
ssh root@your_droplet_ip

# 3. Create deploy user
adduser deploy
usermod -aG sudo deploy
su - deploy

# 4. Clone and run deployment script
git clone https://github.com/YOUR_USERNAME/atc-bookingsmike.git
cd atc-bookingsmike
git checkout claude/modernize-codebase-01HqzrX47QRTw2R1jhdLKk4D
chmod +x deploy.sh
./deploy.sh

# 5. Edit .env when prompted
nano .env
# Update CORS_ORIGIN to your droplet IP or domain

# Script handles everything else!
```

**Access your app:**
- Frontend: `http://your_droplet_ip`
- Backend: `http://your_droplet_ip:3000`

**Cost:** ~$12/month | **Time:** 15 minutes

[Full Guide →](DEPLOYMENT.md#option-2-digitalocean-droplet-with-docker)

---

## 📋 What You Need

- [ ] DigitalOcean account ([Get $200 credit](https://m.do.co/c/))
- [ ] GitHub account with your code
- [ ] Domain name (optional but recommended)
- [ ] 15-30 minutes

---

## 🔧 Post-Deployment

### 1. Create Your First Admin API Key

**App Platform:**
```bash
doctl apps exec [app-id] --component backend -- npx prisma db push
# Then use database console to insert first key
```

**Droplet:**
```bash
docker-compose exec database mysql -u atc_user -p
# Password is in your .env file

# In MySQL:
USE atc_bookings;
INSERT INTO api_keys (cid, name, `key`, division, subdivision, created_at, updated_at)
VALUES ('1234567', 'Admin', 'generated-key-here', 'EUR', 'GBR', NOW(), NOW());
```

### 2. Access Admin Panel

1. Go to `http://your-domain/login`
2. Enter your `SECRET_KEY` (from `.env` or deployment script output)
3. Create additional API keys for users

### 3. Add SSL Certificate (Droplet only)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

---

## 🆘 Troubleshooting

### Can't connect to backend?
```bash
# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Database connection error?
```bash
# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test database connection
docker-compose exec backend npx prisma db push
```

### Port 3000 already in use?
```bash
sudo lsof -i :3000
sudo kill -9 [PID]
```

---

## 📊 Management Commands

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Update code
git pull
docker-compose up -d --build

# Backup database
docker-compose exec database mysqldump -u atc_user -p atc_bookings > backup.sql
```

---

## 🎓 Next Steps

1. ✅ Deploy application
2. ✅ Set up SSL certificate
3. ✅ Create admin API key
4. ✅ Test booking creation
5. ⚙️ Configure custom domain
6. 📧 Set up monitoring (optional)
7. 🔒 Enable 2FA for DigitalOcean (recommended)

---

## 💡 Pro Tips

- **Use App Platform** if you're new to DevOps
- **Use Droplet** if you want to save money and learn
- Always set up **automatic backups** (both options support this)
- Use a **strong SECRET_KEY** (32+ random characters)
- Point your **domain** to DigitalOcean for better SSL support
- Monitor your **resource usage** in the first week

---

## 🔗 Useful Links

- [Full Deployment Guide](DEPLOYMENT.md)
- [DigitalOcean Docs](https://docs.digitalocean.com)
- [App Platform Pricing](https://www.digitalocean.com/pricing/app-platform)
- [Droplet Pricing](https://www.digitalocean.com/pricing/droplets)

---

**Need help?** Create an issue on GitHub or check the [full deployment guide](DEPLOYMENT.md).
