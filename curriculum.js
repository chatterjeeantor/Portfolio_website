/**
 * curriculum.js — Iron Architect
 * Loads curriculum manifest and renders filterable table.
 */

(function () {
  'use strict';

  // Demo data — in production, fetch from data/curriculum.json
  const DEMO_PAPERS = [
    { code: 'CSC-1-1-TH', title: 'Computer Architecture Foundations', track: 'CSC', type: 'TH', semester: 1, status: 'Mastered',    visibility: 'public' },
    { code: 'CSC-1-1-PR', title: 'Computer Architecture Lab',         track: 'CSC', type: 'PR', semester: 1, status: 'Mastered',    visibility: 'public' },
    { code: 'CSC-1-2-TH', title: 'Low-Level Logic & Problem Solving', track: 'CSC', type: 'TH', semester: 1, status: 'In Progress', visibility: 'public' },
    { code: 'CSC-1-2-PR', title: 'Low-Level Logic Lab',               track: 'CSC', type: 'PR', semester: 1, status: 'In Progress', visibility: 'private' },
    { code: 'CSC-1-3-TH', title: 'Linux Fundamentals',                track: 'CSC', type: 'TH', semester: 1, status: 'Not Started', visibility: 'public' },
    { code: 'AAI-1-1-TH', title: 'Mathematical Foundations of AI',    track: 'AAI', type: 'TH', semester: 1, status: 'In Progress', visibility: 'public' },
    { code: 'AAI-1-2-TH', title: 'Intro to Machine Learning',         track: 'AAI', type: 'TH', semester: 1, status: 'Not Started', visibility: 'public' },
    { code: 'AAI-1-3-TH', title: 'AI Security Basics',                track: 'AAI', type: 'TH', semester: 1, status: 'Not Started', visibility: 'public' },
    { code: 'CSC-2-1-TH', title: 'Network Security Fundamentals',     track: 'CSC', type: 'TH', semester: 2, status: 'Not Started', visibility: 'public' },
    { code: 'CSC-2-2-PR', title: 'Penetration Testing Basics Lab',    track: 'CSC', type: 'PR', semester: 2, status: 'Not Started', visibility: 'private' },
  ];

  const tbody = document.getElementById('curriculum-tbody');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let activeFilter = 'all';
  let papers = [];

  const { statusBadge, isVisible } = window.IronArchContent;

  function renderRow(p) {
    if (!isVisible(p)) return '';
    return `
      <tr data-track="${p.track}" data-type="${p.type}" data-status="${p.status}">
        <td class="code-cell"><a href="paper.html?code=${encodeURIComponent(p.code)}">${p.code}</a></td>
        <td><a href="paper.html?code=${encodeURIComponent(p.code)}">${p.title}</a></td>
        <td>${p.track}</td>
        <td>${p.type === 'TH' ? 'Theory' : 'Practical'}</td>
        <td>Semester ${p.semester}</td>
        <td>${statusBadge(p.status)}</td>
      </tr>
    `;
  }

  function applyFilter() {
    if (!tbody) return;
    let visible = papers;
    if (activeFilter !== 'all') {
      visible = papers.filter(p => {
        return p.track === activeFilter ||
               p.type  === activeFilter ||
               p.status === activeFilter;
      });
    }
    tbody.innerHTML = visible.map(renderRow).join('') ||
      `<tr><td colspan="6" style="color:var(--text-dim);padding:20px;text-align:center;">No papers match this filter.</td></tr>`;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  async function loadCurriculum() {
    try {
      const manifest = await window.IronArchContent.fetchManifest('data/curriculum.json');
      papers = manifest.length ? manifest : DEMO_PAPERS;
    } catch {
      papers = DEMO_PAPERS;
    }
    applyFilter();
  }

  loadCurriculum();

  // Re-render when auth changes (owner mode toggle shows private papers)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'auth-toggle') {
      setTimeout(applyFilter, 100);
    }
  });
})();
