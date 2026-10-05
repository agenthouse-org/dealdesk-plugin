#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const versionFiles = require('./version-files');
const { createZip, readZip } = require('./zip-archive');

const root = path.join(__dirname, '..');
const MCP_URL = 'https://api.agenthouse.org/mcp/dealdesk';

const INCLUDE = [
  'plugin.json',
  'mcp.json',
  '.mcp.json',
  'README.md',
  'LICENSE',
  'AGENTS.md',
  'bin',
  'assets',
  'skills',
  'commands',
  '.codex-plugin',
  '.claude-plugin',
  '.cursor-plugin',
  '.agents',
];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function fail(message) {
  throw new Error(message);
}

function zipPath(rel) {
  return rel.split(path.sep).join('/');
}

function walk(rel) {
  const abs = path.join(root, rel);
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [zipPath(rel)];
  const names = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    names.push(...walk(path.join(rel, entry.name)));
  }
  return names;
}

function assertVersions(version) {
  for (const rel of versionFiles) {
    const found = readJson(rel).version;
    if (found !== version) fail(`${rel} version is ${found}; expected ${version}`);
  }
}

function assertSkills() {
  const skillsRoot = path.join(root, 'skills');
  const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  if (dirs.length === 0) fail('No skills to package');
  for (const dir of dirs) {
    const rel = `skills/${dir.name}/SKILL.md`;
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!front) fail(`${rel} is missing YAML front matter`);
    const skillName = (front[1].match(/^name:\s*(.+)\s*$/m) || [])[1];
    const description = (front[1].match(/^description:\s*(.+)\s*$/m) || [])[1];
    if (skillName !== dir.name) fail(`${rel} name must match its folder`);
    if (!description) fail(`${rel} is missing a description`);
    if (description.length > 1024) fail(`${rel} description is longer than 1024 characters`);
    if (`dealdesk:${dir.name}`.length > 64) fail(`dealdesk:${dir.name} is longer than 64 characters`);
    if (!text.slice(front[0].length).trim()) fail(`${rel} has no instructions`);
  }
}

function main() {
  const pkg = readJson('package.json');
  assertVersions(pkg.version);
  assertSkills();

  const manifest = readJson('plugin.json');
  if (manifest.name !== 'dealdesk') fail(`plugin name must be dealdesk, found ${manifest.name}`);
  if (manifest.version !== pkg.version) fail('plugin.json version does not match package.json');

  const mcp = readJson('mcp.json');
  const server = mcp.mcpServers && mcp.mcpServers.dealdesk;
  if (!server || server.type !== 'streamable-http' || server.url !== MCP_URL) {
    fail(`mcp.json must declare dealdesk as streamable-http at ${MCP_URL}`);
  }

  const logo = fs.readFileSync(path.join(root, 'assets', 'logo.svg'), 'utf8');
  if (!/viewBox="0 0 128 128"/.test(logo)) fail('assets/logo.svg must be a square 128×128 SVG');

  const names = INCLUDE.flatMap((rel) => walk(rel)).sort();
  const files = names.map((name) => ({
    name,
    data: fs.readFileSync(path.join(root, ...name.split('/'))),
  }));

  const zip = createZip(files);
  const outDir = path.join(root, 'dist');
  fs.mkdirSync(outDir, { recursive: true });
  const outName = `dealdesk-plugin-${pkg.version}.zip`;
  fs.writeFileSync(path.join(outDir, outName), zip);

  const packed = readZip(zip).map((entry) => entry.name).sort();
  if (packed.join('\n') !== names.join('\n')) fail('ZIP entries diverged from the plugin package');
  for (const required of ['plugin.json', 'mcp.json', '.mcp.json', 'bin/dealdesk-plugin.js', 'assets/logo.svg']) {
    if (!packed.includes(required)) fail(`ZIP is missing ${required}`);
  }
  if (!packed.some((name) => name.startsWith('skills/') && name.endsWith('/SKILL.md'))) {
    fail('ZIP is missing skills');
  }
  if (packed.some((name) => name.includes('\\') || name.split('/').includes('..'))) {
    fail('ZIP contains an unsafe path');
  }

  process.stdout.write(`${outName}\n${packed.map((name) => `  ${name}`).join('\n')}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
