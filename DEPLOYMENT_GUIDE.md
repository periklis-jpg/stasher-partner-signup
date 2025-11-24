# Deployment Guide - Stasher Partner Sign-Up Page

This guide will help you deploy the partner sign-up page and securely integrate it with the Tapfiliate API.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Option 1: Deploy with Netlify](#option-1-deploy-with-netlify)
3. [Option 2: Deploy with Vercel](#option-2-deploy-with-vercel)
4. [Option 3: Deploy with GitHub Pages](#option-3-deploy-with-github-pages)
5. [Setting Up Environment Variables](#setting-up-environment-variables)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A GitHub account (for version control)
- A Netlify or Vercel account (for hosting)
- Your Tapfiliate API key (from https://tapfiliate.com/profile/settings/)
- Your Tapfiliate Program IDs

---

## Option 1: Deploy with Netlify (Recommended)

Netlify is the easiest option for this setup because it has built-in serverless functions.

### Step 1: Prepare Your Files

1. Make sure all your files are in the project folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `netlify/functions/create-affiliate.js`
   - `netlify.toml`
   - Logo images

### Step 2: Deploy to Netlify (Two Options)

#### Option A: Deploy Without GitHub (Fastest - No Git Required)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → **"Deploy manually"** (or drag & drop)
3. **Drag and drop your entire project folder** onto the deployment area
   - Or click "Browse to upload" and select your project folder
4. While it's deploying, go to **Site settings** → **Environment variables**
5. Add environment variable:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your actual Tapfiliate API key
6. Go back to **Deploys** tab → Click **"Trigger deploy"** → **"Deploy site"** (to apply env variable)
7. Done! Your site is live

**Note:** With manual deployment, you'll need to drag & drop again for updates.

#### Option B: Deploy with GitHub (Recommended for Updates)

1. Go to GitHub and create a new repository
2. Initialize git in your project folder:
   ```bash
   cd "/Users/periklis/Desktop/Projects/STASHER - NEW SIGN UP PAGE"
   git init
   git add .
   git commit -m "Initial commit - Partner sign-up page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. Go to [netlify.com](https://netlify.com) and sign up/login
4. Click "Add new site" → "Import an existing project"
5. Connect to GitHub and select your repository

### Step 3: Configure Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Netlify will auto-detect settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (current directory)
5. **Before deploying**, go to "Show advanced" and add environment variable:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your actual Tapfiliate API key
6. Click "Deploy site"

**Note:** If you already deployed (Option A), add the environment variable in Site settings → Environment variables, then trigger a new deploy.

### Step 4: Verify Deployment

1. Your site will be live at: `https://your-site-name.netlify.app`
2. Test the sign-up form to ensure it works

---

## Option 2: Deploy with Vercel

Vercel is another excellent option with serverless functions.

### Step 1: Prepare Your Files

1. Make sure you have:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `vercel/api/create-affiliate.js`
   - `vercel.json`

### Step 2: Deploy to Vercel (Two Options)

#### Option A: Deploy Without GitHub (Using Vercel CLI)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. In your project folder, run:
   ```bash
   cd "/Users/periklis/Desktop/Projects/STASHER - NEW SIGN UP PAGE"
   vercel
   ```

3. Follow the prompts:
   - Link to existing project? No
   - Project name? (press enter for default)
   - Directory? `./` (current directory)

4. After deployment, set environment variable:
   ```bash
   vercel env add TAPFILIATE_API_KEY
   ```
   (Enter your API key when prompted)

5. Redeploy:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy with GitHub

1. Create a GitHub repository and push your code (same as Netlify Step 2B)
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "Add New Project"
4. Import your GitHub repository

### Step 3: Configure Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. **Before deploying**, go to "Environment Variables" and add:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your actual Tapfiliate API key
   - **Environments:** Production, Preview, Development (select all)
6. Click "Deploy"

**Important:** If using Vercel, update `script.js` line 24:
```javascript
const BACKEND_API_URL = '/api/create-affiliate';
```

### Step 4: Verify Deployment

Your site will be live at: `https://your-site-name.vercel.app`

---

## Option 3: Deploy with GitHub Pages (Static Only)

**Note:** GitHub Pages doesn't support serverless functions. You'll need to use a separate backend service or proxy.

### Step 1: Create GitHub Repository

1. Create a new repository on GitHub
2. Push your code (excluding serverless functions)

### Step 2: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Select source branch (usually `main`)
3. Your site will be at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

### Step 3: Set Up Backend Proxy

Since GitHub Pages can't run serverless functions, you have two options:

**Option A:** Use a separate Netlify/Vercel function and point to it:
```javascript
const BACKEND_API_URL = 'https://your-netlify-function.netlify.app/.netlify/functions/create-affiliate';
```

**Option B:** Use a service like [Zapier](https://zapier.com) or [Make.com](https://make.com) to create a webhook that calls Tapfiliate API.

---

## Setting Up Environment Variables

### For Netlify:

1. Go to your site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your Tapfiliate API key
   - **Scopes:** All scopes (or specific ones)
4. Click "Save"
5. Redeploy your site for changes to take effect

### For Vercel:

1. Go to your project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your Tapfiliate API key
   - **Environments:** Production, Preview, Development
4. Click "Save"
5. Redeploy if needed

---

## Testing the Integration

### 1. Test the Form Flow

1. Fill out the complete sign-up form
2. Submit and check browser console for errors
3. Verify you reach the confirmation page

### 2. Verify in Tapfiliate Dashboard

1. Log into your Tapfiliate dashboard
2. Go to **Affiliates** → **Pending**
3. You should see the new affiliate in **Pending** status (not Archived)
4. Verify all fields are correctly populated:
   - Name, email, company name
   - Custom field "Company type"
   - Address information
   - Company details

### 3. Check Serverless Function Logs

**Netlify:**
- Go to **Functions** tab in dashboard
- Click on `create-affiliate`
- View logs for any errors

**Vercel:**
- Go to **Deployments** → Click on latest deployment
- View **Function Logs** tab

---

## Troubleshooting

### Issue: Affiliates appear in Archived instead of Pending

**Solution:**
1. Verify the serverless function is being called (check logs)
2. Ensure `addAffiliateToProgram` is being executed
3. Check that your Tapfiliate program settings have **auto-approval disabled**
   - Go to Tapfiliate → Programs → Your Program → Settings
   - Ensure "Auto-approve new affiliates" is **OFF**

### Issue: API Key errors

**Solution:**
1. Verify environment variable is set correctly
2. Check that variable name matches exactly: `TAPFILIATE_API_KEY`
3. Redeploy after adding environment variables

### Issue: CORS errors

**Solution:**
- The serverless functions already include CORS headers
- If issues persist, check that your domain is allowed in Tapfiliate settings

### Issue: Custom fields not appearing

**Solution:**
1. Verify custom field name matches exactly in Tapfiliate dashboard
2. Go to Tapfiliate → Settings → Onboarding → Custom Fields
3. Ensure "Company type" field exists (case-sensitive)

### Issue: Country code errors

**Solution:**
- The script includes a country ISO mapping
- If a country isn't mapped, it will use the first 2 letters
- You can add more countries to `COUNTRY_ISO_MAP` in `script.js`

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Use environment variables only
   - Add `.env` to `.gitignore` if using local development

2. **Use HTTPS**
   - Both Netlify and Vercel provide HTTPS by default

3. **Validate on Backend**
   - The serverless function validates all required fields
   - Never trust client-side validation alone

4. **Rate Limiting** (Optional)
   - Consider adding rate limiting to prevent abuse
   - Netlify and Vercel have built-in DDoS protection

---

## Next Steps

1. **Custom Domain:** Add your own domain in Netlify/Vercel settings
2. **Analytics:** Add Google Analytics or similar for tracking
3. **Email Notifications:** Set up email alerts for new sign-ups
4. **Testing:** Create test accounts to verify the full flow

---

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check serverless function logs
3. Verify Tapfiliate API key is correct
4. Test API calls directly using Postman or curl

For Tapfiliate API documentation: https://tapfiliate.com/docs/rest/

