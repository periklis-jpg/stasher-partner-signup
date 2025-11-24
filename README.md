# Stasher Partner Sign-Up Page

A professional, multi-step partner sign-up form integrated with Tapfiliate API.

## Features

- **5-Step Sign-Up Process**: Guided form with progress indicator
- **Conditional Logic**: Different fields based on company type
- **Tapfiliate Integration**: Automatic affiliate creation and program assignment
- **Responsive Design**: Works on desktop and mobile devices
- **Professional UI**: Clean, modern design matching Stasher brand

## Setup Instructions

### ⚠️ IMPORTANT: Secure API Configuration

**DO NOT put your API key in `script.js`!** The API key is now handled securely via serverless functions.

### 1. Tapfiliate API Configuration

1. **Get your API Key**:
   - Log in to your Tapfiliate account
   - Go to Profile Settings → API Key
   - Copy your API key (you'll use this as an environment variable)

2. **Program IDs** (already configured):
   - USD → `stasher-affiliates-usd`
   - EUR → `stasher-affiliate-program-sp`
   - GBP → `stasher-affiliate-program`
   - AUD → `jg-affiliate-program`

3. **Set Environment Variable**:
   - When deploying, add `TAPFILIATE_API_KEY` as an environment variable
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for platform-specific instructions

### 2. Custom Fields in Tapfiliate

Before deploying, ensure these custom fields exist in your Tapfiliate dashboard:

1. Go to Tapfiliate → **Settings** → **Onboarding** → **Custom Fields**
2. Create these fields (if they don't exist):
   - **"Company type"** (Text field)
   - **"Website"** (Text/URL field) - Optional
   - **"Number of Properties"** (Number field) - Optional

**Note:** Field names are case-sensitive and must match exactly.

### 2. Logo Configuration

The page uses the logo file `blue- Logo new - Horizontal.png` by default. If you want to use the white logo instead, update the `src` attribute in `index.html`:

```html
<img src="white - horizontal.png" alt="Stasher Logo" class="logo" id="logo">
```

### 3. Deploy

Simply upload all files to your web server:
- `index.html`
- `styles.css`
- `script.js`
- Logo image files
- Any other assets

## Form Flow

### Page 1: Program Selection
- Select currency program (USD, EUR, GBP, AUD)
- Select language (top right)
- Accept Terms & Conditions
- Login link (less visible, bottom area)

### Page 2: Company Type
- Select company type with icons:
  - I want to store bags (Supply) → Redirects to hosts.stasher.com/signup
  - Vacation Rental / STR / Airbnb Host
  - PMS
  - Venue
  - Blog
  - Other

### Page 3: Personal Information
- First Name *
- Last Name *
- Email *
- Password * (minimum 8 characters)

### Page 4: Company Details (Conditional)

**For Vacation Rental / STR / Airbnb Host:**
- City *
- Country *
- Company Name *
- Company Website (optional)
- Number of Properties (optional, only for STRs)

**For PMS / Venue / Blog / Other:**
- City *
- Country *
- Company Name *
- Company Description (optional)
- Company Website (optional)

### Page 5: Final Step
- Summary of all entered information
- Option to book a demo call (redirects to cal.com/periklis/15min)
- Alternative: Skip demo call → Shows confirmation page

## API Integration

The form integrates with Tapfiliate API via a secure serverless function to:
1. Create a new affiliate with all collected information
2. Immediately add the affiliate to the selected program
3. Set affiliate status to **Pending** (not Archived)
4. Set `send_welcome_email=false` as requested

### How It Works

1. **Frontend** (`script.js`): Collects form data and sends to backend
2. **Backend** (`netlify/functions/create-affiliate.js` or `vercel/api/create-affiliate.js`):
   - Securely stores API key (never exposed to client)
   - Creates affiliate via `POST /affiliates/`
   - Adds affiliate to program via `POST /programs/{program_id}/affiliates/`
   - Returns success/error to frontend

### Field Mapping

- **firstname, lastname, email, password** → Direct fields
- **address.city, address.country.code** → Nested address object (ISO country code)
- **company.name, company.description** → Nested company object
- **custom_fields["Company type"]** → Custom field (must exist in Tapfiliate)
- **custom_fields["Website"]** → Custom field (optional)
- **custom_fields["Number of Properties"]** → Custom field (optional)
- **program_id** → Used to add affiliate to correct program

### Ensuring Pending Status

**CRITICAL:** In your Tapfiliate dashboard:
1. Go to each Program (USD, EUR, GBP, AUD)
2. Settings → **Disable "Auto-approve new affiliates"**
3. This ensures new affiliates appear in **Pending** status

## Customization

### Colors
- Background: `#f2f8fe`
- Primary Blue: `#4A90E2`
- Light Blue (disabled buttons): `#B0D4FF`

### Progress Bar
The progress bar colors match the reference image. You can customize colors in `styles.css`:
- Active/Completed: `#4A90E2`
- Inactive: `#E0E0E0`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All fields marked with * are mandatory
- The form validates input before allowing progression
- Continue button is light blue when disabled, full blue when enabled
- The "Supply" option immediately redirects to the main signup page
- API errors are handled gracefully - confirmation page still shows even if API fails

## Troubleshooting

### API Not Working
- Verify your API key is correct
- Check that Program IDs match your Tapfiliate dashboard
- Check browser console for error messages
- Ensure CORS is enabled if hosting on a different domain

### Form Not Progressing
- Check browser console for JavaScript errors
- Ensure all mandatory fields are filled
- Verify that Terms & Conditions are accepted on page 1

## Support

For Tapfiliate API documentation, visit:
https://tapfiliate.com/docs/rest/

