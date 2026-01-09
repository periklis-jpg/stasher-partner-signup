# How to Upload Loading Indicators Update

## What Was Changed

Added loading indicators that show when:
- **Page 3**: Creating affiliate account (after clicking Continue)
- **Page 4**: Updating commission type (after clicking Continue)

The loading indicators:
- Show a spinner on the button
- Change button text to "Creating account..." or "Updating..."
- Disable the button during the API call
- Automatically hide when the API call completes

---

## Files Changed

1. **`styles.css`** - Added CSS for loading spinner
2. **`script.js`** - Added loading state to Page 3 and Page 4 continue buttons

---

## How to Upload to GitHub and Deploy

### Step 1: Commit Changes to Git

Open Terminal and run:

```bash
cd "/Users/periklis/Desktop/Projects/NEW FOR AWS"
git add styles.css script.js
git commit -m "Add loading indicators for Page 3 and Page 4 API calls"
git push origin main
```

### Step 2: Wait for AWS Amplify to Auto-Deploy

1. Go to: https://console.aws.amazon.com/amplify
2. Your app should automatically detect the new changes
3. A new deployment will start automatically
4. Wait 2-3 minutes for it to finish
5. You'll see "Deployed" with a green checkmark when done

### Step 3: Test

1. Visit your Amplify website
2. Fill out the form
3. On Page 3, click "Continue" - you should see:
   - Button text changes to "Creating account..."
   - Button shows a spinner
   - Button is disabled
   - After API completes, button returns to normal and page advances
4. On Page 4, click "Continue" - you should see:
   - Button text changes to "Updating..."
   - Button shows a spinner
   - Button is disabled
   - After API completes, button returns to normal and page advances

---

## Alternative: Using GitHub Desktop

If you prefer using GitHub Desktop:

1. Open GitHub Desktop
2. You should see `styles.css` and `script.js` in the changed files
3. Write commit message: "Add loading indicators for Page 3 and Page 4 API calls"
4. Click "Commit to main"
5. Click "Push origin"
6. Wait for Amplify to auto-deploy (2-3 minutes)

---

## What Users Will See

### Before (Old Behavior):
- User clicks "Continue"
- Page freezes for a few seconds
- No feedback that something is happening
- User might think the page is broken

### After (New Behavior):
- User clicks "Continue"
- Button immediately shows "Creating account..." with spinner
- Button is disabled (can't click again)
- Clear visual feedback that the system is working
- After API completes, page advances normally

---

## Technical Details

### CSS Added:
- `.loading-spinner` - Small spinner for buttons
- `.loading-spinner-overlay` - Full-page overlay (not used, but available)
- `.loading-spinner-large` - Large spinner (not used, but available)
- `.btn-continue.loading` - Loading state for continue buttons
- `@keyframes spin` - Animation for spinner rotation

### JavaScript Changes:
- Page 3: Added loading state before `createAffiliateAfterPage3()` call
- Page 4: Added loading state before `updateCommissionTypeAfterPage4()` call
- Both use `try/finally` to ensure loading state is always cleared

---

## Troubleshooting

### Loading indicator doesn't show:
- Check browser console for JavaScript errors
- Make sure CSS file loaded correctly
- Verify the button has the `loading` class when clicked

### Button stays in loading state:
- Check browser console for API errors
- The `finally` block should always clear the loading state
- If API fails, loading should still clear

### Spinner doesn't animate:
- Check if CSS `@keyframes spin` is defined
- Verify browser supports CSS animations
- Check for CSS conflicts

---

## Summary

✅ **Loading indicators added**
✅ **Page 3 shows "Creating account..." during API call**
✅ **Page 4 shows "Updating..." during API call**
✅ **Buttons are disabled during API calls**
✅ **No backend changes needed**

Just commit and push to GitHub, and Amplify will automatically deploy!

