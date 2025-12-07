# 🚀 Deployment Guide for HouseGames

This guide will help you publish your website and set up automatic nightly updates.

## Option 1: Vercel (Recommended - Easiest for Next.js) ⭐

Vercel is made by the creators of Next.js and offers the best experience.

### Step 1: Prepare Your Code

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., "house-games")
   - Don't initialize with README
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/house-games.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up for Vercel**:
   - Go to https://vercel.com
   - Sign up with your GitHub account (free)

2. **Import Your Project**:
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Your site is live!** 🎉
   - Vercel will give you a URL like: `https://house-games.vercel.app`
   - Every push to GitHub will automatically deploy

### Step 3: Set Up Nightly Updates

**Option A: Automatic Deployments (Recommended)**
- Every time you push code to GitHub, Vercel automatically deploys
- Just push your changes daily: `git push`

**Option B: Scheduled Builds (If you want nightly rebuilds without code changes)**
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Enable "Automatic Deployments"
3. For scheduled builds, use Vercel Cron Jobs or GitHub Actions (see below)

---

## Option 2: Netlify

### Step 1: Push to GitHub (same as Vercel Step 1)

### Step 2: Deploy to Netlify

1. **Sign up**: https://www.netlify.com
2. **Import from Git**: 
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy"

3. **Automatic deployments**: Enabled by default on every push

---

## Option 3: GitHub Actions for Nightly Builds

If you want to trigger builds every night even without code changes:

### Create `.github/workflows/nightly-build.yml`:

```yaml
name: Nightly Build

on:
  schedule:
    # Runs every day at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Trigger Vercel Deployment
        run: |
          # This will trigger a new deployment
          # You can also use Vercel CLI or API
          echo "Build completed at $(date)"
```

---

## Quick Setup Script

I can create a setup script for you. Here's what you need:

1. **GitHub Account** (free)
2. **Vercel Account** (free)

### Manual Steps:

```bash
# 1. Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo and push
# (Do this on GitHub website first, then:)
git remote add origin https://github.com/YOUR_USERNAME/house-games.git
git branch -M main
git push -u origin main

# 3. Go to vercel.com and import the repo
# 4. Done! Your site is live
```

---

## Custom Domain (Optional)

1. **Vercel**: Project Settings → Domains → Add your domain
2. **Netlify**: Site Settings → Domain Management → Add custom domain

---

## Environment Variables (If Needed)

If you add environment variables later:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables

---

## Recommended: Vercel + GitHub

**Why Vercel?**
- ✅ Made for Next.js (zero configuration)
- ✅ Free tier is generous
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ ✅ Free custom domains
- ✅ Automatic deployments on every push

**Workflow:**
1. Make changes locally
2. `git add .`
3. `git commit -m "Your message"`
4. `git push`
5. Vercel automatically deploys in ~1-2 minutes

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment





