/**
 * auth.js — Iron Architect
 * Static client-side auth gate.
 * Uses SHA-256 hash comparison. Never stores raw password.
 *
 * To set your key hash:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('yourpassword').digest('hex'))"
 * Replace OWNER_KEY_HASH below with the output.
 */

(function () {
  'use strict';

  const OWNER_KEY_HASH = '3bf8bca03469398e13b1af4ad847d2fff3f323fa7cdedc26aede7362babdcf1e';
  const SESSION_KEY = 'ia_owner_mode';
  const RATE_LIMIT_KEY = 'ia_auth_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15 * 60 * 1000; // 15 min

  // ── DOM refs ──
  const modal      = document.getElementById('auth-modal');
  const authToggle = document.getElementById('auth-toggle');
  const authInput  = document.getElementById('auth-input');
  const authSubmit = document.getElementById('auth-submit');
  const authCancel = document.getElementById('auth-cancel');
  const authError  = document.getElementById('auth-error');
  const modeBadge  = document.getElementById('mode-badge');
  const footerMode = document.getElementById('footer-mode');

  // ── SHA-256 via Web Crypto API ──
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Rate limiting ──
  function getAttemptData() {
    try {
      const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
      return raw ? JSON.parse(raw) : { count: 0, since: Date.now() };
    } catch { return { count: 0, since: Date.now() }; }
  }

  function isLockedOut() {
    const data = getAttemptData();
    if (data.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - data.since;
      if (elapsed < LOCKOUT_MS) return true;
      sessionStorage.removeItem(RATE_LIMIT_KEY);
    }
    return false;
  }

  function recordAttempt() {
    const data = getAttemptData();
    data.count = (data.count || 0) + 1;
    if (!data.since) data.since = Date.now();
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  }

  // ── Mode management ──
  function setOwnerMode(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(SESSION_KEY, '1');
        document.body.classList.add('owner-mode');
        if (modeBadge) { modeBadge.textContent = 'OWNER'; modeBadge.className = 'mode-badge owner'; }
        if (footerMode) footerMode.textContent = 'Mode: Owner';
        if (authToggle) authToggle.textContent = '🔓';
      } else {
        localStorage.removeItem(SESSION_KEY);
        document.body.classList.remove('owner-mode');
        if (modeBadge) { modeBadge.textContent = 'PUBLIC'; modeBadge.className = 'mode-badge public'; }
        if (footerMode) footerMode.textContent = 'Mode: Public';
        if (authToggle) authToggle.textContent = '⚿';
      }
    } catch (e) {
      // localStorage unavailable (private browsing, etc.)
    }
  }

  function checkStoredSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored === '1') setOwnerMode(true);
    } catch { /* ignore */ }
  }

  // ── Modal ──
  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    if (authInput) authInput.value = '';
    if (authError) authError.hidden = true;
    setTimeout(() => authInput && authInput.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
  }

  async function handleAuth() {
    if (!authInput) return;
    const value = authInput.value.trim();
    if (!value) return;

    if (isLockedOut()) {
      if (authError) {
        authError.textContent = 'Too many attempts. Try again in 15 minutes.';
        authError.hidden = false;
      }
      return;
    }

    const hash = await sha256(value);
    if (hash === OWNER_KEY_HASH) {
      setOwnerMode(true);
      closeModal();
      sessionStorage.removeItem(RATE_LIMIT_KEY);
    } else {
      recordAttempt();
      if (authError) {
        authError.textContent = 'Invalid key. Access denied.';
        authError.hidden = false;
      }
      if (authInput) authInput.value = '';
    }
  }

  // ── Toggle: if already owner mode, clicking again logs out ──
  function handleToggle() {
    try {
      const isOwner = localStorage.getItem(SESSION_KEY) === '1';
      if (isOwner) {
        setOwnerMode(false);
      } else {
        openModal();
      }
    } catch {
      openModal();
    }
  }

  // ── Event bindings ──
  if (authToggle) authToggle.addEventListener('click', handleToggle);
  if (authCancel) authCancel.addEventListener('click', closeModal);
  if (authSubmit) authSubmit.addEventListener('click', handleAuth);

  if (authInput) {
    authInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAuth();
      if (e.key === 'Escape') closeModal();
    });
  }

  // Close modal on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ── Init ──
  checkStoredSession();

  // Expose for other scripts
  window.IronArchAuth = { isOwner: () => document.body.classList.contains('owner-mode') };
})();
