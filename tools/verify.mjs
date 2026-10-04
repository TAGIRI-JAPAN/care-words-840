// No npm install required. Run from any directory with Node.js 22 or newer.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'checksums.json'), 'utf8'));
const ignoredDirectories = new Set(['.git', 'node_modules', '__pycache__']);
function filesAt(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    assert.ok(!entry.isSymbolicLink(), 'Symlinks are not supported: ' + name);
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : filesAt(path.join(dir, entry.name), name + '/');
    return [name];
  });
}

const actual = filesAt(root);
const exactNames = new Set(actual);
const foldedNames = new Set();
for (const name of actual) {
  const key = name.toLowerCase();
  assert.ok(!foldedNames.has(key), 'Case-insensitive filename collision: ' + name);
  foldedNames.add(key);
}
let totalBytes = 0;
for (const [name, expected] of Object.entries(manifest.files)) {
  assert.ok(!path.isAbsolute(name) && !name.split('/').includes('..'), 'Unsafe path: ' + name);
  assert.ok(exactNames.has(name), 'Missing or renamed file (check case): ' + name);
  const bytes = fs.readFileSync(path.join(root, name));
  assert.equal(bytes.length, expected.bytes, 'File size changed: ' + name);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), expected.sha256, 'File content changed: ' + name);
  assert.ok(bytes.length < 100 * 1024 * 1024, 'File exceeds GitHub regular-file limit: ' + name);
  totalBytes += bytes.length;
}
assert.ok(totalBytes < 1024 * 1024 * 1024, 'Export exceeds the GitHub Pages size limit');
const cards = JSON.parse(fs.readFileSync(path.join(root, 'cards.json'), 'utf8'));
assert.equal(cards.length, 840);
for (const directory of ['cards', 'thumbs']) {
  assert.equal(fs.readdirSync(path.join(root, directory)).length, 840, directory + ' must have exactly 840 images');
}
for (const [i, card] of cards.entries()) {
  assert.equal(card.id, i + 1);
  assert.equal(card.page, Math.floor(i / 6) + 1);
  assert.equal(card.slot, i % 6 + 1);
  const imageName = String(card.id).padStart(4, '0') + '.webp';
  assert.equal(card.image, './cards/' + imageName);
  assert.ok(exactNames.has('cards/' + imageName));
  assert.ok(exactNames.has('thumbs/' + imageName));
  for (const key of ['english', 'japanese', 'kana', 'romanization']) assert.ok(card[key]?.trim(), `Empty ${key}: ${card.id}`);
}
for (const file of ['index.html', 'studio.css', 'app.js', 'study.js', 'journey.js', '.nojekyll']) assert.ok(exactNames.has(file), 'Missing entry file: ' + file);
console.log(`PASS: ${Object.keys(manifest.files).length} file names, lengths and SHA-256 checksums.`);
console.log('PASS: 840 sequential cards, original-image associations, 840 thumbnails and GitHub size limits.');
await import('./test-app.mjs');
console.log('PASS: export verification complete.');
