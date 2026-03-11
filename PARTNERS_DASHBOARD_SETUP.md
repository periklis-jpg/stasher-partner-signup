# Partners Dashboard setup (simple)

This project now has an **internal Partners Dashboard** page:

- Open it at: `partners-dashboard.html`
- It replaces the old Tapfiliate-hosted login links in `index.html`

## What you must set up (2 things)

### 1) Backend endpoint (server-side)

The dashboard page must call a backend (server) to fetch data from Tapfiliate.
This is required so the **Tapfiliate API key stays secret**.

Backend code is here:
- `amplify/backend/function/partnerDashboard/src/index.js`

It expects these environment variables in AWS Lambda:
- `TAPFILIATE_API_KEY` = your Tapfiliate API key
- `DASHBOARD_JWT_SECRET` = a random secret string (used to create login tokens)

### 2) API Gateway routes

Create these **two** routes in API Gateway and connect them to the `partnerDashboard` Lambda:

- **POST** `/partner/verify`
- **GET** `/partner/dashboard`

Then deploy API Gateway to your `prod` stage.

## How login works (simple)

The dashboard login asks for:
- Affiliate ID
- Email

The backend checks Tapfiliate:
- `GET /affiliates/{affiliate_id}/`

If the email matches, the backend returns a short-lived token.
The browser uses that token to request dashboard data (so users can’t just guess other IDs).

## Tapfiliate endpoints used (v1.6)

Server-side only (Lambda -> Tapfiliate):
- `GET /affiliates/{affiliate_id}/`
- `GET /affiliates/{affiliate_id}/balances/`
- `GET /affiliates/{affiliate_id}/payments/`
- `GET /affiliates/{affiliate_id}/payout-methods/`
- `GET /conversions/?affiliate_id={affiliate_id}&page=1`

## After it’s set up

1. Push code to GitHub (Amplify will redeploy the frontend)
2. Deploy the Lambda + API Gateway routes
3. Go to your site and open:
   - `https://<your-amplify-domain>/partners-dashboard.html`

If you see an error like “Request failed (404/401/502)”, it usually means the API Gateway routes or Lambda env vars are not set correctly.

