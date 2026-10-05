#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const versionFiles = require('./version-files');

const kind = process.argv[2];
if (!['patch', 'minor', 'major'].includes(kind)) {
  process.stderr.write('Usage: node scripts/bump-version.js <patch|minor|major>\n');
  process.exit(1);
}

const root = path.join(__dirname, '..');

function readVersion(rel) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  const match = text.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/);
  if (!match) throw new Error(`No semantic version in ${rel}`);
  return { text, version: match[1], token: match[0] };
}

function bump(version, level) {
  const parts = version.split('.').map((part) => Number(part));
  if (parts.some((part) => !Number.isInteger(part))) {
    throw new Error(`Invalid version ${version}`);
  }
  if (level === 'major') return `${parts[0] + 1}.0.0`;
  if (level === 'minor') return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

const current = readVersion(versionFiles[0]);
for (const rel of versionFiles.slice(1)) {
  const found = readVersion(rel);
  if (found.version !== current.version) {
    throw new Error(`${rel} is ${found.version}; expected ${current.version}`);
  }
}

const next = bump(current.version, kind);
for (const rel of versionFiles) {
  const found = readVersion(rel);
  const updated = found.text.replace(found.token, `"version": "${next}"`);
  if (updated === found.text) throw new Error(`Version was not replaced in ${rel}`);
  fs.writeFileSync(path.join(root, rel), updated);
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${next}\nprevious=${current.version}\n`,
  );
}

process.stdout.write(`${current.version} -> ${next}\n`);
