/**
 * npm run check — T20 內容規則與品質檢查
 * 任一項失敗就回報錯誤並以非 0 結束（exit code 1）。
 * 執行前請先 `npm run build`（package.json 的 check script 已經會自動先 build 一次）。
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const siteDir = path.join(repoRoot, '_site');
const srcDir = path.join(repoRoot, 'src');

let hasFailure = false;
const results = [];

function report(name, ok, details) {
  results.push({ name, ok, details: details || [] });
  if (!ok) hasFailure = true;
}

function walk(dir, filter) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walk(full, filter));
    } else if (!filter || filter(full)) {
      out.push(full);
    }
  }
  return out;
}

const htmlFiles = walk(siteDir, (f) => f.endsWith('.html'));

// ──────────────────────────────────────────────
// 1. 密鑰 / token / 密碼樣式掃描
// ──────────────────────────────────────────────
function checkSecrets() {
  const patterns = [
    { name: 'Google API Key', re: /AIza[0-9A-Za-z_-]{35}/ },
    { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private Key Block', re: /-----BEGIN (RSA |EC |)PRIVATE KEY-----/ },
    { name: 'password 賦值', re: /password\s*[:=]\s*['"][^'"]+['"]/i },
    { name: 'api[-_]?key 賦值', re: /api[-_]?key\s*[:=]\s*['"][^'"]+['"]/i },
    { name: 'secret 賦值', re: /\bsecret\s*[:=]\s*['"][^'"]+['"]/i },
    { name: 'Bearer token', re: /Bearer\s+[A-Za-z0-9\-._~+/]{20,}/ },
  ];
  const scanFiles = walk(srcDir, (f) => /\.(njk|js|json|css|html)$/.test(f));
  const errors = [];
  scanFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf8');
    patterns.forEach((p) => {
      if (p.re.test(content)) {
        errors.push(`${path.relative(repoRoot, f)}：疑似出現 ${p.name}`);
      }
    });
  });
  report('1. 密鑰/token/密碼樣式掃描', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 2. 內部檔案是否被 git 追蹤
// ──────────────────────────────────────────────
function checkInternalFilesNotTracked() {
  const { execSync } = require('child_process');
  let tracked;
  try {
    tracked = execSync('git ls-files', { cwd: repoRoot, encoding: 'utf8' }).split('\n');
  } catch (e) {
    report('2. 內部檔案是否被 git 追蹤', false, ['無法執行 git ls-files：' + e.message]);
    return;
  }
  const forbiddenPatterns = [
    /^CLAUDE\.md$/,
    /^SPEC_網站規格\.md$/,
    /^TASKS_修改任務清單\.md$/,
    /^COPY_REVIEW\.md$/,
    /^UNDERSTANDING_交接理解摘要\.md$/,
    /^AMPINTEC-PLUS_網站規劃\.md$/,
    /^task\.md$/,
    /^LEGAL_.*\.md$/,
    /^docs\/repo-setup\.md$/,
    /^docs\/apps-script\.gs\.txt$/,
    /^docs\/ga4-admin-notes\.md$/,
  ];
  const errors = [];
  tracked.forEach((f) => {
    if (forbiddenPatterns.some((re) => re.test(f))) {
      errors.push(`內部文件被 git 追蹤：${f}`);
    }
  });
  report('2. 內部檔案是否被 git 追蹤', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 3. 交期「7 天起」一致性
// ──────────────────────────────────────────────
function checkLeadTime() {
  const errors = [];
  htmlFiles.forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const m = html.match(/<span class="stat-number" id="stat-lead"[^>]*>([^<]*)<\/span>/);
    if (m) {
      const text = m[1].trim();
      const isZh = f.includes(`${path.sep}zh${path.sep}`);
      const expected = isZh ? '7 天起' : '7 Days';
      if (text !== expected) {
        errors.push(`${path.relative(siteDir, f)}：stat-lead 文字是「${text}」，預期「${expected}」`);
      }
    }
  });
  report('3. 交期「7 天起」一致性', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 4. 證書僅 AS9100D / ISO 9001（無範圍／編號／發證單位／有效期限）
// ──────────────────────────────────────────────
function checkCertifications() {
  // 這幾個詞彙本身在法律頁（Terms 的報價條款、Privacy 的各種「issued」用法等）可能合法出現，
  // 所以不整頁掃描，只在 AS9100D／ISO 9001 字樣「附近」出現時才視為違規（避免誤判）。
  const certMentionRe = /AS9100D|ISO\s*9001/gi;
  const forbiddenNear = [
    /AEROSPACE STANDARD/i,
    /QUALITY MANAGEMENT/i,
    /證書編號/,
    /發證單位/,
    /有效期限/,
    /certificate\s*(no\.?|number)/i,
    /certif\w*\s+issued\s+by/i,
    /scope\s+of\s+(certification|certificate)/i,
    /valid\s+(until|through)\s+\d/i,
    /expir(y|ation|es)\b/i,
  ];
  const WINDOW = 120;
  const errors = [];
  htmlFiles.forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const text = html.replace(/<[^>]+>/g, ' ');
    let m;
    while ((m = certMentionRe.exec(text)) !== null) {
      const start = Math.max(0, m.index - WINDOW);
      const end = Math.min(text.length, m.index + m[0].length + WINDOW);
      const window = text.slice(start, end);
      forbiddenNear.forEach((re) => {
        if (re.test(window)) {
          errors.push(`${path.relative(siteDir, f)}：「${m[0]}」附近出現疑似認證範圍/編號/發證單位/有效期限文字（符合 ${re}）`);
        }
      });
    }
  });
  report('4. 證書僅 AS9100D／ISO 9001', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 5. 無價格字樣（檢查實際金額樣式，不檢查「報價」一詞本身）
// ──────────────────────────────────────────────
function checkNoPricing() {
  const patterns = [
    /NT\$\s?\d/,
    /US\$\s?\d/,
    /\$\s?\d{1,3}(,\d{3})*(\.\d+)?/,
    /新台幣\s?\d/,
    /台幣\s?\d/,
    /報價[:：]\s?\d/,
    /單價[:：]\s?\d/,
  ];
  const errors = [];
  htmlFiles.forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    patterns.forEach((re) => {
      const m = html.match(re);
      if (m) {
        errors.push(`${path.relative(siteDir, f)}：出現疑似價格字樣「${m[0]}」`);
      }
    });
  });
  report('5. 無價格字樣', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 6. 中英文 i18n key 一致
// ──────────────────────────────────────────────
function collectKeyPaths(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(collectKeyPaths(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function checkI18nKeys() {
  const zh = JSON.parse(fs.readFileSync(path.join(srcDir, '_data/i18n/zh.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(srcDir, '_data/i18n/en.json'), 'utf8'));
  const zhKeys = new Set(collectKeyPaths(zh));
  const enKeys = new Set(collectKeyPaths(en));
  const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k));
  const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k));
  const errors = [];
  missingInEn.forEach((k) => errors.push(`en.json 缺少 key：${k}`));
  missingInZh.forEach((k) => errors.push(`zh.json 缺少 key：${k}`));
  report(`6. 中英文 i18n key 一致（共 ${zhKeys.size} 個）`, errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 7. 內部連結無斷鏈
// ──────────────────────────────────────────────
function checkInternalLinks() {
  const errors = [];

  function resolveTarget(linkPath) {
    let clean = linkPath.split('#')[0].split('?')[0];
    if (!clean) return null; // 純 #anchor，不檢查
    let filePath = path.join(siteDir, clean);
    if (clean.endsWith('/')) filePath = path.join(filePath, 'index.html');
    return filePath;
  }

  htmlFiles.forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const matches = [...html.matchAll(/(?:href|src)="([^"]+)"/g)];
    matches.forEach((m) => {
      const link = m[1];
      if (!link.startsWith('/')) return; // 只檢查站內的根相對路徑連結
      if (link.startsWith('//')) return; // protocol-relative，視為外部
      const target = resolveTarget(link);
      if (!target) return;
      if (!fs.existsSync(target)) {
        // 嘗試不加 index.html（例如直接檔案，如 /favicon.ico）
        const asFile = path.join(siteDir, link.split('#')[0].split('?')[0]);
        if (!fs.existsSync(asFile)) {
          errors.push(`${path.relative(siteDir, f)}：連結 "${link}" 找不到對應檔案`);
        }
      }
    });
  });
  report('7. 內部連結無斷鏈', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 8. noindex 仍存在
// ──────────────────────────────────────────────
function checkNoindex() {
  const siteJson = JSON.parse(fs.readFileSync(path.join(srcDir, '_data/site.json'), 'utf8'));
  const errors = [];
  if (siteJson.indexing !== false) {
    errors.push(`site.json 的 indexing 目前是 ${siteJson.indexing}，預期 false（尚未正式上線前應保持 noindex）`);
  }
  htmlFiles.forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    if (!/<meta\s+name="robots"\s+content="noindex,\s*nofollow">/.test(html)) {
      errors.push(`${path.relative(siteDir, f)}：找不到 noindex meta tag`);
    }
  });
  report('8. noindex 仍存在', errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 9. 圖片無 EXIF/GPS
// ──────────────────────────────────────────────
function checkImageExif() {
  const imgFiles = [
    ...walk(path.join(srcDir, 'assets/img'), (f) => /\.(webp|png|jpe?g)$/i.test(f)),
    path.join(srcDir, 'favicon.ico'),
    path.join(srcDir, 'apple-touch-icon.png'),
  ].filter((f) => fs.existsSync(f));

  const errors = [];
  imgFiles.forEach((f) => {
    const buf = fs.readFileSync(f);
    // WebP 的 EXIF chunk FourCC 是大寫 "EXIF"；EXIF payload 本身的識別字串是 "Exif"。
    // 只要檔案裡找得到其中一種，就視為帶有 EXIF（因而可能含 GPS 子 IFD）。
    const hasExifMarker = buf.includes('EXIF') || buf.includes('Exif');
    if (hasExifMarker) {
      errors.push(`${path.relative(repoRoot, f)}：偵測到 EXIF 標記，可能帶有 EXIF/GPS metadata`);
    }
  });
  report(`9. 圖片無 EXIF/GPS（共檢查 ${imgFiles.length} 個檔案）`, errors.length === 0, errors);
}

// ──────────────────────────────────────────────
// 執行全部檢查並輸出報告
// ──────────────────────────────────────────────
checkSecrets();
checkInternalFilesNotTracked();
checkLeadTime();
checkCertifications();
checkNoPricing();
checkI18nKeys();
checkInternalLinks();
checkNoindex();
checkImageExif();

console.log('='.repeat(60));
results.forEach((r) => {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name}`);
  if (!r.ok) {
    r.details.forEach((d) => console.log('   - ' + d));
  }
});
console.log('='.repeat(60));

if (hasFailure) {
  console.log('❌ npm run check 失敗，請修正上面列出的項目後再推送。');
  process.exit(1);
} else {
  console.log(`✅ 全部 ${results.length} 項檢查通過。`);
  process.exit(0);
}
