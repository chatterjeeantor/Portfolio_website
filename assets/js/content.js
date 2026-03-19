(function () {
  'use strict';

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: raw };
    const yamlStr = match[1];
    const body    = match[2];
    const fm      = {};
    yamlStr.split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx < 0) return;
      const key   = line.slice(0, colonIdx).trim();
      let   value = line.slice(colonIdx + 1).trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        value = value.replace(/^['"]|['"]$/g, '');
      }
      fm[key] = value;
    });
    return { frontmatter: fm, body };
  }

  function sanitizeHTML(html) {
    const FORBIDDEN_TAGS = /<(script|iframe|object|embed|form|input|button|style|link)[^>]*>[\s\S]*?<\/\1>/gi;
    const FORBIDDEN_ATTRS = /\s(on\w+|href\s*=\s*["']?javascript:|src\s*=\s*["']?javascript:)[^>]*/gi;
    return html.replace(FORBIDDEN_TAGS, '').replace(FORBIDDEN_ATTRS, '');
  }

  function minimalMarkdown(md) {
    return md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (line) => {
        if (line.startsWith('<')) return line;
        return `<p>${line}</p>`;
      });
  }

  async function fetchMarkdown(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to fetch: ${path} (${response.status})`);
    const text = await response.text();
    return parseFrontmatter(text);
  }

  async function fetchManifest(path) {
    const response = await fetch(path);
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json) ? json : json;
  }

  function renderPaper(container, frontmatter, body) {
    const html = sanitizeHTML(minimalMarkdown(body));
    container.innerHTML = html;
  }

  function statusBadge(status) {
    const map = {
      'Mastered':    ['badge-mastered',   'Mastered'],
      'In Progress': ['badge-progress',   'In Progress'],
      'Not Started': ['badge-notstarted', 'Not Started'],
    };
    const [cls, label] = map[status] || ['badge-notstarted', status || 'Unknown'];
    return `<span class="status-badge ${cls}">${label}</span>`;
  }

  function difficultyBadge(diff) {
    const d = (diff || '').toLowerCase();
    const cls = d.includes('advanced') ? 'difficulty-advanced'
              : d.includes('intermediate') ? 'difficulty-intermediate'
              : 'difficulty-beginner';
    return `<span class="difficulty-badge ${cls}">${diff || 'Unknown'}</span>`;
  }

  function isVisible(fm) {
    if (fm.visibility === 'private') {
      return window.IronArchAuth && window.IronArchAuth.isOwner();
    }
    return true;
  }

  window.IronArchContent = {
    parseFrontmatter,
    sanitizeHTML,
    fetchMarkdown,
    fetchManifest,
    renderPaper,
    statusBadge,
    difficultyBadge,
    isVisible,
    minimalMarkdown,
  };
})();
