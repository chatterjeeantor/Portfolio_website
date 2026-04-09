/**
 * labs.js — Iron Architect
 * Renders labs archive with filter controls.
 */

(function () {
  'use strict';

  var grid       = document.getElementById('labs-grid');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var allLabs    = [];
  var activeFilter = 'all';

  function render() {
    if (!grid) return;
    var visible = activeFilter === 'all' ? allLabs : allLabs.filter(function (l) {
      return l.track === activeFilter || l.difficulty === activeFilter;
    });
    if (!visible.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);padding:20px;">No labs match this filter.</p>';
      return;
    }
    grid.innerHTML = visible.map(function (lab) {
      return '<div class="lab-card" data-track="' + lab.track + '" data-difficulty="' + lab.difficulty + '">' +
        '<div class="lab-card-header">' +
          '<span class="lab-code">' + lab.code + '</span>' +
          '<span class="lab-title">' + lab.title + '</span>' +
        '</div>' +
        '<p class="lab-desc">' + (lab.description || '') + '</p>' +
        '<div class="lab-tags">' +
          (lab.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  fetch('data/labs.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allLabs = Array.isArray(data) ? data : (data.labs || []);
      render();
    })
    .catch(function () {
      if (grid) grid.innerHTML = '<p style="color:var(--text-muted);padding:20px;">No labs logged yet.</p>';
    });

})();
