const fs = require('fs');
const path = require('path');

const md = fs.readFileSync(
  path.join(__dirname, '..', 'docs', 'exp4-report.md'),
  'utf-8'
);

// ---- helpers ----
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inline formatting
function formatInline(text) {
  // bold **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic *text*
  text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
  // inline code `code`
  text = text.replace(/`([^`\n]+)`/g, '<code class="inline">$1</code>');
  // links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

// ---- parse ----
const lines = md.split('\n');
let html = '';
let inTable = false;
let tableRows = [];
let inCodeBlock = false;
let codeContent = '';
let codeLang = '';
let inList = false;
let listType = ''; // 'ul' | 'ol'

function flushTable() {
  if (tableRows.length === 0) return '';
  let t = '<table>';
  tableRows.forEach((row, i) => {
    t += '<tr>';
    row.forEach(cell => {
      const tag = i === 0 ? 'th' : 'td';
      t += `<${tag}>${formatInline(cell.trim())}</${tag}>`;
    });
    t += '</tr>';
  });
  t += '</table>';
  tableRows = [];
  return t;
}

function flushList() {
  if (!inList) return '';
  inList = false;
  const tag = listType;
  listType = '';
  return `</${tag}>`;
}

function isTableSep(line) {
  return /^\|?[\s]*:?-{3,}:?[\s]*\|/.test(line) && /\|[\s:-]+\|/.test(line);
}

function parseRow(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => c.trim());
}

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  let line = raw;

  // Code block toggle
  if (line.startsWith('```')) {
    if (inCodeBlock) {
      html += `<pre><code class="language-${codeLang}">${escapeHtml(codeContent.trimEnd())}</code></pre>`;
      codeContent = '';
      codeLang = '';
      inCodeBlock = false;
      continue;
    } else {
      html += flushTable();
      html += flushList();
      inCodeBlock = true;
      codeLang = line.slice(3).trim();
      continue;
    }
  }

  if (inCodeBlock) {
    codeContent += line + '\n';
    continue;
  }

  // Table separator line
  if (isTableSep(line)) {
    continue; // skip separator, already captured header row
  }

  // Table row
  if (line.startsWith('|') && line.endsWith('|')) {
    if (!inTable) {
      html += flushList();
      inTable = true;
    }
    tableRows.push(parseRow(line));
    // Peek ahead — if next line is NOT a table row, flush
    const next = i + 1 < lines.length ? lines[i + 1] : '';
    const nextIsTable =
      (next.startsWith('|') && next.endsWith('|')) || isTableSep(next);
    if (!nextIsTable) {
      html += flushTable();
      inTable = false;
    }
    continue;
  }

  // If we were in a table but current line is not table, flush it
  if (inTable) {
    html += flushTable();
    inTable = false;
  }

  // Horizontal rule
  if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
    html += flushList();
    html += '<hr>';
    continue;
  }

  // Headers
  if (line.startsWith('#### ')) {
    html += flushList();
    html += `<h4>${formatInline(line.slice(5))}</h4>`;
    continue;
  }
  if (line.startsWith('### ')) {
    html += flushList();
    html += `<h3>${formatInline(line.slice(4))}</h3>`;
    continue;
  }
  if (line.startsWith('## ')) {
    html += flushList();
    html += `<h2>${formatInline(line.slice(3))}</h2>`;
    continue;
  }
  if (line.startsWith('# ')) {
    html += flushList();
    html += `<h1>${formatInline(line.slice(2))}</h1>`;
    continue;
  }

  // Blockquote
  if (line.startsWith('> ')) {
    html += flushList();
    html += `<blockquote>${formatInline(line.slice(2))}</blockquote>`;
    continue;
  }

  // Ordered list
  const olMatch = line.match(/^(\d+)\.\s+(.+)/);
  if (olMatch) {
    if (!inList || listType !== 'ol') {
      html += flushList();
      inList = true;
      listType = 'ol';
      html += '<ol>';
    }
    html += `<li>${formatInline(olMatch[2])}</li>`;
    continue;
  }

  // Unordered list
  if (/^[-*+]\s+/.test(line)) {
    if (!inList || listType !== 'ul') {
      html += flushList();
      inList = true;
      listType = 'ul';
      html += '<ul>';
    }
    html += `<li>${formatInline(line.replace(/^[-*+]\s+/, ''))}</li>`;
    continue;
  }

  // End list on blank line or non-list content
  if (inList && line.trim() === '') {
    html += flushList();
    continue;
  }

  // Paragraph (non-empty)
  if (line.trim()) {
    html += flushList();
    html += `<p>${formatInline(line)}</p>`;
  }
}

// Flush any remaining
html += flushTable();
html += flushList();
if (inCodeBlock) {
  html += `<pre><code class="language-${codeLang}">${escapeHtml(codeContent.trimEnd())}</code></pre>`;
}

// ---- Word-compatible wrapper ----
const title = '实验四：独立迭代、代码审查与持续集成 — 实验报告';

const fullDoc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="generator" content="Claude Code md2word">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 2cm 2.5cm;
  }
  body {
    font-family: "SimSun", "宋体", "Microsoft YaHei", serif;
    font-size: 12pt;
    line-height: 1.8;
    color: #000;
    max-width: 210mm;
    margin: 0 auto;
    padding: 2cm;
  }
  h1 {
    font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
    font-size: 16pt;
    text-align: center;
    margin-bottom: 24pt;
    border-bottom: 2px solid #333;
    padding-bottom: 12pt;
  }
  h2 {
    font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
    font-size: 14pt;
    margin-top: 24pt;
    margin-bottom: 12pt;
  }
  h3 {
    font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
    font-size: 13pt;
    margin-top: 18pt;
    margin-bottom: 8pt;
  }
  h4 {
    font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
    font-size: 12pt;
    margin-top: 12pt;
    margin-bottom: 6pt;
  }
  /* ── Table styling (Word-compatible) ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0 16pt 0;
    font-size: 10.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #000;
    padding: 5pt 8pt;
    vertical-align: top;
    text-align: left;
  }
  th {
    background-color: #d9e2f3;
    font-weight: bold;
    font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
  }
  tr:nth-child(even) td {
    background-color: #f2f2f2;
  }
  /* inline code */
  code.inline {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 1pt 4pt;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 9pt;
  }
  /* code blocks */
  pre {
    background: #f5f5f5;
    border: 1px solid #ccc;
    padding: 10pt;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 9pt;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  pre code { background: none; border: none; padding: 0; }
  blockquote {
    border-left: 3px solid #999;
    margin: 8pt 0;
    padding: 4pt 12pt;
    background: #f9f9f9;
    color: #333;
  }
  hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 16pt 0;
  }
  ul, ol {
    margin: 6pt 0;
    padding-left: 24pt;
  }
  li { margin: 2pt 0; }
  p { margin: 6pt 0; text-indent: 2em; }
  p:first-of-type { text-indent: 0; }
  strong { font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif; }
  a { color: #0563c1; text-decoration: underline; }
</style>
</head>
<body>
${html}
</body>
</html>`;

const outPath = path.join(__dirname, '..', 'docs', 'exp4-report.html');
fs.writeFileSync(outPath, fullDoc, 'utf-8');
console.log('Done → ' + outPath);
