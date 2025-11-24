# Quick Fix Guide - "Nothing Works"

## Immediate Steps to Debug

### Step 1: Check What's Actually Happening

1. **Open your deployed site**
2. **Press F12** (open browser console)
3. **Go to Console tab**
4. **Fill out and submit the form**
5. **Look for red error messages** - copy them exactly

### Step 2: Check Serverless Function

#### If using Netlify:
1. Go to Netlify dashboard
2. Click your site
3. Go to **Functions** tab
4. Click on `create-affiliate`
5. Check **Logs** - look for errors

#### If using Vercel:
1. Go to Vercel dashboard
2. Click your project
3. Go to **Deployments**
4. Click latest deployment
5. Go to **Function Logs** tab

### Step 3: Most Common Issues

#### Issue A: "Failed to fetch" or Network Error
**Problem:** Backend function not working or wrong URL

**Quick Fix:**
1. Check if you deployed the function file:
   - Netlify: `netlify/functions/create-affiliate.js` must exist
   - Vercel: `vercel/api/create-affiliate.js` must exist
2. Check the URL in `script.js` line 24:
   - Netlify: Should be `/.netlify/functions/create-affiliate`
   - Vercel: Should be `/api/create-affiliate`
3. **Redeploy** your site

#### Issue B: "TAPFILIATE_API_KEY is undefined"
**Problem:** Environment variable not set

**Quick Fix:**
1. Go to hosting dashboard
2. Add environment variable:
   - **Key:** `TAPFILIATE_API_KEY`
   - **Value:** `0dc9240a6a10036f9a275537b52be14f5e551e12`
3. **IMPORTANT:** Redeploy after adding!
4. Check function logs to verify

#### Issue C: "401 Unauthorized"
**Problem:** Wrong API key or not being sent

**Quick Fix:**
1. Verify API key is correct: `0dc9240a6a10036f9a275537b52be14f5e551e12`
2. Check it's set in environment variables
3. Test API key directly:
   ```bash
   curl -X GET https://api.tapfiliate.com/1.6/programs/ \
     -H "Api-Key: 0dc9240a6a10036f9a275537b52be14f5e551e12"
   ```
   Should return your programs list

#### Issue D: Form submits but nothing happens
**Problem:** JavaScript error or backend not responding

**Quick Fix:**
1. Check browser console for errors
2. Check Network tab (F12 → Network):
   - Submit form
   - Look for request to `create-affiliate`
   - Check if it returns 200 or error
3. Check function logs

---

## Emergency Test: Bypass Backend (Temporary)

If you need to test if the form works without the backend:

**⚠️ ONLY FOR TESTING - Remove before going live!**

In `script.js`, temporarily change `handleSkipDemo()`:

```javascript
async function handleSkipDemo() {
    // TEMPORARY: Just show confirmation without API call
    console.log('Form data:', formState);
    showConfirmationPage();
}
```

This will let you test the form flow. Then restore the original function.

---

## Still Stuck? Share These Details:

1. **What error message?** (exact text from console)
2. **Where?** (browser console? function logs?)
3. **What happens?** (form submits? nothing? error page?)
4. **Which platform?** (Netlify? Vercel?)
5. **Did you set environment variable?** (yes/no)
6. **Did you redeploy after setting it?** (yes/no)

---

## Most Likely Fixes (Try These First):

1. ✅ **Set environment variable** `TAPFILIATE_API_KEY` in dashboard
2. ✅ **Redeploy** after setting environment variable
3. ✅ **Check function logs** for specific error
4. ✅ **Verify file structure** - function file in correct location
5. ✅ **Clear browser cache** - might be using old JavaScript

