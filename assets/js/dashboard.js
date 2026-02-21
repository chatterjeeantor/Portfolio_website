/**
 * dashboard.js — Iron Architect
 * Loads content manifests and populates the dashboard.
 * Falls back gracefully if data files are missing.
 */

(function () {
  'use strict';

  // ── Static demo data (replaced by fetched manifests in production) ──
  const DEMO_DATA = {
    metrics: { labs: 12, papers: 7, tools: 3, certs: '2 (Sec+, OSCP)' },

    cscSec: {
      progress: 28,
      papers: [
        { code: 'CSC-1-1', title: 'Computer Architecture', status: 'Mastered' },
        { code: 'CSC-1-2', title: 'Low-Level Logic', status: 'In Progress' },
        { code: 'CSC-1-3', title: 'Linux Fundamentals', status: 'Not Started' },
      ]
    },

    csCore: {
      progress: 35,
      papers: [
        { code: 'CSC-1-1', title: 'Algorithms & Structures', status: 'Mastered' },
        { code: 'CSC-1-2', title: 'Systems Programming', status: 'In Progress' },
        { code: 'CSC-1-3', title: 'C & Assembly', status: 'Not Started' },
      ]
    },

    aai: {
      progress: 20,
      papers: [
        { code: 'AAI-1-1', title: 'Math Foundations', status: 'In Progress' },
        { code: 'AAI-1-2', title: 'Intro to Machine Learning', status: 'Not Started' },
        { code: 'AAI-1-3', title: 'AI Security Basics', status: 'Not Started' },
      ]
    },

    semester: {
      current: 1,
      name: 'THE BRIDGE',
      timeline: [
        { code: 'CSC-1-1', title: 'Computer Architecture & Systems Engineering', current: false },
        { code: 'CSC-1-2', title: 'Low-Level Logic & Problem Solving', current: false },
        { code: 'AAI-1-1', title: 'Mathematical Foundations of Intelligence', current: true },
      ]
    },

    recentLabs: [
      { title: 'Buffer Overflow Exploit' },
      { title: 'Network Sniffing Tool' },
      { title: 'Basic Neural Network' },
    ],

    recentResearch: [
      { title: 'Reverse Engineering Linux Binaries', version: 'v1.2' },
      { title: 'Securing AI Model Pipelines', version: 'v1.0' },
      { title: 'Threat Analysis of IoT Devices', version: '' },
    ],

    certifications: [
      { name: 'Security+', done: true },
      { name: 'OSCP', done: true },
      { name: 'CISSP', done: false },
    ]
  };

  // ── Helpers ──
  const $ = (id) => document.getElementById(id);
  const { statusBadge } = window.IronArchContent;

  function setMetric(key, value) {
    const el = document.querySelector(`[data-metric="${key}"]`);
    if (el) el.textContent = value;
  }

  function setProgress(pctEl, barEl, progress) {
    const p = $( pctEl);
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
          <a href="paper.html?code=${encodeURIComponent(p.code)}">${p.title}</a>
        </span>
        ${statusBadge(p.status)}
      </li>
    `).join('');
  }

  function renderTimeline(data) {
    const el = $('sem-timeline');
    if (!el) return;
    el.innerHTML = data.timeline.map((item, i) => `
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

  // ── Attempt to load live data manifest, fall back to demo ──
  async function loadDashboard() {
    let data = DEMO_DATA;

    try {
      const manifest = await window.IronArchContent.fetchManifest('data/manifest.json');
      if (manifest && manifest.metrics) data = manifest;
    } catch {
      // Use demo data silently
    }

    // Metrics
    setMetric('labs',   data.metrics.labs);
    setMetric('papers', data.metrics.papers);
    setMetric('tools',  data.metrics.tools);
    setMetric('certs',  data.metrics.certs);

    // Curriculum panels
    setProgress('csc-sec-pct', 'csc-sec-bar', data.cscSec.progress);
    renderPaperList($('csc-sec-papers'), data.cscSec.papers);

    setProgress('aai-pct', 'aai-bar', data.aai.progress);
    renderPaperList($('aai-papers'), data.aai.papers);

    // Timeline
    renderTimeline(data.semester);

    // Activity
    renderRecentLabs(data.recentLabs);
    renderRecentResearch(data.recentResearch);

    // Certs
    renderCerts(data.certifications);
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
  } else {
    loadDashboard();
  }
})();
