# How to Set Your Tapfiliate API Key

## ⚠️ SECURITY WARNING
**NEVER put your API key in code files or commit it to Git!**

**Your API key should ONLY be set as an environment variable in your hosting platform.**

Get your API key from: https://tapfiliate.com/profile/settings/

---

## For Netlify (Recommended)

### After Deploying Your Site:

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add variable"**
5. Enter:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** `YOUR_API_KEY_HERE` (paste your actual API key from Tapfiliate)
   - **Scopes:** All scopes (or select Production, Preview, Development)
6. Click **"Save"**
7. Go to **Deploys** tab
8. Click **"Trigger deploy"** → **"Deploy site"** (to apply the new environment variable)

**That's it!** The serverless function will now use this key securely.

---

## For Vercel

### After Deploying Your Site:

1. Go to your Vercel dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** `YOUR_API_KEY_HERE` (paste your actual API key from Tapfiliate)
   - **Environments:** Select all (Production, Preview, Development)
6. Click **"Save"**
7. The site will automatically redeploy with the new variable

---

## Verify It's Working

1. Fill out and submit the sign-up form
2. Check the browser console (F12) - should see no errors
3. Check your Tapfiliate dashboard:
   - Go to **Affiliates** → **Pending**
   - You should see the new affiliate

---

## What Happens Behind the Scenes

1. Your frontend (`script.js`) sends form data to: `/.netlify/functions/create-affiliate`
2. The serverless function (`netlify/functions/create-affiliate.js`) reads `process.env.TAPFILIATE_API_KEY`
3. It uses this key to call the Tapfiliate API
4. The key is **never exposed** to the browser or client-side code

---

## Troubleshooting

### API calls failing?
- ✅ Check environment variable is set correctly
- ✅ Check variable name is exactly: `TAPFILIATE_API_KEY` (case-sensitive)
- ✅ Redeploy after adding the variable
- ✅ Check serverless function logs in Netlify/Vercel dashboard

### Still not working?
- Check the function logs for error messages
- Verify the API key is correct in Tapfiliate dashboard
- Make sure you redeployed after adding the environment variable

