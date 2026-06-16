var fs = require('fs');
var md = fs.readFileSync(__dirname + '/../docs/exp4-report.md', 'utf8');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmt(s) {
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/`([^`\n]+)`/g, '<code class="inline">$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

var lines = md.split('\n');
var html = '';
var tbl = [];
var inCode = false, codeTxt = '', codeLang = '';
var inList = false, listTag = '';

function flushTbl() {
  if (!tbl.length) return '';
  var t = '<table>';
  tbl.forEach(function(row, i) {
    t += '<tr>';
    row.forEach(function(cell) {
      var tag = i === 0 ? 'th' : 'td';
      t += '<' + tag + '>' + fmt(cell.trim()) + '</' + tag + '>';
    });
    t += '</tr>';
  });
  t += '</table>';
  tbl = [];
  return t;
}

function flushList() {
  if (!inList) return '';
  inList = false;
  var t = listTag;
  listTag = '';
  return '</' + t + '>';
}

function isSep(l) { return /^\|?[\s]*:?-{3,}:?[\s]*\|/.test(l) && /\|[\s:-]+\|/.test(l); }

function parseRow(l) {
  return l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(function(c) { return c.trim(); });
}

for (var i = 0; i < lines.length; i++) {
  var line = lines[i];

  if (line.indexOf('```') === 0) {
    if (inCode) {
      html += '<pre><code class="language-' + codeLang + '">' + esc(codeTxt.trimEnd()) + '</code></pre>';
      codeTxt = ''; codeLang = ''; inCode = false;
    } else {
      html += flushTbl() + flushList();
      inCode = true;
      codeLang = line.slice(3).trim();
    }
    continue;
  }

  if (inCode) { codeTxt += line + '\n'; continue; }
  if (isSep(line)) continue;

  if (line.indexOf('|') === 0 && line.lastIndexOf('|') === line.length - 1) {
    if (!tbl.length) html += flushList();
    tbl.push(parseRow(line));
    var next = i + 1 < lines.length ? lines[i + 1] : '';
    if (!((next.indexOf('|') === 0 && next.lastIndexOf('|') === next.length - 1) || isSep(next))) {
      html += flushTbl();
    }
    continue;
  }

  if (tbl.length) html += flushTbl();

  if (/^(-{3,}|\*{3,})$/.test(line.trim())) { html += flushList() + '<hr>'; continue; }
  if (line.indexOf('#### ') === 0) { html += flushList() + '<h4>' + fmt(line.slice(5)) + '</h4>'; continue; }
  if (line.indexOf('### ') === 0) { html += flushList() + '<h3>' + fmt(line.slice(4)) + '</h3>'; continue; }
  if (line.indexOf('## ') === 0) { html += flushList() + '<h2>' + fmt(line.slice(3)) + '</h2>'; continue; }
  if (line.indexOf('# ') === 0) { html += flushList() + '<h1>' + fmt(line.slice(2)) + '</h1>'; continue; }

  if (line.indexOf('> ') === 0) { html += flushList() + '<blockquote>' + fmt(line.slice(2)) + '</blockquote>'; continue; }

  var olM = line.match(/^(\d+)\.\s+(.+)/);
  if (olM) {
    if (!inList || listTag !== 'ol') { html += flushList(); inList = true; listTag = 'ol'; html += '<ol>'; }
    html += '<li>' + fmt(olM[2]) + '</li>';
    continue;
  }

  if (/^[-*+]\s+/.test(line)) {
    if (!inList || listTag !== 'ul') { html += flushList(); inList = true; listTag = 'ul'; html += '<ul>'; }
    html += '<li>' + fmt(line.replace(/^[-*+]\s+/, '')) + '</li>';
    continue;
  }

  if (inList && line.trim() === '') { html += flushList(); continue; }
  if (line.trim()) html += flushList() + '<p>' + fmt(line) + '</p>';
}

html += flushTbl() + flushList();
if (inCode) html += '<pre><code class="language-' + codeLang + '">' + esc(codeTxt.trimEnd()) + '</code></pre>';

var css = '@page{size:A4;margin:2cm 2.5cm}body{font-family:"SimSun","宋体","Microsoft YaHei",serif;font-size:12pt;line-height:1.8;color:#000;max-width:210mm;margin:0 auto;padding:2cm}h1{font-family:"SimHei","黑体","Microsoft YaHei",sans-serif;font-size:16pt;text-align:center;margin-bottom:24pt;border-bottom:2px solid #333;padding-bottom:12pt}h2{font-family:"SimHei","黑体","Microsoft YaHei",sans-serif;font-size:14pt;margin-top:24pt;margin-bottom:12pt}h3{font-family:"SimHei","黑体","Microsoft YaHei",sans-serif;font-size:13pt;margin-top:18pt;margin-bottom:8pt}h4{font-family:"SimHei","黑体","Microsoft YaHei",sans-serif;font-size:12pt;margin-top:12pt;margin-bottom:6pt}table{width:100%;border-collapse:collapse;margin:12pt 0 16pt 0;font-size:10.5pt;page-break-inside:avoid}th,td{border:1px solid #000;padding:5pt 8pt;vertical-align:top;text-align:left}th{background-color:#d9e2f3;font-weight:bold;font-family:"SimHei","黑体","Microsoft YaHei",sans-serif}tr:nth-child(even) td{background-color:#f2f2f2}code.inline{background:#f0f0f0;border:1px solid #ccc;padding:1pt 4pt;font-family:"Consolas","Courier New",monospace;font-size:9pt}pre{background:#f5f5f5;border:1px solid #ccc;padding:10pt;font-family:"Consolas","Courier New",monospace;font-size:9pt;line-height:1.5;overflow-x:auto;white-space:pre-wrap;word-break:break-all}pre code{background:none;border:none;padding:0}blockquote{border-left:3px solid #999;margin:8pt 0;padding:4pt 12pt;background:#f9f9f9;color:#333}hr{border:none;border-top:1px solid #ccc;margin:16pt 0}ul,ol{margin:6pt 0;padding-left:24pt}li{margin:2pt 0}p{margin:6pt 0;text-indent:2em}p:first-of-type{text-indent:0}strong{font-family:"SimHei","黑体","Microsoft YaHei",sans-serif}a{color:#0563c1;text-decoration:underline}';
var title = '实验四：独立迭代、代码审查与持续集成 — 实验报告';
var out = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<title>' + title + '</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + html + '\n</body>\n</html>';

fs.writeFileSync(__dirname + '/../docs/exp4-report.html', out, 'utf8');
console.log('Done: docs/exp4-report.html');
