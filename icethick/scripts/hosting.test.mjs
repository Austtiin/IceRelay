import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts', 'prepare-hosting.mjs');
const template = await readFile(resolve('public', 'staticwebapp.config.json'), 'utf8');

async function prepare(apiUrl, preview = false) {
  const directory = await mkdtemp(join(tmpdir(), 'ice-relay-hosting-test-'));
  try {
    await mkdir(join(directory, 'out'));
    const target = join(directory, 'out', 'staticwebapp.config.json');
    await writeFile(target, template);
    const result = spawnSync(process.execPath, [script], {
      cwd: directory,
      env: { ...process.env, NEXT_PUBLIC_API_URL: apiUrl, ICE_RELAY_PREVIEW: String(preview) },
      encoding: 'utf8',
    });
    return { ...result, config: JSON.parse(await readFile(target, 'utf8')) };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('linked API keeps the static CSP and production indexing intact', async () => {
  const result = await prepare('/api');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.config.globalHeaders['x-robots-tag'], undefined);
  assert.ok(result.config.globalHeaders['content-security-policy'].includes("worker-src 'self' blob:"));
  assert.ok(!result.config.globalHeaders['content-security-policy'].includes("'unsafe-eval'"));
});

test('cross-origin API adds only its exact HTTPS origin', async () => {
  const result = await prepare('https://api.example.test/api');
  assert.equal(result.status, 0, result.stderr);
  const csp = result.config.globalHeaders['content-security-policy'];
  assert.ok(csp.includes("connect-src 'self' https://api.example.test"));
  assert.ok(!csp.includes('https://api.example.test/api'));
});

test('insecure, credential-bearing, and non-API URLs fail rather than weaken CSP', async () => {
  for (const apiUrl of [
    'http://api.example.test/api',
    'https://example:placeholder@api.example.test/api',
    'https://api.example.test/api?key=placeholder',
    'https://api.example.test/',
    '/other-api',
    '//api.example.test/api',
  ]) {
    const result = await prepare(apiUrl);
    assert.notEqual(result.status, 0, apiUrl);
    assert.deepEqual(result.config, JSON.parse(template), 'Failed preparation must not modify hosting configuration');
  }
});

test('pull-request previews receive a noindex response header', async () => {
  const result = await prepare('/api', true);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.config.globalHeaders['x-robots-tag'], 'noindex, nofollow');
});

test('loopback API is allowed for local exported-site checks', async () => {
  const result = await prepare('http://localhost:7071/api');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.config.globalHeaders['content-security-policy'].includes('http://localhost:7071'));
});
