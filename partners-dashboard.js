/**
 * Partners Dashboard (frontend)
 * - Does NOT contain Tapfiliate API key
 * - Talks to our backend wrapper endpoints
 */

const DASHBOARD_API_BASE = 'https://3cw7ssdjuh.execute-api.eu-north-1.amazonaws.com/prod'; // Same API Gateway as signup

const STORAGE_KEY = 'stasher_partner_dashboard_session_v1';
const BYPASS_USER = 'test97';
const BYPASS_PASS = 'test97';
const BYPASS_TOKEN = '__bypass_test97__';

function qs(sel) {
  return document.querySelector(sel);
}

function setVisible(el, visible) {
  if (!el) return;
  el.style.display = visible ? '' : 'none';
}

function safeText(value) {
  return value == null ? '' : String(value);
}

function formatMoney(amount, currency) {
  if (amount == null || amount === '') return '—';
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  if (!currency) return `${num}`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
  } catch {
    return `${num} ${currency}`;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${DASHBOARD_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = json;
    throw err;
  }

  return json;
}

function setTab(tab) {
  const tabs = document.querySelectorAll('.dashboard-tab');
  const panes = document.querySelectorAll('.dashboard-tabpane');

  tabs.forEach((t) => {
    const active = t.dataset.tab === tab;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  panes.forEach((p) => {
    const active = p.dataset.pane === tab;
    p.style.display = active ? '' : 'none';
  });
}

function renderKpis(model) {
  const grid = qs('#kpiGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = [
    { label: 'Total earnings', value: formatMoney(model.totalEarnings, model.defaultCurrency) },
    { label: 'Pending / unpaid', value: formatMoney(model.pendingEarnings, model.defaultCurrency) },
    { label: 'Total conversions', value: safeText(model.totalConversions ?? '—') },
    { label: 'Conversion rate', value: model.conversionRate != null ? `${model.conversionRate}%` : '—' },
    { label: 'Payout status', value: safeText(model.payoutStatus || '—') },
  ];

  items.forEach(({ label, value }) => {
    const card = document.createElement('div');
    card.className = 'dashboard-kpi';
    card.innerHTML = `
      <div class="dashboard-kpi-label">${label}</div>
      <div class="dashboard-kpi-value">${value}</div>
    `;
    grid.appendChild(card);
  });
}

function renderRecentConversions(conversions) {
  const tbody = qs('#recentConversionsTable tbody');
  const empty = qs('#recentConversionsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!conversions || conversions.length === 0) {
    setVisible(empty, true);
    return;
  }
  setVisible(empty, false);

  conversions.slice(0, 5).forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${safeText(c.external_id || c.id)}</td>
      <td>${formatMoney(c.commission_amount, c.currency)}</td>
      <td>${safeText(c.status)}</td>
      <td>${formatDate(c.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRecentPayments(payments) {
  const tbody = qs('#recentPaymentsTable tbody');
  const empty = qs('#recentPaymentsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!payments || payments.length === 0) {
    setVisible(empty, true);
    return;
  }
  setVisible(empty, false);

  payments.slice(0, 5).forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatMoney(p.amount, p.currency)}</td>
      <td>${safeText(p.status)}</td>
      <td>${formatDate(p.created_at || p.paid_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderEarningsTable(conversions) {
  const tbody = qs('#earningsTable tbody');
  const empty = qs('#earningsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!conversions || conversions.length === 0) {
    setVisible(empty, true);
    return;
  }
  setVisible(empty, false);

  conversions.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${safeText(c.external_id || c.id)}</td>
      <td>${formatMoney(c.commission_amount, c.currency)}</td>
      <td>${safeText(c.currency || '—')}</td>
      <td>${safeText(c.status)}</td>
      <td>${formatDate(c.created_at)}</td>
      <td>${safeText(c.program_id || '—')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPayouts(payments, payoutModel) {
  const setupText = qs('#payoutSetupText');
  const setupCta = qs('#payoutSetupCta');
  const statusText = qs('#payoutStatusText');

  if (setupText) setupText.textContent = payoutModel?.setupText || 'Payout setup status unavailable.';
  setVisible(setupCta, payoutModel?.needsSetup === true);
  if (statusText) statusText.textContent = payoutModel?.statusShort || 'Check your payout setup.';

  const tbody = qs('#payoutHistoryTable tbody');
  const empty = qs('#payoutHistoryEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!payments || payments.length === 0) {
    setVisible(empty, true);
    return;
  }
  setVisible(empty, false);

  payments.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatMoney(p.amount, p.currency)}</td>
      <td>${safeText(p.status)}</td>
      <td>${formatDate(p.created_at || p.paid_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function showToast(message, isError = false) {
  const toast = qs('#copyToast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `dashboard-inline-alert ${isError ? 'dashboard-inline-alert--error' : 'dashboard-inline-alert--success'}`;
  toast.style.display = '';
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

function mapDashboardToViewModel(data) {
  const affiliate = data?.affiliate || null;
  const balances = data?.balances || null;
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const conversions = Array.isArray(data?.conversions) ? data.conversions : [];

  // Pick a default currency (best-effort)
  const defaultCurrency =
    balances?.currency ||
    (conversions[0] && conversions[0].currency) ||
    (payments[0] && payments[0].currency) ||
    'GBP';

  const totalEarnings = balances?.total?.amount ?? balances?.total ?? null;
  const pendingEarnings = balances?.pending?.amount ?? balances?.pending ?? null;

  const convCount = conversions.length;

  // clicks not reliably available via REST without dedicated clicks list; keep resilient
  const conversionRate = null;

  const payoutStatus = balances?.payout_status || balances?.status || null;

  const flattenedConversions = conversions.map((c) => {
    // Use sum of commissions in conversion
    const commissions = Array.isArray(c.commissions) ? c.commissions : [];
    const commissionAmount = commissions.reduce((sum, cm) => sum + (Number(cm.amount) || 0), 0);
    const status = commissions.some((cm) => cm.approved === true) ? 'Approved' : 'Pending';
    return {
      id: c.id,
      external_id: c.external_id,
      created_at: c.created_at,
      currency: (commissions[0] && commissions[0].currency) || c.program?.currency || defaultCurrency,
      program_id: c.program?.id || null,
      commission_amount: commissionAmount,
      status,
    };
  });

  const payoutModel = {
    needsSetup: data?.payout_methods && Array.isArray(data.payout_methods) ? data.payout_methods.length === 0 : false,
    setupText:
      data?.payout_methods && Array.isArray(data.payout_methods) && data.payout_methods.length === 0
        ? 'No payout method configured yet. Add your payout details to receive payments.'
        : 'Payout method configured.',
    statusShort:
      data?.payout_methods && Array.isArray(data.payout_methods) && data.payout_methods.length === 0
        ? 'Payout method missing'
        : 'Payout method configured',
  };

  return {
    affiliate,
    defaultCurrency,
    totalEarnings,
    pendingEarnings,
    totalConversions: convCount,
    conversionRate,
    payoutStatus,
    payments,
    conversions: flattenedConversions,
    payoutModel,
  };
}

async function loadDashboard({ token }) {
  const loading = qs('#dashboardLoading');
  const errBox = qs('#dashboardError');
  setVisible(errBox, false);
  setVisible(loading, true);

  try {
    let model;
    if (token === BYPASS_TOKEN) {
      model = {
        affiliate: { firstname: 'Test', lastname: 'User' },
        totalEarnings: null,
        pendingEarnings: null,
        totalConversions: null,
        conversionRate: null,
        payoutStatus: '—',
        defaultCurrency: 'USD',
        conversions: [],
        payments: [],
        payoutModel: {},
      };
    } else {
      const data = await apiRequest('/partner/dashboard', { token });
      model = mapDashboardToViewModel(data);
    }

    const name = model.affiliate ? `${model.affiliate.firstname || ''} ${model.affiliate.lastname || ''}`.trim() : '';
    const welcome = qs('#welcomeSubtitle');
    if (welcome) {
      welcome.textContent = name ? `Welcome back, ${name}.` : 'Welcome back.';
    }

    // Affiliate link (best effort)
    const link = (model.affiliate && (model.affiliate.referral_link || model.affiliate.referralLink || model.affiliate.link)) || '';
    const input = qs('#affiliateLinkInput');
    if (input) input.value = link || 'Link not available yet.';
    const open = qs('#openAffiliateLinkBtn');
    if (open) open.href = link || '#';
    open?.classList.toggle('is-disabled', !link);

    renderKpis(model);
    renderRecentConversions(model.conversions);
    renderRecentPayments(model.payments);
    renderEarningsTable(model.conversions);
    renderPayouts(model.payments, model.payoutModel);

    setVisible(loading, false);
    return true;
  } catch (e) {
    setVisible(loading, false);
    if (errBox) {
      errBox.textContent = e.message || 'Failed to load dashboard.';
      errBox.style.display = '';
    }
    return false;
  }
}

async function handleLogin() {
  const btn = qs('#dashboardLoginBtn');
  const err = qs('#authError');
  setVisible(err, false);
  if (btn) btn.disabled = true;

  const email = safeText(qs('#loginEmailInput')?.value).trim();
  const password = safeText(qs('#loginPasswordInput')?.value).trim();

  if (!email || !password) {
    if (err) {
      err.textContent = 'Please enter both Email and Password.';
      err.style.display = '';
    }
    if (btn) btn.disabled = false;
    return;
  }

  // Bypass: test97 / test97 goes straight to dashboard without verification
  if (email === BYPASS_USER && password === BYPASS_PASS) {
    const session = { token: BYPASS_TOKEN, affiliate_id: 'test97', email: BYPASS_USER };
    saveSession(session);
    setVisible(qs('#dashboardAuth'), false);
    setVisible(qs('#dashboardMain'), true);
    setVisible(qs('#logoutBtn'), true);
    await loadDashboard({ token: BYPASS_TOKEN });
    if (btn) btn.disabled = false;
    return;
  }

  if (err) {
    err.textContent = 'Invalid credentials. For demo access use test97 / test97.';
    err.style.display = '';
  }
  if (btn) btn.disabled = false;
}

function setupCopyLink() {
  const btn = qs('#copyAffiliateLinkBtn');
  const input = qs('#affiliateLinkInput');
  if (!btn || !input) return;

  btn.addEventListener('click', async () => {
    const val = safeText(input.value).trim();
    if (!val || val === 'Link not available yet.') {
      showToast('No link available to copy.', true);
      return;
    }
    try {
      await navigator.clipboard.writeText(val);
      showToast('Copied!');
    } catch {
      // Fallback
      input.select();
      document.execCommand('copy');
      showToast('Copied!');
    }
  });
}

function setupTabs() {
  document.querySelectorAll('.dashboard-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTab(btn.dataset.tab);
    });
  });
}

function setupLogout() {
  const btn = qs('#logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearSession();
    window.location.reload();
  });
}

function setupLanguageUi() {
  const languageSelect = qs('#languageSelect');
  const flagEl = qs('#currentLanguageFlag');
  if (!languageSelect || !flagEl) return;

  const setFlag = () => {
    const opt = languageSelect.options[languageSelect.selectedIndex];
    const flag = opt?.getAttribute('data-flag') || '🇬🇧';
    flagEl.textContent = flag;
  };
  languageSelect.addEventListener('change', setFlag);
  setFlag();
}

async function init() {
  setupTabs();
  setupCopyLink();
  setupLogout();
  setupLanguageUi();

  qs('#dashboardLoginBtn')?.addEventListener('click', handleLogin);

  const session = loadSession();
  if (session?.token) {
    setVisible(qs('#dashboardAuth'), false);
    setVisible(qs('#dashboardMain'), true);
    setVisible(qs('#logoutBtn'), true);
    await loadDashboard({ token: session.token });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

