# ⚡ Quick Switch to Netlify (5 Minutes!)

## 🎯 Goal: Keep Your Code Private + Free Hosting

## Step 1: Make Repo Private (2 minutes)

1. Go to: `https://github.com/YOUR_USERNAME/house-games`
2. Click **Settings** (top menu)
3. Scroll to bottom → **Danger Zone**
4. Click **Change visibility** → **Make private**
5. Type repo name to confirm
6. ✅ Done!

## Step 2: Deploy to Netlify (3 minutes)

1. **Sign up:** https://app.netlify.com/signup
   - Click **"Sign up with GitHub"**
   - Authorize Netlify

2. **Deploy:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Click **"Deploy with GitHub"**
   - Select **"house-games"** repository
   - Click **"Deploy site"** (Netlify auto-detects Next.js ✅)

3. **Add API Key:**
   - Wait for first deployment to finish
   - Go to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
   - **Scopes:** Check all (Production, Preview, Branch)
   - Click **Save**
   - Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## ✅ Done!

Your site is now:
- ✅ **Private** (only you can see code)
- ✅ **Live** (deployed on Netlify)
- ✅ **Free** (no cost)
- ✅ **Secure** (API key in environment variables)

## 🔗 Your New Site URL

Netlify will give you a URL like:
- `https://house-games-12345.netlify.app`

You can customize it in **Site settings** → **Change site name**

## 🆚 What's Different from Vercel?

**Almost nothing!** Netlify works exactly like Vercel:
- ✅ Auto-deploys on every push
- ✅ Free SSL
- ✅ Fast CDN
- ✅ Environment variables
- ✅ Custom domains
- ✅ **BUT:** Supports private repos for FREE! 🎉

## 💡 Pro Tip

If you have a custom domain on Vercel:
1. Go to Netlify **Domain settings**
2. Add your custom domain
3. Update DNS records (Netlify will show you exactly what to change)
4. Wait 24-48 hours for DNS to propagate

## 🆘 Need Help?

- Netlify Docs: https://docs.netlify.com/
- Netlify Support: Very responsive and helpful!

**That's it! Super easy!** 🚀

