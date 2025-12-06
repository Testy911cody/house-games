# ⚡ QUICK DEPLOY - Copy & Paste Commands

## 🎯 Fastest Way to Go Live

### 1. Create GitHub Repo First
Go to: https://github.com/new
- Name: `house-games`
- Public
- Don't initialize with README
- Click "Create repository"

### 2. Connect GitHub from Cursor

**Method 1: Using Cursor's Built-in Terminal (Recommended)**

1. **Open Terminal in Cursor:**
   - Press `` Ctrl + ` `` (backtick key) OR
   - Go to: `Terminal` → `New Terminal` in the menu
   - The terminal opens in your project folder automatically

2. **Set up Git credentials (first time only):**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
   (Use the same email as your GitHub account)

3. **Authenticate with GitHub:**
   - When you run `git push`, GitHub will ask you to sign in
   - A browser window will open automatically
   - Sign in to GitHub and authorize
   - **OR** use a Personal Access Token (see Method 2 below)

**Method 2: Using Personal Access Token (More Secure)**

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: `HouseGames Deploy`
   - Select scopes: ✅ `repo` (full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Use the token when pushing:**
   - When Git asks for password, paste your token instead
   - Username: your GitHub username
   - Password: paste the token

**Method 3: Using GitHub CLI (gh)**

1. **Install GitHub CLI** (if not installed):
   - Download: https://cli.github.com/
   - Or use: `winget install GitHub.cli`

2. **Authenticate:**
   ```bash
   gh auth login
   ```
   - Follow the prompts to sign in via browser

3. **Now you can push without entering credentials!**

### 3. Run These Commands (in your project folder)

**How to open terminal in your project folder:**

**Option A: Using Cursor (Easiest)**
1. In Cursor, press `` Ctrl + ` `` (backtick) to open the integrated terminal
2. The terminal will automatically be in your project folder
3. Copy and paste the commands below one by one

**Option B: Using File Explorer**
1. Open File Explorer
2. Navigate to: `C:\Users\sudan\Downloads\VSCODE\HouseGames`
3. Click in the address bar, type `cmd` and press Enter
4. Command Prompt opens in that folder

**Option C: Using Command Prompt**
1. Press `Win + R`, type `cmd`, press Enter
2. Type: `cd C:\Users\sudan\Downloads\VSCODE\HouseGames`
3. Press Enter

**Step-by-step: How to run each Git command:**

1. **Open terminal** (use Option A above - press `` Ctrl + ` `` in Cursor)

2. **Command 1: Stage all files**
   - Type or paste: `git add .`
   - Press Enter
   - You should see no error message (that means it worked!)

3. **Command 2: Commit files**
   - Type or paste: `git commit -m "Initial commit - Ready for production"`
   - Press Enter
   - You'll see a message like "X files changed, Y insertions(+)"

4. **Command 3: Connect to GitHub**
   - **IMPORTANT:** Replace `YOUR_USERNAME` with your actual GitHub username
   - Example: If your GitHub username is `johnsmith`, the command would be:
     `git remote add origin https://github.com/johnsmith/house-games.git`
   - Type or paste the command (with your username)
   - Press Enter

5. **Command 4: Rename branch**
   - Type or paste: `git branch -M main`
   - Press Enter

6. **Command 5: Push to GitHub**
   - Type or paste: `git push -u origin main`
   - Press Enter
   - **First time?** You'll be asked to sign in to GitHub in your browser
   - After signing in, the push will complete automatically

**💡 Quick copy-paste (replace YOUR_USERNAME first!):**
```bash
git add .
git commit -m "Initial commit - Ready for production"
git remote add origin https://github.com/YOUR_USERNAME/house-games.git
git branch -M main
git push -u origin main
```

**Note:** If you already have a remote configured, use:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/house-games.git
```

### 4. Deploy to Vercel

1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Select `house-games` repository
5. Click "Deploy" (settings are auto-detected ✅)
6. Wait 2 minutes → You get a URL!

### 5. Add Your Domain

1. In Vercel: Project → Settings → Domains
2. Add your domain: `yourdomain.com`
3. Vercel shows DNS instructions
4. Add DNS records at your domain registrar
5. Wait 5-60 minutes for DNS
6. ✅ LIVE!

---

## 🎮 That's It!

Your site is now live with:
- Automatic HTTPS
- Global CDN
- Auto-deployments on every push
- Your custom domain

**Total time: ~10 minutes!** 🚀

