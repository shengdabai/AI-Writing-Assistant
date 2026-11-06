import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'synthetic-fixture-secret-with-at-least-32-bytes';
const { authRoutes } = await import('../api/routes/auth.js');
const { historyRoutes, escapeCsv } = await import('../api/routes/history.js');
const { templateRoutes } = await import('../api/routes/templates.js');
const { userRoutes } = await import('../api/routes/user.js');
const { userRepository } = await import('../api/data/userRepository.js');
for (const id of ['user1', 'fixture-other']) {
  userRepository.create({
    id, name: 'Fixture', email: `${id}@example.invalid`, password_hash: 'unused-fixture',
    plan: 'free', usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
}
const tokens = Object.fromEntries(['user1', 'fixture-other'].map(id =>
  [id, jwt.sign({ user_id: id }, process.env.JWT_SECRET!)]));
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/history', historyRoutes);
app.use('/templates', templateRoutes);
app.use('/user', userRoutes);
const server = app.listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
async function request(path: string, method = 'GET', body?: unknown, user = 'user1') {
  return fetch(base + path, {
    method, headers: { Authorization: `Bearer ${tokens[user]}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const parameters = { length: 'short', tone: 'formal', audience: 'general', language: 'zh' };
async function createTemplate(name: string, isPublic = false) {
  const response = await request('/templates', 'POST', {
    name, description: 'Fixture template', category_id: '1', prompt_template: '{topic}',
    default_parameters: parameters, is_public: isPublic,
  });
  assert.equal(response.status, 201);
  return (await response.json()).data;
}

test('history stats and exports reach their static routes with user isolation', async () => {
  const stats = await request('/history/stats');
  assert.equal(stats.status, 200);
  assert.equal((await stats.json()).data.total_records, 5);
  const exported = await request('/history/export');
  assert.equal(exported.status, 200);
  assert.match(exported.headers.get('content-disposition')!, /history_export.json/);
  assert.equal((await exported.json()).records.length, 5);
  const other = await request('/history/export', 'GET', undefined, 'fixture-other');
  assert.deepEqual((await other.json()).records, []);
  assert.equal((await request('/history/1', 'GET', undefined, 'fixture-other')).status, 404);
  assert.equal((await request('/history/1')).status, 200);
});

test('CSV export neutralizes spreadsheet formulas in user-editable titles', async () => {
  const title = '=1+1';
  assert.equal((await request('/history/1', 'PUT', { title })).status, 200);
  try {
    const response = await request('/history/export?format=csv');
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(`"'${title}"`));
  } finally {
    await request('/history/1', 'PUT', { title: 'Fixture restored' });
  }
});

for (const [name, input, expected] of [
  ['leading tab', '\tFixture', `"'\tFixture"`],
  ['leading carriage return', '\rFixture', `"'\rFixture"`],
  ['tab before formula', '\t=1+1', `"'\t=1+1"`],
  ['carriage return before formula', '\r=1+1', `"'\r=1+1"`],
  ['equals formula', '=1+1', `"'=1+1"`],
  ['whitespace before plus', '  +1', `"'  +1"`],
  ['minus formula', '-1', `"'-1"`],
  ['at formula', '@SUM(1)', `"'@SUM(1)"`],
  ['ordinary quoted text', 'Fixture "title", text', '"Fixture ""title"", text"'],
  ['embedded tab', 'Fixture\ttext', '"Fixture\ttext"'],
  ['empty cell', '', '""'],
]) {
  test(`CSV escaping handles ${name}`, () => {
    assert.equal(escapeCsv(input), expected);
  });
}

test('invalid pagination falls back to finite defaults in both list endpoints', async () => {
  for (const path of ['/history', '/templates']) {
    const response = await request(`${path}?page=invalid&limit=invalid`);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.pagination.page, 1);
    assert.equal(result.pagination.limit, 20);
    assert.ok(result.data.length > 0);
  }
});

test('template updates cannot overwrite ownership, ID, or usage counters', async () => {
  const template = await createTemplate('Fixture immutable fields');
  const response = await request(`/templates/${template.id}`, 'PUT', {
    name: 'Updated fixture', id: 'replacement', user_id: 'fixture-other', usage_count: 999,
  });
  assert.equal(response.status, 200);
  const updated = (await response.json()).data;
  assert.equal(updated.id, template.id);
  assert.equal(updated.user_id, 'user1');
  assert.equal(updated.usage_count, 0);
  assert.equal(updated.name, 'Updated fixture');
  assert.equal((await request(`/templates/${template.id}`, 'PUT', { name: 'Other' }, 'fixture-other')).status, 403);
});

test('template filters apply to owned templates without duplicates or private leaks', async () => {
  const visible = await createTemplate('Fixture public filter', true);
  const hidden = await createTemplate('Fixture private filter');
  const result = await (await request('/templates?search=Fixture%20public%20filter')).json();
  assert.deepEqual(result.data.map((item: { id: string }) => item.id), [visible.id]);
  const privateOnly = await (await request('/templates?is_public=false')).json();
  assert.ok(privateOnly.data.some((item: { id: string }) => item.id === hidden.id));
  assert.ok(privateOnly.data.every((item: { is_public: boolean }) => item.is_public === false));
  assert.equal((await request(`/templates/${hidden.id}`, 'GET', undefined, 'fixture-other')).status, 403);
});

test('malformed template text and visibility fields return 400 without storage mutation', async () => {
  const template = await createTemplate('Fixture validation');
  for (const body of [{ name: {} }, { name: ' ' }, { is_public: 'false' }]) {
    assert.equal((await request(`/templates/${template.id}`, 'PUT', body)).status, 400);
  }
  const stored = (await (await request(`/templates/${template.id}`)).json()).data;
  assert.equal(stored.name, 'Fixture validation');
  assert.equal(stored.is_public, false);
});

test('user stats and achievements retain their documented response fields', async () => {
  const stats = await (await request('/user/stats')).json();
  assert.equal(stats.data.total_templates_used, 0);
  assert.equal(stats.data.favorite_content_type, 'article');
  assert.ok(Array.isArray(stats.data.monthly_usage));
  const achievements = await (await request('/user/achievements')).json();
  assert.equal(achievements.data.total_count, 5);
  assert.equal(typeof achievements.data.achievements[0].reward_points, 'number');
});


test('bcrypt password input cannot silently discard bytes beyond its 72-byte limit', async () => {
  const profile = { name: 'Fixture password', email: 'fixture-password@example.invalid' };
  for (const password of ['a'.repeat(73), '密'.repeat(25)]) {
    assert.equal((await request('/auth/register', 'POST', { ...profile, password })).status, 400);
  }
  const password = 'a'.repeat(72);
  const registered = await request('/auth/register', 'POST', { ...profile, password });
  assert.equal(registered.status, 201);
  tokens['fixture-password'] = (await registered.json()).data.token;
  assert.equal((await request('/auth/login', 'POST', { email: profile.email, password })).status, 200);
  assert.equal((await request('/auth/login', 'POST', { email: profile.email, password: password + 'x' })).status, 400);
  assert.equal((await request('/user/password', 'PUT', {
    current_password: password, new_password: password + 'x',
  }, 'fixture-password')).status, 400);
  assert.equal((await request('/user/password', 'PUT', {
    current_password: password + 'x', new_password: 'replacement-fixture',
  }, 'fixture-password')).status, 400);
  assert.equal((await request('/user/account', 'DELETE', { password: password + 'x' }, 'fixture-password')).status, 400);
  assert.equal((await request('/auth/verify', 'GET', undefined, 'fixture-password')).status, 200);
});

test('template creation and updates reject invalid generation parameters and text', async () => {
  const template = await createTemplate('Fixture generation validation');
  for (const default_parameters of [null, {}, { ...parameters, tone: [] }, { ...parameters, keywords: 'tag' }]) {
    assert.equal((await request(`/templates/${template.id}`, 'PUT', { default_parameters })).status, 400);
    assert.equal((await request('/templates', 'POST', {
      name: 'Invalid fixture', description: 'Fixture', category_id: '1', prompt_template: '{topic}', default_parameters,
    })).status, 400);
  }
  for (const name of [42, ' ']) {
    assert.equal((await request('/templates', 'POST', {
      name, description: 'Fixture', category_id: '1', prompt_template: '{topic}', default_parameters: parameters,
    })).status, 400);
  }
  const updated = await request(`/templates/${template.id}`, 'PUT', {
    default_parameters: { ...parameters, keywords: ['fixture'] },
  });
  assert.equal(updated.status, 200);
  assert.deepEqual((await updated.json()).data.default_parameters.keywords, ['fixture']);
});
