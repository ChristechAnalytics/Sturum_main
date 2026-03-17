# Git Branch Strategy for Staging and Production

## Branch Structure

- `main` or `master` → Production (deployed to Vercel production)
- `staging` → Staging environment (deployed to Vercel preview)
- `develop` → Development branch (for active development)

## Setup Instructions

### 1. Create and Switch to Staging Branch

```bash
# Create staging branch from current branch
git checkout -b staging

# Push staging branch to GitHub
git push -u origin staging
```

### 2. Create Development Branch (Optional)

```bash
# Create develop branch
git checkout -b develop

# Push develop branch
git push -u origin develop
```

### 3. Configure Vercel for Multiple Branches

#### Production (main branch):
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Production Branch: `main` (or `master`)
3. Environment Variables:
   - `REACT_APP_API_URL` = `https://sturum-backend.onrender.com`

#### Preview/Staging (staging branch):
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Preview Branches: Include `staging`
3. Environment Variables (for Preview):
   - `REACT_APP_API_URL` = `https://sturum-backend-staging.onrender.com` (if you have a staging backend)
   - Or use the same production backend for testing

### 4. Workflow

#### For Local Development:
```bash
# Work on develop or feature branch
git checkout develop
# Make changes
# Test locally (uses localhost:4000 automatically)
npm start
```

#### For Staging Deployment:
```bash
# Merge develop into staging
git checkout staging
git merge develop
git push origin staging
# Vercel will auto-deploy staging branch
```

#### For Production Deployment:
```bash
# Merge staging into main
git checkout main
git merge staging
git push origin main
# Vercel will auto-deploy main branch to production
```

## Environment Variables by Environment

### Local Development
- No `.env` file needed (defaults to `http://localhost:4000`)
- Or create `.env.local` (gitignored) if you need to override:
  ```
  REACT_APP_API_URL=http://localhost:4000
  ```

### Staging (Vercel Preview)
- Set in Vercel Dashboard → Environment Variables → Preview
- `REACT_APP_API_URL` = Your staging backend URL

### Production (Vercel Production)
- Set in Vercel Dashboard → Environment Variables → Production
- `REACT_APP_API_URL` = Your production backend URL

## Current Setup

The `config.js` file now automatically:
- ✅ Uses `localhost:4000` when running on localhost
- ✅ Uses `REACT_APP_API_URL` if set (for Vercel)
- ✅ Falls back to production backend for deployed apps

So you can work locally without any environment variables!
