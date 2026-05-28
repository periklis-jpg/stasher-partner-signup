/*
 * Whitelabel admin
 *
 * Storage: GitHub Contents API. Each "save partner" pushes one or two commits
 * to the configured repo/branch. Amplify auto-deploys the new files. Visitors
 * see the branded page once the deploy finishes (~2-5 min).
 *
 * Everything except the gate is hidden until the access code is entered.
 */

(function () {
    'use strict';

    var ACCESS_CODE = 'STASHERWHITELABEL';
    var GATE_KEY = 'wl_admin_gate_v1';
    var CONFIG_KEY = 'wl_admin_config_v1';
    var DEFAULT_REPO_OWNER = 'stasher-city';
    var DEFAULT_REPO_NAME = 'stasher-partner-signup';
    var DEFAULT_REPO_BRANCH = 'main';
    var PARTNERS_JSON_PATH = 'whitelabel/partners.json';
    var LOGOS_DIR = 'whitelabel/logos';
    var PUBLIC_PARTNERS_URL = '/whitelabel/partners.json';
    var MAX_LOGO_BYTES = 2 * 1024 * 1024;
    var SHARE_BASE_URL = 'https://partners.stasher.com/';

    // ----- DOM refs -----
    var $gate = document.getElementById('wlGate');
    var $gateForm = document.getElementById('wlGateForm');
    var $gateInput = document.getElementById('wlGateCode');
    var $app = document.getElementById('wlApp');
    var $logoutBtn = document.getElementById('wlLogoutBtn');

    var $configCard = document.getElementById('wlConfigCard');
    var $owner = document.getElementById('wlRepoOwner');
    var $repo = document.getElementById('wlRepoName');
    var $branch = document.getElementById('wlRepoBranch');
    var $token = document.getElementById('wlGithubToken');
    var $saveConfigBtn = document.getElementById('wlSaveConfigBtn');
    var $configStatus = document.getElementById('wlConfigStatus');

    var $formCard = document.getElementById('wlFormCard');
    var $formTitle = document.getElementById('wlFormTitle');
    var $form = document.getElementById('wlPartnerForm');
    var $editingCode = document.getElementById('wlEditingCode');
    var $code = document.getElementById('wlPartnerCode');
    var $logo = document.getElementById('wlPartnerLogo');
    var $logoEditHint = document.getElementById('wlLogoEditHint');
    var $logoPreview = document.getElementById('wlLogoPreview');
    var $logoPreviewImg = document.getElementById('wlLogoPreviewImg');
    var $logoPreviewLabel = document.getElementById('wlLogoPreviewLabel');
    var $logoPreviewHint = document.getElementById('wlLogoPreviewHint');
    var savedLogoPreviewSrc = '';
    var $colorPicker = document.getElementById('wlPartnerColor');
    var $colorHex = document.getElementById('wlPartnerColorHex');
    var $titleField = document.getElementById('wlPartnerTitle');
    var $desc = document.getElementById('wlPartnerDescription');
    var $ctaUrl = document.getElementById('wlPartnerCtaUrl');
    var $ctaLabel = document.getElementById('wlPartnerCtaLabel');
    var $saveBtn = document.getElementById('wlSaveBtn');
    var $saveStatus = document.getElementById('wlSaveStatus');
    var $cancelEditBtn = document.getElementById('wlCancelEditBtn');
    var $savedUrl = document.getElementById('wlSavedUrl');
    var $savedUrlInput = document.getElementById('wlSavedUrlInput');
    var $savedUrlCopy = document.getElementById('wlSavedUrlCopy');

    var $listCard = document.getElementById('wlListCard');
    var $listContent = document.getElementById('wlListContent');
    var $refreshBtn = document.getElementById('wlRefreshBtn');

    // In-memory cache of currently rendered partners for edit/delete lookups
    var partnersCache = {};

    // ===================================================================
    // GATE
    // ===================================================================

    function isUnlocked() {
        try { return sessionStorage.getItem(GATE_KEY) === '1'; }
        catch (e) { return false; }
    }

    function unlock() {
        try { sessionStorage.setItem(GATE_KEY, '1'); } catch (e) {}
        $gate.hidden = true;
        $app.hidden = false;
        loadConfigIntoForm();
        refreshDashboard();
    }

    function lock() {
        try { sessionStorage.removeItem(GATE_KEY); } catch (e) {}
        $app.hidden = true;
        $gate.hidden = false;
        $gateInput.value = '';
        $gateInput.focus();
    }

    $gateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = ($gateInput.value || '').trim();
        if (value === ACCESS_CODE) {
            $gate.classList.remove('wl-gate-error');
            unlock();
        } else {
            $gate.classList.add('wl-gate-error');
            $gateInput.value = '';
            $gateInput.focus();
        }
    });

    $logoutBtn.addEventListener('click', lock);

    // Default: gate is visible, app is hidden. Auto-unlock if same tab already passed.
    if (isUnlocked()) unlock();

    // ===================================================================
    // CONFIG (GitHub PAT + repo coordinates)
    // ===================================================================

    function readConfig() {
        try {
            var raw = localStorage.getItem(CONFIG_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) { return null; }
    }

    function writeConfig(config) {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        } catch (e) {}
    }

    function loadConfigIntoForm() {
        var cfg = readConfig();
        $owner.value = (cfg && cfg.owner) || DEFAULT_REPO_OWNER;
        $repo.value = (cfg && cfg.repo) || DEFAULT_REPO_NAME;
        $branch.value = (cfg && cfg.branch) || DEFAULT_REPO_BRANCH;
        $token.value = (cfg && cfg.token) || '';
        toggleFormVisibility();
    }

    function toggleFormVisibility() {
        var cfg = readConfig();
        var hasConfig = cfg && cfg.token && cfg.owner && cfg.repo && cfg.branch;
        $formCard.hidden = !hasConfig;
        $listCard.hidden = !hasConfig;
    }

    $saveConfigBtn.addEventListener('click', function () {
        var owner = ($owner.value || '').trim();
        var repo = ($repo.value || '').trim();
        var branch = ($branch.value || '').trim() || DEFAULT_REPO_BRANCH;
        var token = ($token.value || '').trim();

        if (!owner || !repo || !token) {
            setStatus($configStatus, 'Fill owner, repo, and token.', 'error');
            return;
        }

        setStatus($configStatus, 'Verifying access…', null);
        verifyGithubAccess({ owner: owner, repo: repo, branch: branch, token: token })
            .then(function () {
                writeConfig({ owner: owner, repo: repo, branch: branch, token: token });
                setStatus($configStatus, 'Connected.', 'success');
                toggleFormVisibility();
                refreshDashboard();
            })
            .catch(function (err) {
                setStatus($configStatus, 'Could not connect: ' + err.message, 'error');
            });
    });

    function verifyGithubAccess(cfg) {
        return githubApi('GET', '/repos/' + cfg.owner + '/' + cfg.repo, null, cfg.token)
            .then(function (repoInfo) {
                if (!repoInfo || !repoInfo.permissions || (!repoInfo.permissions.push && !repoInfo.permissions.admin)) {
                    throw new Error('Token cannot push to this repo.');
                }
                return repoInfo;
            });
    }

    // ===================================================================
    // FORM HELPERS
    // ===================================================================

    // Keep color picker and hex input in sync
    $colorPicker.addEventListener('input', function () {
        $colorHex.value = $colorPicker.value.toUpperCase();
    });
    $colorHex.addEventListener('input', function () {
        var v = ($colorHex.value || '').trim();
        if (!/^#?[0-9a-fA-F]{6}$/.test(v)) return;
        if (v.charAt(0) !== '#') v = '#' + v;
        $colorHex.value = v.toUpperCase();
        $colorPicker.value = v.toLowerCase();
    });

    function setStatus(el, msg, kind) {
        if (!el) return;
        el.textContent = msg || '';
        el.classList.remove('wl-status-success', 'wl-status-error');
        if (kind === 'success') el.classList.add('wl-status-success');
        if (kind === 'error') el.classList.add('wl-status-error');
    }

    function readFileAsBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                // result is "data:image/png;base64,XXXX"
                var result = String(reader.result || '');
                var comma = result.indexOf(',');
                if (comma < 0) return reject(new Error('Could not read file.'));
                resolve(result.slice(comma + 1));
            };
            reader.onerror = function () { reject(new Error('Could not read file.')); };
            reader.readAsDataURL(file);
        });
    }

    function sanitizeCode(input) {
        return String(input || '').trim().replace(/[^A-Za-z0-9_-]/g, '');
    }

    function fileExtension(file) {
        if (file.type === 'image/png') return 'png';
        if (file.type === 'image/jpeg') return 'jpg';
        return '';
    }

    // ===================================================================
    // SUBMIT PARTNER
    // ===================================================================

    $form.addEventListener('submit', function (e) {
        e.preventDefault();
        savePartner().catch(function (err) {
            setStatus($saveStatus, 'Save failed: ' + err.message, 'error');
            $saveBtn.disabled = false;
        });
    });

    function savePartner() {
        var cfg = readConfig();
        if (!cfg || !cfg.token) {
            return Promise.reject(new Error('Set storage connection first.'));
        }

        var editingCode = ($editingCode.value || '').trim();
        var isEditing = !!editingCode;
        var code = isEditing ? editingCode : sanitizeCode($code.value);
        if (!code) return Promise.reject(new Error('Parent ID code is invalid.'));

        var file = $logo.files && $logo.files[0];
        if (!isEditing && !file) {
            return Promise.reject(new Error('Please choose a logo file.'));
        }
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                return Promise.reject(new Error('Logo must be a PNG or JPEG.'));
            }
            if (file.size > MAX_LOGO_BYTES) {
                return Promise.reject(new Error('Logo is larger than 2 MB.'));
            }
        }

        var color = ($colorHex.value || '').trim();
        if (color.charAt(0) !== '#') color = '#' + color;
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
            return Promise.reject(new Error('Brand colour must be a hex like #1A73E8.'));
        }

        var description = ($desc.value || '').trim();
        if (!description) return Promise.reject(new Error('Description is required.'));

        var title = ($titleField.value || '').trim();
        var ctaUrl = ($ctaUrl.value || '').trim();
        var ctaLabel = ($ctaLabel.value || '').trim();

        if (ctaUrl && !/^https?:\/\//i.test(ctaUrl)) {
            return Promise.reject(new Error('Integration guide link must start with http:// or https://.'));
        }

        $saveBtn.disabled = true;
        $savedUrl.hidden = true;

        var existingPartner = partnersCache[code] || null;
        var existingLogoPath = (existingPartner && existingPartner.logoPath) ? existingPartner.logoPath.replace(/^\//, '') : null;

        var logoUploadPromise;
        var finalLogoPath;

        if (file) {
            var ext = fileExtension(file);
            if (!ext) return Promise.reject(new Error('Unsupported file type.'));
            finalLogoPath = LOGOS_DIR + '/' + code + '.' + ext;
            setStatus($saveStatus, 'Uploading logo…', null);
            logoUploadPromise = readFileAsBase64(file).then(function (b64) {
                return upsertFile(cfg, finalLogoPath, b64, 'whitelabel: upload logo for ' + code);
            }).then(function () {
                // If we replaced an existing logo at a different extension, delete the old one
                if (existingLogoPath && existingLogoPath !== finalLogoPath) {
                    return deleteFile(cfg, existingLogoPath, 'whitelabel: remove old logo for ' + code)
                        .catch(function () { /* best effort */ });
                }
            });
        } else {
            finalLogoPath = existingLogoPath;
            logoUploadPromise = Promise.resolve();
        }

        return logoUploadPromise
            .then(function () {
                setStatus($saveStatus, 'Saving partner…', null);
                return upsertPartnersJson(cfg, code, {
                    code: code,
                    brandColor: color.toLowerCase(),
                    title: title,
                    description: description,
                    ctaUrl: ctaUrl,
                    ctaLabel: ctaLabel,
                    logoPath: '/' + finalLogoPath,
                    updatedAt: new Date().toISOString()
                });
            })
            .then(function () {
                var url = SHARE_BASE_URL + '?via=' + encodeURIComponent(code);
                $savedUrlInput.value = url;
                $savedUrl.hidden = false;
                setStatus($saveStatus, isEditing ? 'Updated. Live within a few minutes.' : 'Saved. Live within a few minutes.', 'success');
                $saveBtn.disabled = false;
                exitEditMode();
                $form.reset();
                $colorPicker.value = '#142e59';
                $colorHex.value = '#142E59';
                refreshDashboard();
            });
    }

    $savedUrlCopy.addEventListener('click', function () {
        $savedUrlInput.select();
        try {
            document.execCommand('copy');
            setStatus($saveStatus, 'URL copied to clipboard.', 'success');
        } catch (e) {
            setStatus($saveStatus, 'Could not copy. Select and copy manually.', 'error');
        }
    });

    // ===================================================================
    // EDIT / DELETE FLOW
    // ===================================================================

    function enterEditMode(code) {
        var partner = partnersCache[code];
        if (!partner) {
            setStatus($saveStatus, 'Could not find partner: ' + code, 'error');
            return;
        }
        $editingCode.value = code;
        $code.value = code;
        $code.readOnly = true;
        $code.classList.add('wl-readonly');
        $titleField.value = partner.title || '';
        $desc.value = partner.description || '';
        $colorPicker.value = (partner.brandColor || '#142e59').toLowerCase();
        $colorHex.value = (partner.brandColor || '#142e59').toUpperCase();
        $ctaUrl.value = partner.ctaUrl || '';
        $ctaLabel.value = partner.ctaLabel || '';
        $logo.value = '';
        $logo.required = false;
        $logoEditHint.hidden = false;
        showSavedLogoPreview(partner.logoPath);
        $formTitle.textContent = 'Edit branded page: ' + code;
        $saveBtn.textContent = 'Update branded page';
        $cancelEditBtn.hidden = false;
        $savedUrl.hidden = true;
        setStatus($saveStatus, '', null);
        $formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function exitEditMode() {
        $editingCode.value = '';
        $code.readOnly = false;
        $code.classList.remove('wl-readonly');
        $logo.required = true;
        $logoEditHint.hidden = true;
        $formTitle.textContent = 'Create a branded page';
        $saveBtn.textContent = 'Save branded page';
        $cancelEditBtn.hidden = true;
        hideLogoPreview();
    }

    function showSavedLogoPreview(logoPath) {
        if (!logoPath) {
            hideLogoPreview();
            return;
        }
        // Add a cache-buster so the freshly-updated logo is shown after a save.
        savedLogoPreviewSrc = logoPath + (logoPath.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
        $logoPreviewImg.src = savedLogoPreviewSrc;
        $logoPreviewLabel.textContent = 'Current logo';
        $logoPreviewHint.textContent = 'Pick a new file to replace it, or leave empty to keep this one.';
        $logoPreview.hidden = false;
    }

    function showNewLogoPreview(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            $logoPreviewImg.src = String(reader.result || '');
            $logoPreviewLabel.textContent = 'New logo (preview)';
            $logoPreviewHint.textContent = 'This will replace the current logo when you save.';
            $logoPreview.hidden = false;
        };
        reader.readAsDataURL(file);
    }

    function hideLogoPreview() {
        $logoPreview.hidden = true;
        $logoPreviewImg.removeAttribute('src');
        savedLogoPreviewSrc = '';
    }

    $logo.addEventListener('change', function () {
        var file = $logo.files && $logo.files[0];
        if (file) {
            showNewLogoPreview(file);
        } else if (savedLogoPreviewSrc) {
            $logoPreviewImg.src = savedLogoPreviewSrc;
            $logoPreviewLabel.textContent = 'Current logo';
            $logoPreviewHint.textContent = 'Pick a new file to replace it, or leave empty to keep this one.';
            $logoPreview.hidden = false;
        } else {
            hideLogoPreview();
        }
    });

    $cancelEditBtn.addEventListener('click', function () {
        exitEditMode();
        $form.reset();
        $colorPicker.value = '#142e59';
        $colorHex.value = '#142E59';
        setStatus($saveStatus, '', null);
    });

    function deletePartner(code) {
        var cfg = readConfig();
        if (!cfg || !cfg.token) {
            setStatus($saveStatus, 'Set storage connection first.', 'error');
            return;
        }
        var partner = partnersCache[code];
        if (!partner) return;
        if (!window.confirm('Delete branded page "' + code + '"? This cannot be undone.')) {
            return;
        }

        setStatus($saveStatus, 'Deleting ' + code + '…', null);

        var logoPath = (partner.logoPath || '').replace(/^\//, '');
        var deleteLogoPromise = logoPath
            ? deleteFile(cfg, logoPath, 'whitelabel: delete logo for ' + code).catch(function () { /* best effort */ })
            : Promise.resolve();

        deleteLogoPromise
            .then(function () { return removePartnerFromJson(cfg, code); })
            .then(function () {
                setStatus($saveStatus, 'Deleted ' + code + '.', 'success');
                if ($editingCode.value === code) {
                    exitEditMode();
                    $form.reset();
                }
                refreshDashboard();
            })
            .catch(function (err) {
                setStatus($saveStatus, 'Delete failed: ' + err.message, 'error');
            });
    }

    function removePartnerFromJson(cfg, code) {
        return getFile(cfg, PARTNERS_JSON_PATH).then(function (existing) {
            var current = { version: 1, partners: {} };
            if (existing && existing.content) {
                try {
                    current = JSON.parse(atob(existing.content.replace(/\n/g, '')));
                    if (!current.partners) current.partners = {};
                    if (!current.version) current.version = 1;
                } catch (e) {}
            }
            if (!(code in current.partners)) return;
            delete current.partners[code];

            var newJson = JSON.stringify(current, null, 2) + '\n';
            var body = {
                message: 'whitelabel: remove partner ' + code,
                content: b64EncodeUtf8(newJson),
                branch: cfg.branch
            };
            if (existing && existing.sha) body.sha = existing.sha;
            return githubApi('PUT', repoContentsPath(cfg, PARTNERS_JSON_PATH), body, cfg.token);
        });
    }

    function deleteFile(cfg, path, message) {
        return getFile(cfg, path).then(function (existing) {
            if (!existing || !existing.sha) return null;
            return githubApi('DELETE', repoContentsPath(cfg, path), {
                message: message,
                sha: existing.sha,
                branch: cfg.branch
            }, cfg.token);
        });
    }

    // ===================================================================
    // PERSISTENCE: GITHUB CONTENTS API
    // ===================================================================

    function githubApi(method, path, body, token) {
        var headers = {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (body) headers['Content-Type'] = 'application/json';

        return fetch('https://api.github.com' + path, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null
        }).then(function (res) {
            if (res.status === 404) return null;
            return res.json().then(function (data) {
                if (!res.ok) {
                    var msg = (data && data.message) || ('GitHub ' + res.status);
                    throw new Error(msg);
                }
                return data;
            });
        });
    }

    function repoContentsPath(cfg, path) {
        return '/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + path;
    }

    function getFile(cfg, path) {
        return githubApi(
            'GET',
            repoContentsPath(cfg, path) + '?ref=' + encodeURIComponent(cfg.branch),
            null,
            cfg.token
        );
    }

    function upsertFile(cfg, path, contentBase64, message) {
        return getFile(cfg, path).then(function (existing) {
            var body = {
                message: message,
                content: contentBase64,
                branch: cfg.branch
            };
            if (existing && existing.sha) body.sha = existing.sha;
            return githubApi('PUT', repoContentsPath(cfg, path), body, cfg.token);
        });
    }

    function upsertPartnersJson(cfg, code, entry) {
        return getFile(cfg, PARTNERS_JSON_PATH).then(function (existing) {
            var current = { version: 1, partners: {} };
            if (existing && existing.content) {
                try {
                    var jsonText = atob(existing.content.replace(/\n/g, ''));
                    var parsed = JSON.parse(jsonText);
                    if (parsed && parsed.partners) current = parsed;
                    if (!current.version) current.version = 1;
                } catch (e) {
                    // fall back to fresh object
                }
            }
            current.partners[code] = entry;

            var newJson = JSON.stringify(current, null, 2) + '\n';
            var newBase64 = b64EncodeUtf8(newJson);

            var body = {
                message: 'whitelabel: save partner ' + code,
                content: newBase64,
                branch: cfg.branch
            };
            if (existing && existing.sha) body.sha = existing.sha;

            return githubApi('PUT', repoContentsPath(cfg, PARTNERS_JSON_PATH), body, cfg.token);
        });
    }

    function b64EncodeUtf8(str) {
        // btoa needs ASCII; encode UTF-8 first
        return btoa(unescape(encodeURIComponent(str)));
    }

    // ===================================================================
    // DASHBOARD
    // ===================================================================

    $refreshBtn.addEventListener('click', refreshDashboard);

    function refreshDashboard() {
        if ($listCard.hidden) return;
        $listContent.innerHTML = '<p class="wl-muted">Loading…</p>';

        var cfg = readConfig();
        var fetchPromise;
        if (cfg && cfg.token) {
            // Authenticated GET against GitHub so we see the latest commit immediately,
            // not the cached deployed copy.
            fetchPromise = getFile(cfg, PARTNERS_JSON_PATH).then(function (existing) {
                if (!existing || !existing.content) return { version: 1, partners: {} };
                try {
                    return JSON.parse(atob(existing.content.replace(/\n/g, '')));
                } catch (e) {
                    return { version: 1, partners: {} };
                }
            });
        } else {
            // Fallback to public static copy
            fetchPromise = fetch(PUBLIC_PARTNERS_URL, { cache: 'no-store' })
                .then(function (r) { return r.ok ? r.json() : { partners: {} }; });
        }

        fetchPromise
            .then(function (data) {
                partnersCache = (data && data.partners) ? data.partners : {};
                renderList(partnersCache);
            })
            .catch(function (err) {
                $listContent.innerHTML = '<p class="wl-list-empty">Could not load list: ' + escapeHtml(err.message) + '</p>';
            });
    }

    function renderList(partners) {
        var codes = Object.keys(partners).sort();
        if (codes.length === 0) {
            $listContent.innerHTML = '<p class="wl-list-empty">No branded pages yet. Create one above.</p>';
            return;
        }
        var html = codes.map(function (code) {
            var p = partners[code] || {};
            var logoSrc = p.logoPath || '';
            var color = p.brandColor || '#142e59';
            var url = SHARE_BASE_URL + '?via=' + encodeURIComponent(code);
            return '' +
                '<div class="wl-list-item">' +
                    '<div class="wl-list-logo">' +
                        (logoSrc ? '<img src="' + escapeAttr(logoSrc) + '" alt="' + escapeAttr(code) + ' logo">' : '') +
                    '</div>' +
                    '<div class="wl-list-body">' +
                        '<p class="wl-list-code">' + escapeHtml(code) + '</p>' +
                        '<div class="wl-list-meta">' +
                            '<span class="wl-color-chip">' +
                                '<span class="wl-color-chip-dot" style="background:' + escapeAttr(color) + '"></span>' +
                                escapeHtml(color.toUpperCase()) +
                            '</span>' +
                            '<a class="wl-list-link" href="' + escapeAttr(url) + '" target="_blank" rel="noopener">' + escapeHtml(url) + '</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="wl-list-actions">' +
                        '<a class="wl-link" href="' + escapeAttr(url) + '" target="_blank" rel="noopener">Preview</a>' +
                        '<button type="button" class="wl-link" data-edit="' + escapeAttr(code) + '">Edit</button>' +
                        '<button type="button" class="wl-link wl-link-danger" data-delete="' + escapeAttr(code) + '">Delete</button>' +
                        '<button type="button" class="wl-link" data-copy="' + escapeAttr(url) + '">Copy link</button>' +
                    '</div>' +
                '</div>';
        }).join('');
        $listContent.innerHTML = html;

        Array.prototype.forEach.call($listContent.querySelectorAll('[data-edit]'), function (btn) {
            btn.addEventListener('click', function () {
                enterEditMode(btn.getAttribute('data-edit'));
            });
        });
        Array.prototype.forEach.call($listContent.querySelectorAll('[data-delete]'), function (btn) {
            btn.addEventListener('click', function () {
                deletePartner(btn.getAttribute('data-delete'));
            });
        });
        Array.prototype.forEach.call($listContent.querySelectorAll('[data-copy]'), function (btn) {
            btn.addEventListener('click', function () {
                var temp = document.createElement('input');
                temp.value = btn.getAttribute('data-copy') || '';
                document.body.appendChild(temp);
                temp.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(temp);
                btn.textContent = 'Copied!';
                setTimeout(function () { btn.textContent = 'Copy link'; }, 1500);
            });
        });
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(s) { return escapeHtml(s); }
})();
