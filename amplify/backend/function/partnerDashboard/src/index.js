/**
 * Partner Dashboard backend (AWS Lambda)
 *
 * IMPORTANT:
 * - Never expose TAPFILIATE_API_KEY to the frontend.
 * - Frontend calls this Lambda through API Gateway.
 *
 * Endpoints (API Gateway -> Lambda proxy):
 * - POST /partner/verify        { affiliate_id, email } -> { token }
 * - GET  /partner/dashboard     Authorization: Bearer <token> -> dashboard payload
 *
 * Tapfiliate REST API v1.6 docs: https://tapfiliate.com/docs/rest/
 */

const crypto = require('crypto');

const TAPFILIATE_BASE_URL = 'https://api.tapfiliate.com/1.6';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(bodyObj),
  };
}

function badRequest(message) {
  return json(400, { error: message || 'Bad request' });
}

function unauthorized(message) {
  return json(401, { error: message || 'Unauthorized' });
}

function serverError(message) {
  return json(500, { error: message || 'Internal server error' });
}

function getEnv(name) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : null;
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(payload, secret) {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64url(payloadJson);
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${payloadB64}.${sig}`;
}

function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  let payload = null;
  try {
    const jsonStr = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    payload = JSON.parse(jsonStr);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

async function tapfiliateFetch(path, { apiKey, method = 'GET', query, body } = {}) {
  const url = new URL(`${TAPFILIATE_BASE_URL}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let jsonData = null;
  try {
    jsonData = text ? JSON.parse(text) : null;
  } catch {
    jsonData = null;
  }

  if (!res.ok) {
    const err = new Error(`Tapfiliate request failed (${res.status})`);
    err.status = res.status;
    err.body = jsonData || text;
    throw err;
  }

  return jsonData;
}

function getBearerToken(headers) {
  const h = headers || {};
  const auth = h.Authorization || h.authorization || '';
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function parseJsonBody(event) {
  if (!event || !event.body) return null;
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  // Preflight
  if (event && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  const apiKey = getEnv('TAPFILIATE_API_KEY');
  const jwtSecret = getEnv('DASHBOARD_JWT_SECRET');
  if (!apiKey) return serverError('Server configuration error: TAPFILIATE_API_KEY not set.');
  if (!jwtSecret) return serverError('Server configuration error: DASHBOARD_JWT_SECRET not set.');

  const method = event.httpMethod;
  const path = event.path || '';

  try {
    // POST /partner/verify
    if (method === 'POST' && path.endsWith('/partner/verify')) {
      const body = parseJsonBody(event);
      if (!body) return badRequest('Invalid JSON body.');

      const affiliateId = String(body.affiliate_id || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      if (!affiliateId || !email) return badRequest('Missing affiliate_id or email.');

      const affiliate = await tapfiliateFetch(`/affiliates/${encodeURIComponent(affiliateId)}/`, { apiKey });
      const affiliateEmail = String(affiliate?.email || '').trim().toLowerCase();
      if (!affiliateEmail || affiliateEmail !== email) {
        return unauthorized('Affiliate ID and email do not match.');
      }

      const token = signToken(
        {
          sub: affiliateId,
          email,
          exp: Date.now() + 1000 * 60 * 60, // 1 hour
        },
        jwtSecret
      );

      return json(200, { token });
    }

    // GET /partner/dashboard
    if (method === 'GET' && path.endsWith('/partner/dashboard')) {
      const token = getBearerToken(event.headers);
      if (!token) return unauthorized('Missing Authorization token.');

      const payload = verifyToken(token, jwtSecret);
      if (!payload || !payload.sub) return unauthorized('Invalid or expired token.');

      const affiliateId = String(payload.sub);

      const page = event.queryStringParameters && event.queryStringParameters.page ? String(event.queryStringParameters.page) : '1';

      const [affiliate, balances, payments, payoutMethods, conversions] = await Promise.all([
        tapfiliateFetch(`/affiliates/${encodeURIComponent(affiliateId)}/`, { apiKey }),
        tapfiliateFetch(`/affiliates/${encodeURIComponent(affiliateId)}/balances/`, { apiKey }),
        tapfiliateFetch(`/affiliates/${encodeURIComponent(affiliateId)}/payments/`, { apiKey }),
        tapfiliateFetch(`/affiliates/${encodeURIComponent(affiliateId)}/payout-methods/`, { apiKey }),
        tapfiliateFetch(`/conversions/`, { apiKey, query: { affiliate_id: affiliateId, page } }),
      ]);

      return json(200, {
        affiliate,
        balances,
        payments,
        payout_methods: payoutMethods,
        conversions,
      });
    }

    return json(404, { error: 'Not found' });
  } catch (e) {
    console.error('partnerDashboard error', e);
    // If Tapfiliate returned structured error, surface minimal details
    if (e && e.status) {
      return json(502, { error: 'Upstream error', status: e.status });
    }
    return serverError('Internal server error.');
  }
};

