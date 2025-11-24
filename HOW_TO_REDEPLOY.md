# How to Redeploy Your Site

## 🚀 Quick Redeploy Guide

### For Netlify (Drag & Drop Method)

If you deployed by dragging and dropping your folder:

1. **Go to Netlify dashboard**: [app.netlify.com](https://app.netlify.com)
2. **Click on your site**
3. **Go to "Deploys" tab** (top menu)
4. **Click "Trigger deploy"** button (top right)
5. **Select "Deploy site"**
6. **Drag and drop your project folder again**
7. **Wait for deployment to complete** (usually 30-60 seconds)

**That's it!** Your site is redeployed.

---

### For Netlify (GitHub Method)

If you connected your site to GitHub:

1. **Make changes to your files** (if needed)
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update files"
   git push
   ```
3. **Netlify automatically redeploys** when you push to GitHub
4. **Or manually trigger**: Netlify dashboard → Deploys → Trigger deploy

---

### For Vercel (CLI Method)

If you deployed using Vercel CLI:

1. **In your project folder, run**:
   ```bash
   cd "/Users/periklis/Desktop/Projects/STASHER - NEW SIGN UP PAGE"
   vercel --prod
   ```

**That's it!** Your site is redeployed.

---

### For Vercel (GitHub Method)

If you connected your site to GitHub:

1. **Make changes to your files** (if needed)
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update files"
   git push
   ```
3. **Vercel automatically redeploys** when you push to GitHub

---

## ⚠️ Important: After Setting Environment Variables

**You MUST redeploy after adding/changing environment variables!**

### Netlify:
1. Set environment variable (Site settings → Environment variables)
2. Go to **Deploys** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Select **"Clear cache and deploy site"** (recommended)

### Vercel:
1. Set environment variable (Settings → Environment Variables)
2. Vercel **automatically redeploys** when you save
3. Or manually: Deployments → Click "..." → Redeploy

---

## 🔍 How to Know if Redeploy Worked

1. **Check deployment status**:
   - Netlify: Deploys tab shows "Published" (green)
   - Vercel: Deployments shows "Ready" (green checkmark)

2. **Visit your site** and check:
   - Does it load?
   - Try submitting the form
   - Check browser console (F12) for errors

3. **Check function logs**:
   - Netlify: Functions → create-affiliate → Logs
   - Vercel: Deployments → Function Logs

---

## 📝 Step-by-Step: Redeploy After Setting API Key

### Netlify:

1. **Set the environment variable**:
   - Site settings → Environment variables
   - Add: `TAPFILIATE_API_KEY` = `0dc9240a6a10036f9a275537b52be14f5e551e12`
   - Click "Save"

2. **Redeploy**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** (top right)
   - Click **"Deploy site"**
   - **OR** drag & drop your folder again

3. **Wait** for deployment to finish (30-60 seconds)

4. **Test** your form

### Vercel:

1. **Set the environment variable**:
   - Settings → Environment Variables
   - Add: `TAPFILIATE_API_KEY` = `0dc9240a6a10036f9a275537b52be14f5e551e12`
   - Select all environments (Production, Preview, Development)
   - Click "Save"

2. **Vercel automatically redeploys** (or manually trigger from Deployments)

3. **Wait** for deployment to finish

4. **Test** your form

---

## 🆘 Troubleshooting Redeploy

### "Deployment failed"
- Check the error message in the deployment log
- Common issues:
  - Missing files
  - Syntax errors in code
  - Build errors

### "Function not found"
- Make sure `netlify/functions/create-affiliate.js` exists
- Check file structure is correct

### "Environment variable not working"
- Make sure you **redeployed after setting it**
- Check variable name is exactly: `TAPFILIATE_API_KEY` (case-sensitive)
- Check function logs to see if it's reading the variable

---

## 💡 Pro Tips

1. **Always redeploy after**:
   - Setting/changing environment variables
   - Updating serverless function code
   - Changing configuration files

2. **Clear cache** (Netlify):
   - When redeploying, select "Clear cache and deploy site"

3. **Check logs**:
   - Always check function logs after redeploy to verify it's working

4. **Test immediately**:
   - After redeploy, test the form right away
   - Check browser console for errors

