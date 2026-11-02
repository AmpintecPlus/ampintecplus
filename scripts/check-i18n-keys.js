const fs = require('fs');
const path = require('path');

const zh = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/_data/i18n/zh.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/_data/i18n/en.json'), 'utf8'));

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

const zhKeys = new Set(collectKeyPaths(zh));
const enKeys = new Set(collectKeyPaths(en));

const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k));
const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k));

console.log(`zh.json key 數量: ${zhKeys.size}`);
console.log(`en.json key 數量: ${enKeys.size}`);

if (missingInEn.length === 0 && missingInZh.length === 0 && zhKeys.size === enKeys.size) {
  console.log(`✅ zh / en key 集合完全一致（共 ${zhKeys.size} 個 key）`);
  process.exit(0);
}

if (missingInEn.length) {
  console.error(`❌ en.json 缺少以下 key（zh.json 有，en.json 沒有，共 ${missingInEn.length} 個）:`);
  missingInEn.forEach((k) => console.error(`  - ${k}`));
}
if (missingInZh.length) {
  console.error(`❌ zh.json 缺少以下 key（en.json 有，zh.json 沒有，共 ${missingInZh.length} 個）:`);
  missingInZh.forEach((k) => console.error(`  - ${k}`));
}
process.exit(1);
