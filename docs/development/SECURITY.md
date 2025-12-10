# 🔒 Security Guide

Security best practices for HouseGames project.

## Current Security Status

✅ **Your repository is secure!**

- No hardcoded API keys found
- Environment files properly ignored
- Secrets use environment variables
- No exposed credentials

---

## Security Best Practices

### Environment Variables

✅ **Always use environment variables for secrets:**
- API keys
- Database credentials
- Authentication tokens
- Any sensitive data

**Example:**
```typescript
// ✅ GOOD
const apiKey = process.env.OPENAI_API_KEY;

// ❌ BAD
const apiKey = "sk-1234567890";
```

### Git Configuration

✅ **Ensure these are in `.gitignore`:**
```
.env
.env*.local
.env.production
node_modules
.next
```

✅ **Never commit:**
- `.env` files
- API keys
- Passwords
- Tokens
- Private keys

---

## Deployment Security

### Before Deploying

- [ ] No secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Environment variables set in platform dashboard
- [ ] No hardcoded credentials

### Setting Environment Variables

**Vercel:**
- Project Settings → Environment Variables
- Add variables there (not in code)

**Netlify:**
- Site Settings → Environment Variables
- Add variables there (not in code)

---

## If You Accidentally Commit a Secret

1. **Immediately rotate/revoke the exposed secret**
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (only if you're the only contributor):
   ```bash
   git push origin --force --all
   ```
4. **Add to `.gitignore`** to prevent future commits

---

## Regular Security Checks

### Monthly Checklist

- [ ] Review environment variables in deployment platform
- [ ] Check for new hardcoded secrets
- [ ] Verify `.gitignore` is up to date
- [ ] Review API key usage and rotate if needed
- [ ] Check GitHub repository for exposed secrets

### Before Each Commit

- [ ] No `.env` files in staging
- [ ] No API keys in code
- [ ] No passwords or tokens visible
- [ ] All secrets use environment variables

---

## Environment Variables Reference

### OPENAI_API_KEY

**Purpose:** AI-powered Jeopardy topic generation

**Required:** No (app works without it)

**Security:** Store in platform environment variables, never in code

**How to set:**
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

---

## Public vs Private Repositories

### Public Repository

**Safe if:**
- ✅ No secrets in code
- ✅ Environment variables used
- ✅ `.env` files ignored
- ✅ No hardcoded credentials

**Visible:**
- Source code
- File structure
- Commit history
- Documentation

**Not visible (if secured):**
- Environment variables
- API keys (if in platform, not code)
- Secrets stored in deployment platform

### Private Repository

**Benefits:**
- Code not searchable
- Only you/team can see
- More secure by default

**Considerations:**
- Vercel free tier requires public repos
- Netlify supports private repos for free

See `docs/deployment/DEPLOYMENT.md` for platform options.

---

## Summary

**Your code is secure as long as:**
- ✅ Secrets are in environment variables
- ✅ `.env` files are in `.gitignore`
- ✅ No hardcoded API keys
- ✅ Environment variables set in deployment platform

**You're all good!** 🎉


