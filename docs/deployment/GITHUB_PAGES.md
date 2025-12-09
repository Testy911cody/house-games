# 🚀 GitHub Pages Deployment Guide

Complete guide to deploy HouseGames to GitHub Pages.

## ✅ Why GitHub Pages?

- **Unlimited deploys** - Deploy as many times as you want, no limits
- **Free forever** - No cost, no credit card required
- **Unlimited bandwidth** - No traffic limits
- **Custom domains** - Free custom domain support
- **Automatic HTTPS** - SSL certificates included
- **Fast CDN** - Global content delivery network

## 📋 Prerequisites

1. **GitHub Account** - [Sign up](https://github.com/signup) if you don't have one
2. **Git installed** - For pushing code to GitHub
3. **Node.js 18+** - For building the project

## 🚀 Quick Start

### Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `house-games` (or your choice)
3. Set to **Public** (required for free GitHub Pages) or **Private** (works too)
4. **Don't** initialize with README
5. Click **Create repository**

### Step 2: Push Your Code

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/house-games.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Build and deployment**:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` (or `main` if you prefer)
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 4: Enable GitHub Actions

GitHub Actions will automatically build and deploy your site:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### Step 5: Your Site is Live! 🎉

After the first deployment completes (usually 2-3 minutes), your site will be available at:

```
https://YOUR_USERNAME.github.io/house-games/
```

## 🔄 Automatic Deployments

Every time you push to the `main` branch, GitHub Actions will:

1. ✅ Build your Next.js site
2. ✅ Export it as static files
3. ✅ Deploy to GitHub Pages
4. ✅ Your site updates automatically!

**To deploy updates:**

```bash
git add .
git commit -m "Update games"
git push
```

That's it! Your site will be live in ~2-3 minutes.

## 🎯 Custom Domain Setup

### Step 1: Add Domain in GitHub

1. Go to your repository → **Settings** → **Pages**
2. Under **Custom domain**, enter your domain (e.g., `housegames.club`)
3. Click **Save**
4. GitHub will show you DNS configuration instructions

### Step 2: Configure DNS Records

You need to add DNS records at your domain registrar (where you bought `housegames.club`).

**For GitHub Pages, you have two options:**

#### Option A: A Records (For Root Domain - housegames.club)

Add these **A records** at your domain registrar:

```
Type: A
Name: @ (or leave blank, or enter: housegames.club)
Value: 185.199.108.153
TTL: 3600 (or default)

Type: A
Name: @ (or leave blank, or enter: housegames.club)
Value: 185.199.109.153
TTL: 3600 (or default)

Type: A
Name: @ (or leave blank, or enter: housegames.club)
Value: 185.199.110.153
TTL: 3600 (or default)

Type: A
Name: @ (or leave blank, or enter: housegames.club)
Value: 185.199.111.153
TTL: 3600 (or default)
```

**Important:** You need to add **all 4 A records** with these IP addresses.

#### Option B: CNAME Record (For Subdomain - www.housegames.club)

If you want to use `www.housegames.club` instead:

```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
TTL: 3600 (or default)
```

Replace `YOUR_USERNAME` with your GitHub username.

**Note:** For the root domain (`housegames.club`), you **must** use A records. CNAME records don't work for root domains.

### Step 3: Add CNAME File to Repository

After adding DNS records, GitHub will automatically create a `CNAME` file in your repository. This file should contain:

```
housegames.club
```

If it doesn't create automatically, you can create it manually:

1. Create a file named `CNAME` (no extension) in your `public/` folder
2. Add this content:
   ```
   housegames.club
   ```
3. Commit and push:
   ```bash
   git add public/CNAME
   git commit -m "Add custom domain CNAME"
   git push
   ```

### Step 4: Wait for DNS Propagation

1. DNS changes can take **5-60 minutes** to propagate
2. Check DNS propagation using:
   - [whatsmydns.net](https://www.whatsmydns.net/#A/housegames.club)
   - [dnschecker.org](https://dnschecker.org/#A/housegames.club)
3. Look for the IP addresses `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, or `185.199.111.153`

### Step 5: Verify Configuration

1. Go back to **Settings** → **Pages**
2. Click **"Check again"** button next to the DNS error
3. Once DNS is configured correctly, you'll see:
   - ✅ "DNS check successful"
   - ✅ "Enforce HTTPS" checkbox becomes available

### Step 6: Enable HTTPS

1. Once DNS is verified, check the **"Enforce HTTPS"** checkbox
2. GitHub will automatically provision an SSL certificate (takes 5-10 minutes)
3. Your site will be available at `https://housegames.club` with a valid SSL certificate

### Common DNS Providers Instructions

**Namecheap:**
1. Log in → Domain List → Manage → Advanced DNS
2. Add 4 A records with the IPs above
3. Save changes

**GoDaddy:**
1. Log in → My Products → DNS
2. Add 4 A records with the IPs above
3. Save changes

**Cloudflare:**
1. Log in → Select domain → DNS → Records
2. Add 4 A records with the IPs above
3. Make sure "Proxy status" is set to "DNS only" (gray cloud)
4. Save changes

**Google Domains:**
1. Log in → DNS → Custom records
2. Add 4 A records with the IPs above
3. Save changes

### Troubleshooting DNS Issues

**If DNS check still fails after 1 hour:**

1. **Verify DNS records are correct:**
   - Use [whatsmydns.net](https://www.whatsmydns.net/#A/housegames.club) to check
   - All 4 IPs should appear in different locations

2. **Check for conflicting records:**
   - Remove any old A records pointing to different IPs
   - Remove any CNAME records for the root domain

3. **Wait longer:**
   - Some DNS providers take up to 24 hours
   - Try again after a few hours

4. **Check domain registrar:**
   - Make sure you're editing DNS at the correct registrar
   - Some registrars use different DNS providers

5. **Contact support:**
   - If still not working after 24 hours, contact your domain registrar support

## 📁 Project Structure for GitHub Pages

The project is configured for static export:

- **Build output**: `out/` directory (created during build)
- **GitHub Actions**: Automatically builds and deploys
- **Static files**: All pages are pre-rendered at build time

## 🔧 Configuration Files

- **`.github/workflows/deploy-pages.yml`** - GitHub Actions deployment workflow
- **`next.config.js`** - Configured for static export
- **`.nojekyll`** - Prevents Jekyll processing (required for Next.js)

## 🐛 Troubleshooting

### Build Fails

1. Check GitHub Actions tab for error logs
2. Ensure `package.json` has all dependencies
3. Verify Node.js version (should be 18+)

### Site Not Updating

1. Check GitHub Actions tab - is the workflow running?
2. Wait 2-3 minutes after push
3. Clear browser cache (Ctrl+Shift+R)

### 404 Errors on Routes

- This is normal for client-side routing
- GitHub Pages serves static files
- All routes should work with client-side navigation

### API Routes Not Working

- GitHub Pages only serves static files
- API routes have been converted to client-side utilities
- All functionality works without server-side APIs

## 📊 Deployment Status

Check deployment status:

1. Go to your repository
2. Click **Actions** tab
3. See latest deployment status
4. Click on a workflow run to see detailed logs

## 🎮 Unlimited Deploys

**You can deploy unlimited times!**

- Deploy 100 times a day? ✅ No problem
- Deploy on every commit? ✅ Automatic
- Deploy manually? ✅ Use "Run workflow" button

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🔐 Security Notes

- All API routes converted to client-side utilities
- Supabase calls work directly from client
- No server-side secrets needed
- All data stored in Supabase or localStorage

---

**Your site is now live on GitHub Pages! 🎉**

