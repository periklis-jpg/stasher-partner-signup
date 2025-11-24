# ⚠️ EMERGENCY SETUP - Temporary API Key in Code

## ⚠️ WARNING: SECURITY RISK
**This is ONLY for testing! Remove before going live!**

If you absolutely cannot set environment variables right now, you can temporarily hardcode the API key in the serverless function.

## ⚠️ DO NOT COMMIT THIS TO GIT!

---

## For Netlify Function

**File:** `netlify/functions/create-affiliate.js`

**Change line 4 from:**
```javascript
const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY;
```

**To:**
```javascript
const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY || '0dc9240a6a10036f9a275537b52be14f5e551';
```

**Then redeploy** (drag & drop your folder to Netlify again).

---

## For Vercel Function

**File:** `vercel/api/create-affiliate.js`

**Change line 19 from:**
```javascript
const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY;
```

**To:**
```javascript
const TAPFILIATE_API_KEY = process.env.TAPFILIATE_API_KEY || '0dc9240a6a10036f9a275537b52be14f5e551';
```

**Then redeploy** (run `vercel --prod`).

---

## ⚠️ IMPORTANT REMINDERS

1. **This is TEMPORARY** - Only for testing
2. **Remove the fallback** before going live
3. **DO NOT commit to Git** - Add to `.gitignore` or remove before pushing
4. **Set environment variable properly** as soon as possible

---

## After Testing - Remove the Fallback

Once you confirm it works:

1. **Remove the fallback** (the `|| '0dc9240a6a10036f9a275537b52be14f5e551'` part)
2. **Set environment variable** in your hosting platform
3. **Redeploy**

---

## The RIGHT Way (Recommended)

Instead of hardcoding, set it as an environment variable:

### Netlify:
1. Dashboard → Site settings → Environment variables
2. Add: `TAPFILIATE_API_KEY` = `0dc9240a6a10036f9a275537b52be14f5e551`
3. Redeploy

### Vercel:
1. Dashboard → Settings → Environment Variables
2. Add: `TAPFILIATE_API_KEY` = `0dc9240a6a10036f9a275537b52be14f5e551`
3. Save (auto-redeploys)

