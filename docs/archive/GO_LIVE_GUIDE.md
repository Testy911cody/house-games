# 🚀 GO LIVE GUIDE - Deploy HouseGames with Your Domain

## ✅ What You Need

1. **Your Domain** (you have this!)
2. **GitHub Account** (free) - https://github.com/signup
3. **Vercel Account** (free) - https://vercel.com/signup
4. **Git installed** on your computer

---

## 📋 Step-by-Step Deployment

### STEP 1: Prepare Your Code for Git

1. **Open terminal/command prompt** in your project folder

2. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Ready for production deployment"
   ```

### STEP 2: Push to GitHub

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `house-games` (or your choice)
   - Set to **Public** (required for free Vercel)
   - **Don't** initialize with README
   - Click "Create repository"

2. **Connect and push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/house-games.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

### STEP 3: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to https://vercel.com
   - Click "Sign Up" → Use your **GitHub account** (easiest)

2. **Import Your Project**:
   - Click "Add New Project"
   - Select your GitHub repository (`house-games`)
   - Vercel will auto-detect Next.js settings ✅
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - Click **"Deploy"**

3. **Wait for deployment** (~2 minutes)
   - You'll get a URL like: `https://house-games-xyz.vercel.app`
   - ✅ Your site is LIVE!

### STEP 4: Connect Your Custom Domain 🎯

1. **In Vercel Dashboard**:
   - Go to your project
   - Click **"Settings"** tab
   - Click **"Domains"** in the sidebar

2. **Add Your Domain**:
   - Enter your domain (e.g., `yourdomain.com`)
   - Click **"Add"**

3. **Configure DNS Records**:
   Vercel will show you what DNS records to add. You need to add these in your domain registrar (where you bought the domain):

   **For Root Domain** (yourdomain.com):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For WWW** (www.yourdomain.com):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **OR use Vercel's nameservers** (easier):
   - Vercel will provide nameservers like:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - Go to your domain registrar and change nameservers to these

4. **Wait for DNS Propagation**:
   - Usually takes 5-60 minutes
   - Vercel will show "Valid Configuration" when ready
   - Your site will be live at your domain! 🎉

---

## 🔧 Additional Configuration

### Enable HTTPS (Automatic)
- Vercel automatically provides SSL certificates
- Your site will be `https://yourdomain.com` automatically

### Environment Variables (If Needed)
If you add any later:
- Go to: Project Settings → Environment Variables
- Add your variables
- Redeploy

### Custom Build Settings (Already Optimized)
Your `next.config.js` is already optimized for production! ✅

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project deployed on Vercel
- [ ] Domain added in Vercel settings
- [ ] DNS records configured at domain registrar
- [ ] DNS propagated (check in Vercel dashboard)
- [ ] Site accessible at your domain!

---

## 🚀 After Going Live

### Automatic Deployments
Every time you push code to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel automatically deploys in ~2 minutes! ✨

### Update Your Site
1. Make changes locally
2. Test with `npm run dev`
3. Push to GitHub
4. Vercel auto-deploys

---

## 🆘 Troubleshooting

### DNS Not Working?
- Wait 24-48 hours for full propagation
- Check DNS with: https://dnschecker.org
- Verify records match Vercel's requirements

### Build Fails?
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Domain Shows "Invalid Configuration"?
- Double-check DNS records
- Make sure nameservers are correct
- Wait a bit longer for propagation

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Support**: support@vercel.com

---

## 🎉 You're All Set!

Once DNS propagates, your HouseGames site will be live at your custom domain with:
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Automatic deployments
- ✅ Free hosting (Vercel free tier)

**Your 3D games will look amazing live!** 🎮✨

