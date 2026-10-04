#!/usr/bin/env node
'use strict';

/**
 * SKILL.md consumability check:
 * - each skill must be <= 100 lines, OR
 * - contain a "## Contents" section (for longer progressive-disclosure skills)
 */

const fs = require('fs');
const path = require('path');

const skillsRoot = path.join(__dirname, '..', 'skills');
const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((d) => d.isDirectory());

let failed = 0;
const rows = [];

for (const dir of dirs) {
  const skillPath = path.join(skillsRoot, dir.name, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    rows.push({ skill: dir.name, ok: false, reason: 'missing SKILL.md' });
    failed += 1;
    continue;
  }
  if (!/^dealdesk-[a-z0-9-]{1,54}$/.test(dir.name)) {
    rows.push({ skill: dir.name, ok: false, reason: 'folder must be dealdesk-<name>' });
    failed += 1;
    continue;
  }
  const text = fs.readFileSync(skillPath, 'utf8');
  const name = (text.match(/^name:\s*(.+)\s*$/m) || [])[1];
  if (name !== dir.name) {
    rows.push({ skill: dir.name, ok: false, reason: `frontmatter name ${name || '(missing)'} != folder` });
    failed += 1;
    continue;
  }
  const lines = text.split(/\r?\n/).length;
  const hasContents = /^## Contents\s*$/m.test(text);
  const ok = lines <= 100 || hasContents;
  const reason = lines <= 100
    ? `<=100 lines (${lines})`
    : hasContents
      ? `has ## Contents (${lines} lines)`
      : `FAIL: ${lines} lines, no ## Contents`;
  if (!ok) failed += 1;
  rows.push({ skill: dir.name, ok, reason });
}

for (const row of rows) {
  const mark = row.ok ? 'PASS' : 'FAIL';
  process.stdout.write(`${mark}\t${row.skill}\t${row.reason}\n`);
}

process.stdout.write(`\n${rows.length - failed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
