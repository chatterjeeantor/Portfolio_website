(function () {
  'use strict';

  var allEntries = [];

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function render(entries) {
    var tbody = document.getElementById('pow-tbody');
    if (!tbody) return;
    if (!entries.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;color:var(--text-muted);">No entries match this filter.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    entries.forEach(function (e) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td style="white-space:nowrap;font-size:12px;">' + formatDate(e.date) + '</td>' +
        '<td class="paper-code">' + e.code + '</td>' +
        '<td>' + (e.description || e.title || '—') + '</td>' +
        '<td><span class="track-tag">' + e.track + '</span></td>' +
        '<td>' + e.semester + '</td>';
      tbody.appendChild(tr);
    });
  }

  function initFilters() {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.filter;
        if (f === 'all') { render(allEntries); return; }
        render(allEntries.filter(function (e) {
          return e.track === f || String(e.semester) === f;
        }));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    fetch('data/pow.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allEntries = data.pow || [];
        render(allEntries);
      })
      .catch(function () {
        var tbody = document.getElementById('pow-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;">Failed to load data.</td></tr>';
      });
  });
})();
