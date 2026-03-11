# Fix CORS and 403 Error - Step by Step

## The Problem
- **403 Forbidden**: API Gateway is blocking the request (auth/key/policy issue)
- **CORS Error**: Even if Lambda works, API Gateway isn't sending CORS headers on errors

## Fix Both Issues

---

## Fix #1: Stop the 403 Error

### Step 1: Check Authorization Settings

1. Go to: https://console.aws.amazon.com/apigateway
2. Click your API: `createAffiliateAPI`
3. Click `/create-affiliate` → `POST` method
4. Look at the right side panel - find **"Authorization"**
5. **It MUST say "NONE"** (not AWS_IAM, not Cognito, not Lambda Authorizer)

**If it's NOT "NONE":**
- Click "Authorization" dropdown
- Select **"NONE"**
- Click the checkmark ✓ to save

### Step 2: Check API Key Requirement

1. Still on the POST method page
2. Look for **"API Key Required"** 
3. **It MUST be unchecked** (not required)

**If it's checked:**
- Uncheck "API Key Required"
- Click the checkmark ✓ to save

### Step 3: Enable Lambda Proxy Integration

1. Still on POST method page
2. Click **"Integration Request"** (left side)
3. Scroll down to find **"Use Lambda Proxy Integration"**
4. **Check this box** ✓
5. Click **"Save"** (bottom)
6. Click **"OK"** when it asks about permissions

This ensures Lambda's CORS headers get passed through to the browser.

---

## Fix #2: Enable CORS in API Gateway

### Step 1: Enable CORS on the Resource

1. In API Gateway, click `/create-affiliate` resource (not the method, the resource itself)
2. Click **"Actions"** → **"Enable CORS"**
3. Fill in:
   - **Access-Control-Allow-Origin**: `https://main.d25rh27ub8s1lh.amplifyapp.com`
     - Or use `*` for testing (less secure but works for now)
   - **Access-Control-Allow-Headers**: `Content-Type,Authorization,X-Requested-With`
   - **Access-Control-Allow-Methods**: `POST,OPTIONS`
   - Leave everything else as default
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"**

### Step 2: Add OPTIONS Method (if missing)

1. Click `/create-affiliate` resource
2. Click **"Actions"** → **"Create Method"**
3. Choose **"OPTIONS"** from dropdown
4. Click checkmark ✓
5. Choose:
   - Integration type: **"Mock"**
6. Click **"Save"**
7. Click **"Integration Response"**
8. Under "Method Response", make sure status 200 is selected
9. Click **"Actions"** → **"Enable CORS"** (same settings as above)
10. Click **"Enable CORS"** → **"Yes, replace existing values"**

### Step 3: Add CORS Headers to Error Responses

This is CRITICAL - errors need CORS headers too!

1. In API Gateway, click your API name (`createAffiliateAPI`) in the left sidebar
2. Click **"Gateway Responses"** (left sidebar, under your API name)
3. Click **"DEFAULT_4XX"**
4. Click **"Gateway Response Headers"** tab
5. Click **"Add Header"** and add these one by one:

   **Header 1:**
   - Name: `Access-Control-Allow-Origin`
   - Value: `https://main.d25rh27ub8s1lh.amplifyapp.com` (or `*`)

   **Header 2:**
   - Name: `Access-Control-Allow-Headers`
   - Value: `Content-Type,Authorization,X-Requested-With`

   **Header 3:**
   - Name: `Access-Control-Allow-Methods`
   - Value: `POST,OPTIONS`

6. Click **"Save"**

7. Repeat for **"DEFAULT_5XX"**:
   - Click "DEFAULT_5XX"
   - Click "Gateway Response Headers" tab
   - Add the same 3 headers
   - Click "Save"

---

## Fix #3: Deploy the API

**CRITICAL:** After making any changes, you MUST deploy:

1. Click **"Actions"** → **"Deploy API"**
2. Choose:
   - Deployment stage: `prod` (the one you created earlier)
3. Click **"Deploy"**

**Wait 1-2 minutes** for changes to propagate.

---

## Fix #4: Verify Lambda Function Has CORS

The Lambda function already has CORS headers, but let's verify it handles all cases:

The function should return headers like this on ALL responses (success and error):

```javascript
headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
}
```

Your Lambda function already does this! ✅

---

## Test After Fixing

1. Wait 2 minutes after deploying
2. Go to your Amplify website
3. Open browser DevTools → Network tab
4. Try submitting the form
5. Click on the POST request to `/create-affiliate`
6. Check:
   - **Status should NOT be 403** (should be 200 or 500 with CORS headers)
   - **Response Headers** should include `Access-Control-Allow-Origin`

---

## Quick Checklist

Before testing, verify:

- [ ] POST method: Authorization = **NONE**
- [ ] POST method: API Key Required = **unchecked**
- [ ] POST method: Lambda Proxy Integration = **checked** ✓
- [ ] Resource `/create-affiliate`: CORS enabled
- [ ] OPTIONS method exists and has CORS
- [ ] Gateway Responses DEFAULT_4XX: Has CORS headers
- [ ] Gateway Responses DEFAULT_5XX: Has CORS headers
- [ ] API deployed to `prod` stage

---

## If Still Not Working

1. **Check CloudWatch Logs:**
   - Go to Lambda Console → `createAffiliate` function
   - Click "Monitor" → "View logs in CloudWatch"
   - See if Lambda is being called (if not, API Gateway is blocking it)

2. **Test with curl (bypasses CORS):**
   ```bash
   curl -X POST https://3cw7ssdjuh.execute-api.eu-north-1.amazonaws.com/prod/create-affiliate \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}'
   ```
   - If this works, it's a CORS issue
   - If this gives 403, it's an auth/policy issue

3. **Check Resource Policy:**
   - API Gateway → Your API → Settings
   - Look for "Resource Policy"
   - If there's a policy, it might be blocking requests

---

## Summary

The 403 is likely because:
- Authorization is not set to NONE, OR
- API Key is required, OR
- Lambda Proxy Integration is not enabled

The CORS error is because:
- CORS not enabled on resource, OR
- Gateway Responses (4XX/5XX) don't have CORS headers

Fix all of the above, deploy, wait 2 minutes, then test!

