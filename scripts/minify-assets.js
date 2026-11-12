/**
 * Build 完成後，就地壓縮 _site/assets/css/*.css 與 _site/assets/js/*.js。
 * 只處理我們自己的第一方檔案，不涉及任何第三方腳本或外部服務。
 */
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

const siteDir = path.join(__dirname, '..', '_site');

function walk(dir, ext) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walk(full, ext));
    } else if (full.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

async function run() {
  const cssFiles = walk(path.join(siteDir, 'assets/css'), '.css');
  for (const f of cssFiles) {
    const input = fs.readFileSync(f, 'utf8');
    const output = new CleanCSS({ level: 1 }).minify(input);
    if (output.errors.length) {
      console.error('CSS 壓縮失敗：', f, output.errors);
      process.exitCode = 1;
      continue;
    }
    fs.writeFileSync(f, output.styles);
    console.log(`CSS 壓縮：${path.relative(siteDir, f)}（${input.length} → ${output.styles.length} bytes）`);
  }

  const jsFiles = walk(path.join(siteDir, 'assets/js'), '.js');
  for (const f of jsFiles) {
    const input = fs.readFileSync(f, 'utf8');
    const result = await minifyJs(input, { mangle: true, compress: true });
    if (result.error) {
      console.error('JS 壓縮失敗：', f, result.error);
      process.exitCode = 1;
      continue;
    }
    fs.writeFileSync(f, result.code);
    console.log(`JS 壓縮：${path.relative(siteDir, f)}（${input.length} → ${result.code.length} bytes）`);
  }
}

run();
