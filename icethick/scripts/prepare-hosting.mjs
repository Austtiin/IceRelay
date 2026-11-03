import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const configPath = resolve('out', 'staticwebapp.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
if (process.env.ICE_RELAY_PREVIEW === 'true') {
  config.globalHeaders['x-robots-tag'] = 'noindex, nofollow';
}

if (!apiUrl.startsWith('/')) {
  const api = new URL(apiUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname);
  if (api.protocol !== 'https:' && !(local && api.protocol === 'http:')) {
    throw new Error('NEXT_PUBLIC_API_URL must use HTTPS outside local development.');
  }
  if (api.username || api.password || api.search || api.hash || !api.pathname.endsWith('/api')) {
    throw new Error('NEXT_PUBLIC_API_URL must be a public API base ending in /api, without credentials, a query, or a fragment.');
  }
  config.globalHeaders['content-security-policy'] = config.globalHeaders['content-security-policy']
    .replace("connect-src 'self'", `connect-src 'self' ${api.origin}`);
} else if (apiUrl !== '/api') {
  throw new Error('Use /api for the linked backend, or an absolute HTTPS API URL.');
}

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log('Prepared static hosting headers for the configured API origin.');
