# 🤖 Automated Deployment Checker

The automated deployment checker monitors your GitHub Pages deployments and automatically fixes common issues.

## ✨ Features

- **Automatic Monitoring**: Runs after every deployment completes
- **Health Checks**: Verifies your website is accessible and responding correctly
- **Auto-Fix**: Automatically retries failed deployments and handles common issues
- **Status Reports**: Creates detailed reports of deployment status
- **Scheduled Checks**: Runs every 6 hours to ensure your site stays healthy
- **Issue Creation**: Creates GitHub issues if deployment problems persist

## 🔄 How It Works

### Automatic Triggers

The checker runs automatically in these scenarios:

1. **After Deployment**: When the "Deploy to GitHub Pages" workflow completes
2. **Scheduled**: Every 6 hours to check site health
3. **Manual**: Can be triggered manually from the Actions tab

### What It Checks

1. **Deployment Status**: Verifies the GitHub Pages deployment status
2. **GitHub Pages Configuration**: Ensures Pages is configured correctly
3. **Website Accessibility**: Tests if your site is actually accessible via HTTP
4. **Workflow Status**: Checks if the build/deploy workflow completed successfully

### Auto-Fix Capabilities

The checker can automatically fix these issues:

- ✅ **Failed Workflows**: Automatically re-triggers failed deployments
- ✅ **404 Errors**: Waits for propagation and re-checks (common after deployment)
- ✅ **Connection Issues**: Detects and reports DNS/network problems

## 📊 Status Reports

After each check, the workflow creates a detailed status report that includes:

- Deployment status from GitHub
- Website accessibility test results
- Workflow run status
- Any auto-fix attempts made
- Recommendations for next steps

The report is saved as an artifact and can be downloaded from the Actions tab.

## 🚨 Error Handling

### If Deployment Fails

1. The checker detects the failure
2. Automatically attempts to re-trigger the deployment
3. Creates a GitHub issue if the problem persists
4. Provides detailed error information

### If Website is Inaccessible

1. The checker waits for propagation (up to 60 seconds)
2. Re-tests the website
3. Reports the issue if it persists
4. Creates a GitHub issue for manual review

## 📝 Viewing Results

### In GitHub Actions

1. Go to your repository → **Actions** tab
2. Look for **"Check Deployment Status"** workflow
3. Click on a run to see detailed logs
4. Download the status report artifact

### Status Report Artifact

Each check creates an artifact named `deployment-status-report` containing:
- Full status report in Markdown format
- All test results
- Auto-fix attempts
- Recommendations

## 🔧 Configuration

The checker automatically detects:
- Custom domain from `public/CNAME` file
- GitHub Pages URL from repository name
- Deployment status from GitHub API

No additional configuration needed!

## 🎯 Benefits

- **No Manual Checking**: You don't need to manually verify deployments
- **Faster Issue Detection**: Problems are caught immediately
- **Automatic Recovery**: Common issues are fixed automatically
- **Better Visibility**: Clear status reports and notifications
- **Peace of Mind**: Know your site is always working

## 📚 Related Documentation

- [GitHub Pages Deployment Guide](GITHUB_PAGES.md)
- [Troubleshooting Guide](TROUBLESHOOTING_404.md)
- [Deployment Overview](../DEPLOYMENT.md)

---

**You no longer need to manually check if your deployment worked!** 🎉

The automated checker handles it all for you.
