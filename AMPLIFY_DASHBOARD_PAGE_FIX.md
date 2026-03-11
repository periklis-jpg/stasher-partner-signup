# Why Partners Dashboard doesn't show in Amplify (and how to fix it)

When you open `https://<your-amplify-domain>/partners-dashboard.html` you may see the **main app (landing page)** instead of the dashboard login. That happens because Amplify is treating the app as an SPA and **rewriting** that URL to `index.html`.

## Fix: add a redirect rule

1. Open **AWS Amplify Console** → your app.
2. Go to **Hosting** → **Redirects and rewrites** (or **App settings** → **Redirects**).
3. If you have an **SPA rule** that rewrites (200) to `/index.html` (e.g. source `/<*>` or a regex, target `/index.html`), add a **new rule above it**:
   - **Source address:** `/partners-dashboard.html`
   - **Target address:** `/partners-dashboard.html`
   - **Type:** Rewrite (200)
4. **Save.** Rules are applied top to bottom; this rule must be **before** the catch-all SPA rule.

## Alternative

Edit the SPA rule’s regex so that **`.html`** is excluded from the rewrite (e.g. add `html` to the list of extensions that are not rewritten, like `css`, `js`, `png`). Then requests to `partners-dashboard.html` will be served as the real file instead of `index.html`.

After this, `https://<your-amplify-domain>/partners-dashboard.html` should show the Partners Dashboard login page.
