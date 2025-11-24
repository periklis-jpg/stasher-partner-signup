# Quick Start Guide - Deploy Your Partner Sign-Up Page

## 🚀 Fastest Way to Go Live (Netlify - 3 minutes, NO GIT REQUIRED)

### Step 1: Prepare Files
Make sure these files are in your project folder:
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `script.js`
- ✅ `netlify/functions/create-affiliate.js`
- ✅ `netlify.toml`
- ✅ Logo images

### Step 2: Deploy to Netlify (Drag & Drop)
1. Go to [netlify.com](https://netlify.com) → Sign up/Login (free)
2. Click **"Add new site"** → **"Deploy manually"**
3. **Drag your entire project folder** onto the deployment area
   - Or click "Browse to upload" and select your folder
4. Wait for deployment to complete
5. Go to **Site settings** → **Environment variables**
6. Click **"Add variable"**:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** Your Tapfiliate API key
7. Go to **Deploys** tab → Click **"Trigger deploy"** → **"Deploy site"**
8. **Done!** 🎉 Your site is live

**Your site URL:** `https://random-name-12345.netlify.app` (Netlify generates a name, you can change it later)

---

## ✅ What Was Fixed

### 1. Secure API Integration
- ✅ API key moved to serverless function (not exposed in frontend)
- ✅ Backend handles all Tapfiliate API calls
- ✅ Proper error handling and validation

### 2. Correct Field Mapping
- ✅ All form fields mapped to Tapfiliate API structure:
  - `firstname`, `lastname`, `email`, `password` → Direct fields
  - `address.city`, `address.country.code` → Nested address object
  - `company.name`, `company.description` → Nested company object
  - `custom_fields["Company type"]` → Custom field
  - `custom_fields["Website"]` → Custom field
  - `custom_fields["Number of Properties"]` → Custom field

### 3. Pending Status (Not Archived)
- ✅ Creates affiliate first
- ✅ Immediately adds affiliate to program
- ✅ Sets `send_welcome_email=false` as requested
- ✅ Affiliate appears in **Pending** status (if program doesn't auto-approve)

### 4. Program IDs
- ✅ USD → `stasher-affiliates-usd`
- ✅ EUR → `stasher-affiliate-program-sp`
- ✅ GBP → `stasher-affiliate-program`
- ✅ AUD → `jg-affiliate-program`

---

## 📋 Important: Tapfiliate Program Settings

**CRITICAL:** To ensure affiliates go to Pending (not auto-approved):

1. Log into Tapfiliate dashboard
2. Go to **Programs** → Select each program (USD, EUR, GBP, AUD)
3. Go to **Settings**
4. Find **"Auto-approve new affiliates"**
5. Make sure it's **DISABLED/OFF** for all programs
6. Save settings

---

## 🔧 Files Created

1. **`netlify/functions/create-affiliate.js`** - Serverless function for Netlify
2. **`vercel/api/create-affiliate.js`** - Serverless function for Vercel
3. **`netlify.toml`** - Netlify configuration
4. **`vercel.json`** - Vercel configuration
5. **`DEPLOYMENT_GUIDE.md`** - Detailed deployment instructions
6. **`.gitignore`** - Prevents committing secrets

---

## 🧪 Testing Checklist

After deployment, test:

- [ ] Fill out complete form
- [ ] Submit form
- [ ] Check browser console (no errors)
- [ ] Verify in Tapfiliate dashboard:
  - [ ] Affiliate appears in **Pending** (not Archived)
  - [ ] All fields populated correctly
  - [ ] Custom field "Company type" shows correct value
  - [ ] Address information is correct
  - [ ] Company details are correct

---

## 💡 GitHub vs No GitHub

### Without GitHub (Drag & Drop):
- ✅ **Faster** - Deploy in 3 minutes
- ✅ **Simpler** - No Git knowledge needed
- ⚠️ **Manual updates** - Need to drag & drop again for changes

### With GitHub:
- ✅ **Automatic updates** - Push code, auto-deploys
- ✅ **Version control** - Track changes
- ✅ **Easier updates** - Just push to GitHub
- ⚠️ **Slightly more setup** - Need Git/GitHub account

**Recommendation:** Start with drag & drop to go live quickly, then connect GitHub later for easier updates.

---

## 🆘 Need Help?

See `DEPLOYMENT_GUIDE.md` for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Alternative deployment options
- Security best practices
