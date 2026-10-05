'use strict';

const fs = require('fs');
const assert = require('assert');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert.equal(pkg.name, 'dealdesk-plugin', 'Unexpected npm package name');
assert.equal(pkg.publishConfig && pkg.publishConfig.access, 'public');
assert.equal(pkg.publishConfig && pkg.publishConfig.registry, 'https://registry.npmjs.org/');
assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Invalid release version');

if (process.env.GITHUB_EVENT_NAME === 'release') {
  assert.equal(process.env.RELEASE_TAG, `v${pkg.version}`, 'Release tag must match package.json version');
  assert.equal(
    process.env.RELEASE_PRERELEASE === 'true',
    pkg.version.includes('-'),
    'GitHub prerelease flag must match the npm prerelease version',
  );
} else {
  assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch', 'Unsupported publishing event');
}

process.stdout.write(`Validated ${pkg.name}@${pkg.version}\n`);
