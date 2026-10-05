'use strict';

const assert = require('assert');
const { pickProjectId } = require('../bin/dealdesk-plugin');

const many = pickProjectId({
    projectId: 'AGENTHOUSE01',
    projectIds: ['AGENTHOUSE01', 'NERI001']
});
assert.strictEqual(many.ambiguous, true);
assert.deepStrictEqual(many.ids, ['AGENTHOUSE01', 'NERI001']);

const snake = pickProjectId({
    project_id: 'AGENTHOUSE01',
    project_ids: ['AGENTHOUSE01', 'NERI001']
});
assert.strictEqual(snake.ambiguous, true);

const single = pickProjectId({
    projectId: 'DEMO01',
    projectIds: ['DEMO01']
});
assert.strictEqual(single.id, 'DEMO01');
assert.ok(!single.ambiguous);

const primaryOnly = pickProjectId({ projectId: 'DEMO01' });
assert.strictEqual(primaryOnly.id, 'DEMO01');

console.log('ok - pickProjectId treats multiple projectIds as ambiguous');
