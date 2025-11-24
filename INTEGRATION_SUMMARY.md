# Tapfiliate Integration Summary

## ✅ What Has Been Fixed

### 1. Secure API Integration
- ✅ **API key moved to serverless function** - Never exposed in client-side JavaScript
- ✅ **Backend endpoint** handles all Tapfiliate API calls
- ✅ **CORS headers** properly configured
- ✅ **Error handling** with user-friendly messages

### 2. Correct Field Mapping to Tapfiliate API

All form fields are now correctly mapped:

| Form Field | Tapfiliate API Field | Location |
|------------|---------------------|----------|
| First Name | `firstname` | Request body |
| Last Name | `lastname` | Request body |
| Email | `email` | Request body |
| Password | `password` | Request body |
| City | `address.city` | Nested in `address` object |
| Country | `address.country.code` | Nested in `address` object (ISO code) |
| Company Name | `company.name` | Nested in `company` object |
| Company Description | `company.description` | Nested in `company` object |
| Company Type | `custom_fields["Company type"]` | Custom field |
| Company Website | `custom_fields["Website"]` | Custom field |
| Number of Properties | `custom_fields["Number of Properties"]` | Custom field |
| Program | `program_id` | Used for enrollment endpoint |

### 3. Pending Status (Not Archived)

**How it works:**
1. ✅ Creates affiliate via `POST /affiliates/`
2. ✅ Immediately calls `POST /programs/{program_id}/affiliates/` with `send_welcome_email=false`
3. ✅ Affiliate appears in **Pending** status (if program doesn't auto-approve)

**Important:** Make sure in Tapfiliate dashboard:
- Go to each Program → Settings
- **Disable "Auto-approve new affiliates"**
- This ensures affiliates go to Pending, not Approved

### 4. Program IDs Configured

```javascript
const PROGRAM_ID_MAP = {
    'USD': 'stasher-affiliates-usd',
    'EUR': 'stasher-affiliate-program-sp',
    'GBP': 'stasher-affiliate-program',
    'AUD': 'jg-affiliate-program'
};
```

### 5. Country ISO Code Mapping

- ✅ Full country name → ISO 3166-1 alpha-2 code conversion
- ✅ Example: "United States" → "US", "United Kingdom" → "GB"
- ✅ Fallback: Uses first 2 letters if country not in map

---

## 📁 Files Created/Modified

### New Files:
1. **`netlify/functions/create-affiliate.js`** - Netlify serverless function
2. **`vercel/api/create-affiliate.js`** - Vercel serverless function
3. **`netlify.toml`** - Netlify configuration
4. **`vercel.json`** - Vercel configuration
5. **`package.json`** - Node.js package file
6. **`.gitignore`** - Prevents committing secrets
7. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide
8. **`QUICK_START.md`** - 5-minute quick start guide
9. **`INTEGRATION_SUMMARY.md`** - This file

### Modified Files:
1. **`script.js`** - Updated to use backend endpoint, correct field mapping
2. **`README.md`** - Updated with new setup instructions

---

## 🔐 Security Improvements

### Before:
- ❌ API key exposed in client-side JavaScript
- ❌ Anyone could view source and steal API key
- ❌ No server-side validation

### After:
- ✅ API key stored as environment variable (never in code)
- ✅ All API calls go through secure serverless function
- ✅ Backend validates all data before sending to Tapfiliate
- ✅ Proper error handling without exposing sensitive info

---

## 🚀 Deployment Options

### Option 1: Netlify (Recommended - Easiest)
- ✅ Built-in serverless functions
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable setup

**See:** `DEPLOYMENT_GUIDE.md` → Option 1

### Option 2: Vercel
- ✅ Excellent serverless functions
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Great developer experience

**See:** `DEPLOYMENT_GUIDE.md` → Option 2

### Option 3: GitHub Pages + Separate Backend
- ⚠️ Requires separate backend service
- ✅ Free static hosting
- ⚠️ More complex setup

**See:** `DEPLOYMENT_GUIDE.md` → Option 3

---

## 🧪 Testing Checklist

After deployment:

- [ ] Fill out complete sign-up form
- [ ] Submit form (skip demo call)
- [ ] Check browser console - no errors
- [ ] Verify in Tapfiliate dashboard:
  - [ ] Affiliate appears in **Pending** (not Archived)
  - [ ] All personal info correct (name, email)
  - [ ] Address information correct (city, country)
  - [ ] Company information correct
  - [ ] Custom field "Company type" populated
  - [ ] Custom field "Website" populated (if provided)
  - [ ] Custom field "Number of Properties" populated (if provided)
  - [ ] Affiliate is in correct program (USD/EUR/GBP/AUD)

---

## 📝 API Request Examples

### Request to Backend (from frontend):
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "address": {
    "address": "N/A",
    "postal_code": "N/A",
    "city": "London",
    "country": {
      "code": "GB"
    }
  },
  "company": {
    "name": "Example Company",
    "description": "A great company"
  },
  "custom_fields": {
    "Company type": "Vacation Rental / STR / Airbnb Host",
    "Website": "https://example.com",
    "Number of Properties": "5"
  },
  "program_id": "stasher-affiliate-program"
}
```

### Backend calls Tapfiliate:
1. `POST https://api.tapfiliate.com/1.6/affiliates/` (creates affiliate)
2. `POST https://api.tapfiliate.com/1.6/programs/stasher-affiliate-program/affiliates/?send_welcome_email=false` (adds to program)

---

## ⚠️ Important Notes

1. **Custom Fields Must Exist**: Create "Company type" custom field in Tapfiliate dashboard before deploying
2. **Auto-Approval Must Be Off**: Disable auto-approval in all programs to get Pending status
3. **Environment Variable**: Set `TAPFILIATE_API_KEY` in your hosting platform
4. **Test First**: Always test with a test email before going live

---

## 🆘 Troubleshooting

### Affiliates still going to Archived?
- Check serverless function logs
- Verify `addAffiliateToProgram` is being called
- Check program auto-approval settings in Tapfiliate

### Custom fields not showing?
- Verify field name matches exactly (case-sensitive)
- Check field exists in Tapfiliate → Settings → Custom Fields

### API errors?
- Check environment variable is set correctly
- Verify API key is valid
- Check serverless function logs

See `DEPLOYMENT_GUIDE.md` for more troubleshooting tips.

