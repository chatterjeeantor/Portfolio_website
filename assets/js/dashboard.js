/**
 * dashboard.js — Iron Architect
 * Loads content manifests and populates the dashboard.
 * Falls back gracefully if data files are missing.
 */

(function () {
  'use strict';

  const DEMO_DATA = {
    metrics: { labs: 0, papers: 0, tools: 0, certs: '0' },
    cscSec:  { progress: 0, papers: [] },
    aai:     { progress: 0, papers: [] },
    semester: { current: 0, name: '', timeline: [] },
    recentLabs: [],
    recentResearch: [],
    certifications: []
  };

  const $ = (id) => document.getElementById(id);
  const { statusBadge } = window.IronArchContent;

  function setMetric(key, value) {
    const el = document.querySelector(`[data-metric="${key}"]`);
    if (el) el.textContent = value;
  }

  function setProgress(pctEl, barEl, progress) {
    const p = $(pctEl);
    const b = $(barEl);
    if (p) p.textContent = `Progress: ${progress}%`;
    if (b) {
      b.style.width = `${progress}%`;
      b.closest('[role="progressbar"]') && b.closest('[role="progressbar"]').setAttribute('aria-valuenow', progress);
    }
  }

  function renderPaperList(listEl, papers) {
    if (!listEl) return;
    listEl.innerHTML = papers.map(p => `
      <li class="paper-item">
        <span>
          <span class="paper-code">${p.code}:</span>
          ${p.title}
        </span>
        ${statusBadge(p.status)}
      </li>
    `).join('');
  }

  function renderTimeline(data) {
    const el = $('sem-timeline');
    if (!el) return;
    el.innerHTML = data.timeline.map((item) => `
      <div class="timeline-item${item.current ? ' current' : ''}">
        <span class="tl-code">${item.code}:</span> ${item.title}
        ${item.current ? '<span class="timeline-dot" aria-label="Current position"></span>' : ''}
      </div>
    `).join('');
  }

  function renderRecentLabs(items) {
    const el = $('recent-labs');
    if (!el) return;
    el.innerHTML = items.map(item => `
      <li class="activity-item">
        <a href="labs.html">${item.title}</a>
      </li>
    `).join('');
  }

  function renderRecentResearch(items) {
    const el = $('recent-research');
    if (!el) return;
    el.innerHTML = items.map(item => `
      <li class="activity-item">
        <a href="research.html">${item.title}</a>
        ${item.version ? `<span class="item-version">(${item.version})</span>` : ''}
      </li>
    `).join('');
  }

  function renderCerts(certs) {
    const el = $('cert-list');
    if (!el) return;
    el.innerHTML = certs.map(c => `
      <li class="activity-item cert-item">
        <span>${c.name}</span>
        ${c.done
          ? `<span class="cert-status-done" aria-label="Completed">✓</span>`
          : `<span class="cert-check" aria-label="Not completed"></span>`}
      </li>
    `).join('');
  }

  function loadRecentPoW() {
    var container = $('recent-pow');
    if (!container) return;
    fetch('data/pow.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var entries = (data.pow || []).slice(0, 3);
        if (!entries.length) {
          container.innerHTML = '<li class="activity-item" style="color:var(--text-muted);font-size:12px;">No proof of work logged yet.</li>';
          return;
        }
        container.innerHTML = '';
        entries.forEach(function (e) {
          var li = document.createElement('li');
          li.className = 'activity-item';
          var d = e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
          li.innerHTML = '<span class="paper-code">' + e.code + '</span> ' + (e.title || e.description || '') + '<span style="float:right;font-size:11px;color:var(--text-muted);">' + d + '</span>';
          container.appendChild(li);
        });
      })
      .catch(function () {
        container.innerHTML = '<li class="activity-item">Failed to load.</li>';
      });
  }

  async function loadDashboard() {
    let data = DEMO_DATA;

    try {
      const manifest = await window.IronArchContent.fetchManifest('data/manifest.json');
      if (manifest && manifest.metrics) data = manifest;
    } catch {
      // Use demo data silently
    }

    setMetric('labs',   data.metrics.labs);
    setMetric('papers', data.metrics.papers);
    setMetric('tools',  data.metrics.tools);
    setMetric('certs',  data.metrics.certs);

    setProgress('csc-sec-pct', 'csc-sec-bar', data.cscSec.progress);
    renderPaperList($('csc-sec-papers'), data.cscSec.papers);

    setProgress('aai-pct', 'aai-bar', data.aai.progress);
    renderPaperList($('aai-papers'), data.aai.papers);

    renderTimeline(data.semester);
    renderRecentLabs(data.recentLabs);
    renderRecentResearch(data.recentResearch);
    renderCerts(data.certifications);

    loadRecentPoW();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
  } else {
    loadDashboard();
  }

})();
