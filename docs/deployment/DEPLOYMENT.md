# 🚀 Deployment Guide

Complete guide to deploy HouseGames to production.

## Quick Start

**Fastest way to go live:**
1. Push code to GitHub
2. Deploy to Vercel (recommended) or Netlify
3. Add your custom domain (optional)

See [Quick Deploy](#quick-deploy) section below.

---

## Table of Contents

- [Quick Deploy](#quick-deploy)
- [Platform Options](#platform-options)
- [Custom Domain Setup](#custom-domain-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Quick Deploy

### Step 1: Push to GitHub

1. **Create GitHub repository:**
   - Go to https://github.com/new
   - Name: `house-games`
   - Set to **Public** (for Vercel free tier) or **Private** (use Netlify)
   - Don't initialize with README

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/house-games.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel (Recommended)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Select your repository
5. Click "Deploy" (settings auto-detected ✅)
6. Wait ~2 minutes → Your site is live!

**Your URL:** `https://house-games-xyz.vercel.app`

### Step 3: Add Custom Domain (Optional)

See [Custom Domain Setup](#custom-domain-setup) section below.

---

## Platform Options

### Option 1: Vercel (Recommended) ⭐

**Best for:** Next.js projects, easiest setup

**Pros:**
- Made by Next.js creators
- Zero configuration
- Automatic HTTPS
- Free custom domains
- Generous free tier

**Cons:**
- Free tier requires public GitHub repos
- Private repos need Pro plan ($20/month)

**Setup:** See [Quick Deploy](#quick-deploy) above.

---

### Option 2: Netlify

**Best for:** Private repositories, similar to Vercel

**Pros:**
- Free private repo support
- Easy setup
- Automatic deployments
- Free SSL certificates
- Great Next.js support

**Setup:**

1. **Make repo private** (if desired):
   - GitHub → Settings → Danger Zone → Make private

2. **Deploy to Netlify:**
   - Go to https://app.netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Click "Deploy site"

3. **Add environment variables** (if needed):
   - Site settings → Environment variables
   - Add `OPENAI_API_KEY` (optional - see below)

**Your URL:** `https://house-games-12345.netlify.app`

---

## Custom Domain Setup

### For Vercel

1. **Add domain in Vercel:**
   - Project → Settings → Domains
   - Enter your domain (e.g., `housegames.club`)
   - Click "Add"

2. **Configure DNS:**

   **Option A: Use Vercel Nameservers (Easier)**
   - Vercel provides: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
   - Update nameservers at your domain registrar
   - Vercel manages DNS automatically

   **Option B: Add DNS Records Manually**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS propagation** (5-60 minutes)

### For Netlify

1. **Add domain:**
   - Site settings → Domain management
   - Add your domain

2. **Configure DNS:**
   - Netlify will show DNS records to add
   - Add at your domain registrar

3. **Wait for propagation**

---

## Environment Variables

### OPENAI_API_KEY (Optional)

**What it's for:** AI-powered Jeopardy topic generation

**Is it required?** No! The app works without it using local generation.

**When to add it:**
- You want AI-generated questions (more creative)
- You're okay with API costs (~$0.01-0.10 per topic)

**How to add:**

**Vercel:**
- Project Settings → Environment Variables
- Add: `OPENAI_API_KEY` = `your_key`
- Select: Production, Preview, Development
- Save and redeploy

**Netlify:**
- Site settings → Environment variables
- Add: `OPENAI_API_KEY` = `your_key`
- Save and trigger redeploy

**Without the key:**
- Jeopardy game still works
- Uses template-based local generation
- No API costs

---

## Troubleshooting

### Build Fails

- Check build logs in dashboard
- Run `npm run build` locally to test
- Ensure all dependencies are in `package.json`

### Domain Not Working

- Wait 24-48 hours for full DNS propagation
- Check DNS with https://dnschecker.org
- Verify DNS records match platform requirements
- Clear browser cache or try incognito mode

### Deployment Not Updating

- Check if GitHub push succeeded
- Verify platform is connected to correct repo
- Check deployment logs for errors
- Try manual redeploy from dashboard

### Wrong Account Authentication

**Windows:**
```bash
# List cached credentials
cmdkey /list | findstr github

# Delete wrong credentials
cmdkey /delete:LegacyGeneric:target=git:https:WRONG_USERNAME@github.com
```

Then push again - it will prompt for correct account.

---

## Updating Your Site

**Simple 3-step process:**

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. **Platform auto-deploys** (~2 minutes)

No manual steps needed! ✨

---

## Security Checklist

✅ **Before deploying:**
- No API keys in code (use environment variables)
- `.env` files in `.gitignore`
- No passwords or secrets committed
- Environment variables set in platform dashboard

See `docs/development/SECURITY.md` for detailed security guide.

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## Quick Reference

| Platform | Free Private Repos | Setup Difficulty | Best For |
|----------|-------------------|------------------|----------|
| Vercel   | ❌ (Pro only)      | ⭐⭐⭐⭐⭐         | Next.js projects |
| Netlify  | ✅                 | ⭐⭐⭐⭐⭐         | Private repos |

**Recommendation:** Use Vercel for public repos, Netlify for private repos.









