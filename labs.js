/**
 * labs.js — Iron Architect
 * Renders labs archive with filter controls.
 */

(function () {
  'use strict';

  const DEMO_LABS = [
    {
      code: 'CSC-1-1-PR', title: 'Buffer Overflow Exploit',
      difficulty: 'Advanced', track: 'CSC', semester: 1,
      description: 'Stack-based buffer overflow on a vulnerable x86-64 binary. Develop shellcode and bypass basic stack protections.',
      tags: ['exploit', 'memory', 'gdb', 'pwntools'], visibility: 'private'
    },
    {
      code: 'CSC-1-2-PR', title: 'Network Sniffing Tool',
      difficulty: 'Intermediate', track: 'CSC', semester: 1,
      description: 'Passive network traffic capture and protocol analysis using raw sockets and libpcap on Hornet (Debian CLI).',
      tags: ['networking', 'pcap', 'python', 'scapy'], visibility: 'public'
    },
    {
      code: 'AAI-1-1-PR', title: 'Basic Neural Network',
      difficulty: 'Beginner', track: 'AAI', semester: 1,
      description: 'Implement a feedforward neural network from scratch in Python (NumPy only). Train on MNIST digit dataset.',
      tags: ['ml', 'numpy', 'classification', 'python'], visibility: 'public'
    },
    {
      code: 'CSC-1-3-PR', title: 'Linux Privilege Escalation',
      difficulty: 'Advanced', track: 'CSC', semester: 1,
      description: 'Enumerate and exploit common Linux privilege escalation vectors: SUID bits, cron jobs, writable /etc/passwd.',
      tags: ['privesc', 'linux', 'bash', 'enumeration'], visibility: 'private'
    },
  ];

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
