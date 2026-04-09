/**
 * curriculum.js — Iron Architect
 * Loads curriculum.json and renders filterable table.
 */

(function () {
  'use strict';

  var tbody = document.getElementById('curriculum-tbody');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var activeFilter = 'all';
  var papers = [];

  function statusClass(s) {
    if (s === 'Mastered') return 'status-mastered';
    if (s === 'In Progress' || s === 'Started') return 'status-inprogress';
    return 'status-notstarted';
  }

  function renderRows(list) {
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:var(--text-muted);text-align:center;">No papers match this filter.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function (p) {
      return '<tr>' +
        '<td class="code-cell">' + p.code + '</td>' +
        '<td>' + p.title + '</td>' +
        '<td><span class="track-tag">' + p.track + '</span></td>' +
        '<td>Semester ' + p.semester + '</td>' +
        '<td><span class="' + statusClass(p.status) + '">' + p.status + '</span></td>' +
        '</tr>';
    }).join('');
  }

  function applyFilter() {
    if (activeFilter === 'all') { renderRows(papers); return; }
    renderRows(papers.filter(function (p) {
      return p.track === activeFilter || p.status === activeFilter;
    }));
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  fetch('data/curriculum.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      papers = Array.isArray(data) ? data : (data.papers || []);
      applyFilter();
    })
    .catch(function () {
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;">Failed to load curriculum data.</td></tr>';
    });

})();
