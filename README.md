# Iron Architect — GitHub Pages Deployment

## Folder Structure

```
iron-architect/
├── index.html              # Dashboard
├── curriculum.html         # Curriculum index
├── labs.html               # Labs archive
├── research.html           # Research archive
├── tools.html              # Tools built
├── contact.html            # Contact form
├── paper.html              # Single paper viewer (dynamic via ?code=)
│
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── auth.js         # Owner mode gate (SHA-256)
│       ├── content.js      # Markdown parser + loader
│       ├── dashboard.js    # Dashboard population
│       ├── curriculum.js   # Curriculum filter table
│       ├── contact.js      # Contact form (Formspree)
│       └── labs.js         # Labs archive
│
├── content/                # Markdown source files
│   ├── CSC-1-1-TH.md
│   ├── CSC-1-1-PR.md
│   └── ...
│
├── data/
│   ├── manifest.json       # Dashboard metrics (auto-generated or hand-edited)
│   └── curriculum.json     # Full paper list
│
└── _config.yml             # GitHub Pages config
```

## GitHub Pages Setup

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set Source: `main` branch, `/ (root)`.
4. Your site will be live at `https://yourusername.github.io/iron-architect/`.

## Contact Form Setup (Formspree)

1. Register at https://formspree.io (free tier: 50 submissions/month).
2. Create a new form, set your email as recipient.
3. Copy the endpoint URL (e.g. `https://formspree.io/f/xabcdef`).
4. Open `assets/js/contact.js` and replace:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID';
   ```
5. Your email is **never exposed in source code**.

## Owner Mode Setup

1. Choose a strong passphrase.
2. Generate its SHA-256 hash:
   ```bash
   echo -n "your-passphrase" | sha256sum
   # or in Node.js:
   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('your-passphrase').digest('hex'))"
   ```
3. Open `assets/js/auth.js` and replace `OWNER_KEY_HASH` with the output hash.
4. Deploy. Click the ⚿ icon in the header to authenticate.

Owner mode unlocks:
- Private Markdown files (`visibility: private` in frontmatter)
- Private lab execution details
- Internal checklists

## Markdown Frontmatter Schema

```yaml
---
code: CSC-1-1-TH
title: Computer Architecture Foundations
semester: 1
track: CSC           # CSC | AAI
type: TH             # TH (Theory) | PR (Practical)
status: In Progress  # Not Started | In Progress | Mastered
difficulty: Advanced # Beginner | Intermediate | Advanced
tags: [architecture, memory, os]
version: 1.0
visibility: public   # public | private
certifications: [Security+, OSCP]
---
```

## Updating Dashboard Metrics

Edit `data/manifest.json` to update progress bars, metrics, and recent activity.
Future enhancement: auto-generate this file from a GitHub Actions workflow that scans `content/*.md` and counts statuses.

## GitHub Actions (Optional Auto-Build)

Create `.github/workflows/update-manifest.yml`:

```yaml
name: Update Manifest
on:
  push:
    paths: ['content/**/*.md']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node scripts/generate-manifest.js
      - uses: EndBug/add-and-commit@v9
        with:
          message: 'chore: update manifest'
```

## Security Notes

- No inline JavaScript anywhere.
- Content Security Policy header on every page.
- All Markdown rendered through a sanitizer (strips `<script>`, `<iframe>`, etc.).
- Owner key stored as SHA-256 hash only — raw password never in source.
- Formspree handles email — address never in source code.
- Private content (`visibility: private`) is never fetched in Public mode.
- Rate limiting on both auth (5 attempts / 15 min) and contact form (1 / 60s).
