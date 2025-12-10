# 🔧 Troubleshooting GitHub Pages 404 Error

If you see "404 - There isn't a GitHub Pages site here", follow these steps:

## ✅ Quick Fix Checklist

### 1. Check GitHub Pages Source Setting

**This is the most common issue!**

1. Go to your repository → **Settings** → **Pages**
2. Under **Build and deployment**, check the **Source**:
   - ❌ **Wrong:** "Deploy from a branch"
   - ✅ **Correct:** "GitHub Actions"

3. If it's set to "Deploy from a branch":
   - Change it to **"GitHub Actions"**
   - Click **Save**
   - Wait 1-2 minutes

### 2. Check GitHub Actions Workflow

1. Go to your repository → **Actions** tab
2. Look for **"Deploy to GitHub Pages"** workflow
3. Check the status:
   - ✅ **Green checkmark** = Deployment successful
   - ⏳ **Yellow circle** = In progress, wait for it to finish
   - ❌ **Red X** = Failed, check the error logs
   - ⚠️ **"Waiting for approval"** = Click "Approve and deploy"

### 3. First-Time Deployment Approval

If this is your first deployment:

1. Go to **Actions** → **Deploy to GitHub Pages**
2. You may see a banner saying "This workflow needs permission to run"
3. Click **"Approve and deploy"** or **"Run workflow"**
4. Wait for it to complete

### 4. Verify Workflow Completed

1. Go to **Actions** tab
2. Click on the latest **"Deploy to GitHub Pages"** run
3. Check both jobs:
   - **build** - Should show green checkmark ✅
   - **deploy** - Should show green checkmark ✅

### 5. Check the Correct URL

Your site URL should be:
```
https://YOUR_USERNAME.github.io/house-games/
```

**Important:** 
- Replace `YOUR_USERNAME` with your GitHub username
- Replace `house-games` with your repository name
- Note the `/house-games/` at the end (trailing slash)

### 6. Wait for Propagation

- After deployment completes, wait **2-5 minutes**
- GitHub Pages needs time to update
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## 🔍 Common Issues

### Issue: "Source" is set to "Deploy from a branch"

**Solution:** Change to "GitHub Actions" in Settings → Pages

### Issue: Workflow shows "Waiting for approval"

**Solution:** Click "Approve and deploy" in the Actions tab

### Issue: Workflow failed with build error

**Solution:** 
1. Check the error message in Actions
2. Fix the code issue
3. Push the fix
4. Workflow will automatically retry

### Issue: Workflow completed but site still 404

**Solution:**
1. Wait 5-10 minutes (GitHub Pages can be slow)
2. Try incognito/private browsing window
3. Check the exact URL (case-sensitive, must match repo name)
4. Verify GitHub Pages is enabled in repository settings

### Issue: Custom domain shows 404

**Solution:**
1. Check DNS is configured correctly
2. Wait for DNS propagation (30-60 minutes)
3. Verify in GitHub: Settings → Pages → Click "Check again"

## 📋 Step-by-Step Verification

1. ✅ **Repository is public** (or you have GitHub Pro)
2. ✅ **GitHub Pages is enabled** (Settings → Pages)
3. ✅ **Source is "GitHub Actions"** (not "Deploy from a branch")
4. ✅ **Workflow file exists** (`.github/workflows/deploy-pages.yml`)
5. ✅ **Workflow has run** (Actions tab shows completed runs)
6. ✅ **Both jobs succeeded** (build ✅ and deploy ✅)
7. ✅ **Using correct URL** (`username.github.io/repo-name/`)

## 🆘 Still Not Working?

1. **Check Actions logs:**
   - Go to Actions → Latest run → Click on failed job
   - Read the error message
   - Fix the issue and push again

2. **Verify repository name:**
   - URL must match repository name exactly
   - Case-sensitive
   - Include trailing slash

3. **Try manual workflow trigger:**
   - Actions → Deploy to GitHub Pages → "Run workflow"
   - Select "main" branch → Run

4. **Check GitHub Pages status:**
   - Settings → Pages
   - Should show "Your site is live at..."
   - If not, the deployment hasn't completed yet

---

**Most common fix:** Change Pages source from "Deploy from a branch" to "GitHub Actions" ✅


