const fs = require('fs');
const path = require('path');

function findBundle(root) {
  const candidates = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/index.*\.bundle$/.test(e.name) || /.*\.bundle$/.test(e.name)) candidates.push(full);
    }
  }
  try { walk(root); } catch (e) { /* ignore */ }
  if (!candidates.length) return null;
  // return largest file
  candidates.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
  return candidates[0];
}

const projectRoot = process.cwd();
const bundle = findBundle(path.join(projectRoot, 'dist')) || findBundle(projectRoot);
if (!bundle) {
  console.error('No .bundle file found. Run `npm run repack:build` first.');
  process.exit(1);
}

const destDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');
fs.mkdirSync(destDir, { recursive: true });
const dest = path.join(destDir, 'index.android.bundle');
fs.copyFileSync(bundle, dest);
console.log('Copied bundle', bundle, '->', dest);
process.exit(0);
