# 🔧 Custom Domain DNS Configuration for GitHub Pages

Quick reference guide for configuring DNS for `housegames.club` on GitHub Pages.

## 📋 Required DNS Records

### For Root Domain (housegames.club)

Add **4 A records** at your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

**Important:** You must add all 4 A records. GitHub Pages uses multiple IP addresses for load balancing.

### For WWW Subdomain (www.housegames.club) - Optional

If you want `www.housegames.club` to work:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

Replace `YOUR_USERNAME` with your GitHub username.

## 🎯 Step-by-Step Instructions

### 1. Find Your Domain Registrar

Where did you buy `housegames.club`? Common registrars:
- Namecheap
- GoDaddy
- Cloudflare
- Google Domains
- Name.com
- Hover

### 2. Access DNS Settings

Log in to your domain registrar and find:
- "DNS Management"
- "DNS Settings"
- "Advanced DNS"
- "DNS Records"

### 3. Add A Records

1. Click "Add Record" or "Add DNS Record"
2. Select type: **A**
3. Name/Host: `@` (or leave blank, or `housegames.club`)
4. Value/IP: `185.199.108.153`
5. TTL: `3600` (or default)
6. Save

**Repeat this 3 more times** with these IPs:
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

### 4. Remove Conflicting Records

Delete any existing A records or CNAME records for:
- `@` (root domain)
- `housegames.club`

### 5. Verify DNS Propagation

Wait 5-60 minutes, then check:

**Online Tools:**
- [whatsmydns.net](https://www.whatsmydns.net/#A/housegames.club)
- [dnschecker.org](https://dnschecker.org/#A/housegames.club)

**Command Line:**
```bash
# Windows
nslookup housegames.club

# Mac/Linux
dig housegames.club
```

You should see the 4 GitHub Pages IP addresses.

### 6. Verify in GitHub

1. Go to repository → **Settings** → **Pages**
2. Click **"Check again"** button
3. Should show: ✅ "DNS check successful"

### 7. Enable HTTPS

1. Once DNS is verified, check **"Enforce HTTPS"**
2. Wait 5-10 minutes for SSL certificate
3. Your site is live at `https://housegames.club`! 🎉

## 🔍 Common Issues

### "DNS check unsuccessful"

**Causes:**
- DNS records not added yet
- Wrong IP addresses
- Not all 4 A records added
- DNS propagation still in progress

**Solutions:**
- Wait 30-60 minutes for propagation
- Verify all 4 A records are added
- Check DNS using online tools
- Remove any conflicting records

### "Domain does not resolve to GitHub Pages server"

**Causes:**
- DNS records pointing to wrong IPs
- Missing A records
- CNAME record on root domain (not allowed)

**Solutions:**
- Verify IP addresses are correct
- Ensure all 4 A records are present
- Remove CNAME records from root domain

### HTTPS Not Available

**Causes:**
- DNS not verified yet
- SSL certificate provisioning in progress

**Solutions:**
- Wait for DNS verification
- Wait 5-10 minutes after DNS verification
- Check again later

## 📞 Need Help?

1. **Check DNS propagation:** Use [whatsmydns.net](https://www.whatsmydns.net)
2. **Verify records:** Make sure all 4 A records are present
3. **Wait longer:** DNS can take up to 24 hours
4. **Contact support:** Your domain registrar's support team

---

**Once DNS is configured correctly, your site will be live at `https://housegames.club`!** 🚀







