#!/usr/bin/env node
'use strict';

// Produces an incomplete public-review draft; remaining materials must be verified.
const fs = require('fs');
const path = require('path');
const { createZip, readZip } = require('./zip-archive');
const root = path.resolve(__dirname, '..');
function walk(rel) {
  const p = path.join(root, rel);
  if (fs.statSync(p).isFile()) return [rel.replace(/\\/g, '/')];
  return fs.readdirSync(p, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in the package');
    return walk(path.join(rel, entry.name));
  });
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json')));
if (manifest.apps != null || manifest.extensions?.['com.openai']?.apps != null) throw new Error('Public uploads cannot contain app bindings');
const files = ['plugin.json', 'mcp.json', 'LICENSE', 'assets', 'skills'].flatMap(walk).sort();
const zip = createZip(files.map(name => ({ name, data: fs.readFileSync(path.join(root, name)) })));
const output = path.join(root, 'dist', `dealdesk-chatgpt-draft-${manifest.version}.zip`);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, zip);
if (readZip(zip).map(entry => entry.name).sort().join('\n') !== files.join('\n')) throw new Error('Archive inventory mismatch');
console.log(`${output}\n${files.length} files; incomplete review draft, not ready to submit`);
