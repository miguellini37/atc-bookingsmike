# Seeding Production Database on DigitalOcean

## Method 1: Using DigitalOcean Console (Recommended)

1. **Go to your App Platform dashboard**
   - Visit: https://cloud.digitalocean.com/apps

2. **Access your backend component**
   - Click on your app
   - Select the **backend** component
   - Click **Console** tab

3. **Run these commands:**
   ```bash
   cd /workspace
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

4. **Refresh your app**
   - Visit https://shark-app-6yec5.ondigitalocean.app/
   - You should now see sample data!

---

## Method 2: Using doctl CLI (Alternative)

If you have doctl installed locally:

```bash
# Get your app ID
doctl apps list

# Run seed on backend component
doctl apps exec YOUR_APP_ID --component backend -- npx tsx prisma/seed.ts
```

---

## Method 3: One-Time Job (For automated seeding)

Create a one-time job in your app spec:

1. In App Platform dashboard, click **Settings** → **App Spec**

2. Add this job configuration:

```yaml
jobs:
  - name: seed-db
    kind: PRE_DEPLOY
    instance_count: 1
    instance_size_slug: basic-xxs
    source_dir: /backend
    run_command: npx prisma migrate deploy && npx tsx prisma/seed.ts
```

3. Click **Save** and redeploy

---

## Method 4: Manual Database Population

If console access doesn't work, you can use the database connection string:

1. **Get your database connection string**
   - Go to Databases in DigitalOcean
   - Copy the connection string

2. **Update local .env with production credentials**
   ```bash
   DATABASE_URL="your-production-database-url"
   ```

3. **Run seed locally (connects to production DB)**
   ```bash
   cd backend
   npm run db:seed
   ```

4. **IMPORTANT:** Change .env back to local database after!

---

## Verify Seeding Worked

After seeding, check the API:

```bash
# Should return bookings
curl https://shark-app-6yec5.ondigitalocean.app/api/bookings
```

Or visit your frontend - you should see:
- 🟢 4 Active bookings
- 🔵 10+ Upcoming bookings
- ⚫ 5+ Recently completed

---

## Troubleshooting

### "npx not found"
Your backend might not have Node installed. Check App Platform build logs.

### "prisma command not found"
Run this first: `npm install`

### "Can't connect to database"
Check your DATABASE_URL environment variable in App Platform settings.

### Still blank after seeding?
Check backend logs:
1. Go to App Platform dashboard
2. Click **Runtime Logs** tab
3. Look for errors

---

## Quick Debug Commands

```bash
# Check if backend is running
curl https://shark-app-6yec5.ondigitalocean.app/health

# Check API directly
curl https://shark-app-6yec5.ondigitalocean.app/api/bookings

# Should return JSON with bookings array
```
