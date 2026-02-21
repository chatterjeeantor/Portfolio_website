/**
 * contact.js — Iron Architect
 * Secure contact form via Formspree.
 *
 * SETUP:
 *  1. Go to https://formspree.io and create a free account.
 *  2. Create a new form, copy your endpoint (e.g. https://formspree.io/f/xabcdef)
 *  3. Replace FORMSPREE_ENDPOINT below with your actual endpoint.
 *  4. Formspree handles email delivery. Your address is never in source code.
 */

(function () {
  'use strict';

  // ── CONFIGURATION ──
  // Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqedypry';

  // Rate limiting: one submission per N milliseconds (client-side)
  const RATE_LIMIT_MS = 60 * 1000; // 1 minute
  const RATE_LIMIT_KEY = 'ia_contact_last_submit';

  // ── DOM refs ──
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formStatus  = document.getElementById('form-status');
  const rateWarning = document.getElementById('rate-warning');

  if (!form) return;

  // ── Validation helpers ──
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(fieldId, errId, show) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (field) field.classList.toggle('error', show);
    if (err)   err.classList.toggle('show', show);
  }

  function validateForm() {
    let valid = true;

    const name    = document.getElementById('contact-name');
    const email   = document.getElementById('contact-email');
    const message = document.getElementById('contact-message');

    // Name
    const nameOk = name && name.value.trim().length >= 2;
    showError('contact-name', 'err-name', !nameOk);
    if (!nameOk) valid = false;

    // Email
    const emailOk = email && EMAIL_RE.test(email.value.trim());
    showError('contact-email', 'err-email', !emailOk);
    if (!emailOk) valid = false;

    // Message
    const msgOk = message && message.value.trim().length >= 10;
    showError('contact-message', 'err-message', !msgOk);
    if (!msgOk) valid = false;

    return valid;
  }

  // ── Rate limiting ──
  function isRateLimited() {
    try {
      const last = parseInt(sessionStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
      return Date.now() - last < RATE_LIMIT_MS;
    } catch { return false; }
  }

  function setLastSubmit() {
    try { sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  // ── Status display ──
  function showStatus(type, message) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }

  function hideStatus() {
    if (!formStatus) return;
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }

  // ── Disable/enable submit ──
  function setSubmitting(on) {
    if (submitBtn) {
      submitBtn.disabled = on;
      submitBtn.textContent = on ? 'Sending...' : 'Send Message';
    }
  }

  // ── Submit handler ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus();

    if (isRateLimited()) {
      if (rateWarning) rateWarning.style.display = 'block';
      setTimeout(() => { if (rateWarning) rateWarning.style.display = 'none'; }, 4000);
      return;
    }

    if (!validateForm()) return;

    // Honeypot check
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return; // Bot detected, silently drop

    setSubmitting(true);

    try {
      const formData = new FormData(form);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' },
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok || result.ok) {
        setLastSubmit();
        showStatus('success', '✓ Message sent. I will respond within a few days.');
        form.reset();
      } else {
        const errMsg = result.errors
          ? result.errors.map(e => e.message).join(', ')
          : 'Submission failed. Please try again later.';
        showStatus('error', `✕ ${errMsg}`);
      }
    } catch (err) {
      showStatus('error', '✕ Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  });

  // ── Clear errors on input ──
  ['contact-name', 'contact-email', 'contact-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => el.classList.remove('error'));
    }
  });
})();
