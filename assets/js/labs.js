/**
 * labs.js — Iron Architect
 * Renders labs archive with filter controls.
 */

(function () {
  'use strict';

  const DEMO_LABS = [];

  const grid       = document.getElementById('labs-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let allLabs      = [];
  let activeFilter = 'all';

  const { difficultyBadge, isVisible } = window.IronArchContent;

  function renderCard(lab) {
    if (!isVisible(lab)) return '';
    return `
      <div class="lab-card" data-track="${lab.track}" data-difficulty="${lab.difficulty}">
        <div class="lab-card-header">
          <span class="lab-code">${lab.code}</span>
          <span class="lab-title">${lab.title}</span>
          ${difficultyBadge(lab.difficulty)}
        </div>
        <p class="lab-desc">${lab.description}</p>
        <div class="lab-tags">
          ${lab.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    if (!grid) return;
    let visible = allLabs;
    if (activeFilter !== 'all') {
      visible = allLabs.filter(l =>
        l.track === activeFilter || l.difficulty === activeFilter
      );
    }
    const html = visible.map(renderCard).join('');
    grid.innerHTML = html || '<p style="color:var(--text-dim);padding:20px;">No labs match this filter.</p>';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  async function loadLabs() {
    try {
      const data = await window.IronArchContent.fetchManifest('data/labs.json');
      allLabs = data.length ? data : DEMO_LABS;
    } catch {
      allLabs = DEMO_LABS;
    }
    render();
  }

  loadLabs();
})();
