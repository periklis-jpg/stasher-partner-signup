# Troubleshooting Guide

## Quick Diagnostic Checklist

### 1. Check Browser Console
1. Open your deployed site
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Fill out and submit the form
5. Look for any **red error messages**

**Common errors:**
- `Failed to fetch` → Backend function not working
- `404 Not Found` → Wrong API endpoint URL
- `CORS error` → Serverless function CORS issue
- `Network error` → Can't reach backend

### 2. Check Serverless Function Logs

#### For Netlify:
1. Go to Netlify dashboard
2. Click on your site
3. Go to **Functions** tab
4. Click on `create-affiliate`
5. Check **Logs** for errors

#### For Vercel:
1. Go to Vercel dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on latest deployment
5. Go to **Function Logs** tab

**Look for:**
- `TAPFILIATE_API_KEY is undefined` → Environment variable not set
- `401 Unauthorized` → Wrong API key
- `400 Bad Request` → Invalid data format
- `404 Not Found` → Wrong Tapfiliate endpoint

### 3. Verify Environment Variable

#### Netlify:
1. Site settings → Environment variables
2. Check `TAPFILIATE_API_KEY` exists
3. Value should be: `0dc9240a6a10036f9a275537b52be14f5e551e12`
4. If missing, add it and **redeploy**

#### Vercel:
1. Settings → Environment Variables
2. Check `TAPFILIATE_API_KEY` exists
3. Value should be: `0dc9240a6a10036f9a275537b52be14f5e551e12`
4. If missing, add it and **redeploy**

### 4. Test the Serverless Function Directly

You can test if the function works by calling it directly:

**For Netlify:**
```
https://your-site-name.netlify.app/.netlify/functions/create-affiliate
```

**For Vercel:**
```
https://your-site-name.vercel.app/api/create-affiliate
```

**Test with curl (in terminal):**
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/create-affiliate \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "password": "test123",
    "program_id": "stasher-affiliate-program"
  }'
```

**Expected response:**
- Success: `{"success": true, "affiliate": {...}}`
- Error: `{"error": "..."}`

---

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or Network Error

**Cause:** Backend function not deployed or wrong URL

**Solution:**
1. Check if serverless function file exists: `netlify/functions/create-affiliate.js`
2. Verify deployment includes the function
3. Check function logs in dashboard
4. Make sure URL in `script.js` matches your platform:
   - Netlify: `/.netlify/functions/create-affiliate`
   - Vercel: `/api/create-affiliate`

### Issue 2: "TAPFILIATE_API_KEY is undefined"

**Cause:** Environment variable not set or not accessible

**Solution:**
1. Go to hosting platform dashboard
2. Add environment variable `TAPFILIATE_API_KEY`
3. **Redeploy** the site (important!)
4. Check function logs to verify it's reading the variable

### Issue 3: "401 Unauthorized" from Tapfiliate

**Cause:** Wrong API key or API key not being sent

**Solution:**
1. Verify API key is correct: `0dc9240a6a10036f9a275537b52be14f5e551e12`
2. Check it's set in environment variables
3. Check function logs to see if key is being used
4. Test API key directly with Tapfiliate API

### Issue 4: Affiliates Still Going to Archived

**Cause:** Not adding affiliate to program, or program auto-approves

**Solution:**
1. Check function logs - should see two API calls:
   - `POST /affiliates/` (create)
   - `POST /programs/{id}/affiliates/` (add to program)
2. Verify program settings in Tapfiliate:
   - Go to Program → Settings
   - **Disable** "Auto-approve new affiliates"
3. Check `send_welcome_email=false` is in the URL

### Issue 5: Custom Fields Not Appearing

**Cause:** Custom field doesn't exist in Tapfiliate or wrong name

**Solution:**
1. Go to Tapfiliate → Settings → Onboarding → Custom Fields
2. Create field: **"Company type"** (exact name, case-sensitive)
3. Optional fields: **"Website"**, **"Number of Properties"**
4. Redeploy after creating fields

### Issue 6: CORS Errors

**Cause:** Serverless function not sending CORS headers

**Solution:**
- The function already includes CORS headers
- If still getting errors, check function is deployed correctly
- Make sure you're accessing from the correct domain

---

## Step-by-Step Debugging

### Step 1: Test Locally (Optional)

If using Netlify CLI:
```bash
npm install -g netlify-cli
cd "/Users/periklis/Desktop/Projects/STASHER - NEW SIGN UP PAGE"
netlify dev
```

This runs locally and you can test the function at:
`http://localhost:8888/.netlify/functions/create-affiliate`

### Step 2: Check Function Deployment

1. Go to hosting dashboard
2. Check **Functions** or **API Routes** section
3. Verify `create-affiliate` function is listed
4. If missing, check file structure:
   - Netlify: `netlify/functions/create-affiliate.js`
   - Vercel: `vercel/api/create-affiliate.js`

### Step 3: Test with Minimal Data

Try submitting form with just required fields:
- First Name
- Last Name
- Email
- Password
- Program selection
- Company Type

See if it works, then add optional fields.

### Step 4: Check Tapfiliate Dashboard

1. Log into Tapfiliate
2. Go to **Affiliates**
3. Check **Pending**, **Archived**, and **All** tabs
4. See if affiliate was created (even if in wrong status)

---

## Still Not Working?

### Get More Info:

1. **Browser Console Errors** - Copy exact error message
2. **Function Logs** - Copy error from serverless function
3. **Network Tab** - Check the actual request/response
   - F12 → Network tab
   - Submit form
   - Click on the request to `create-affiliate`
   - Check Request payload and Response

### Share These Details:

- What error message do you see?
- Where does it fail? (Browser console? Function logs?)
- What happens when you submit the form?
- Do you see the affiliate in Tapfiliate at all?

---

## Quick Fixes to Try

1. **Redeploy** - Sometimes fixes deployment issues
2. **Clear browser cache** - Old JavaScript might be cached
3. **Check file structure** - Make sure all files are in the right place
4. **Verify environment variable** - Double-check it's set correctly
5. **Test in incognito mode** - Rules out browser extensions

---

## Emergency Fallback

If nothing works, you can temporarily test with the API key in the function (ONLY for testing, remove before going live):

**In `netlify/functions/create-affiliate.js`:**
```javascript
const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY || '0dc9240a6a10036f9a275537b52be14f5e551e12';
```

**⚠️ REMOVE THIS BEFORE COMMITTING TO GIT!**

This is just to test if the function works. Once confirmed, remove the fallback and use only environment variables.

