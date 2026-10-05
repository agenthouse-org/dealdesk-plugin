#!/usr/bin/env node
'use strict';

/**
 * DealDesk plugin local connector for agenthouse.
 * Speaks MCP over stdio and connects to the agenthouse DealDesk MCP endpoint.
 *
 * Sign-in is OAuth: the connector opens the agenthouse page, the user chooses
 * the project, and the grant is stored for later launches.
 *
 * Env:
 *   AGENTHOUSE_API_URL     (default https://api.agenthouse.org)
 *   AGENTHOUSE_API_KEY     optional override for automation that cannot open a browser
 *   AGENTHOUSE_PROJECT_ID  optional tenant id when a tool omits projectId
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');
const readline = require('readline');

const API_URL = String(process.env.AGENTHOUSE_API_URL || 'https://api.agenthouse.org').replace(/\/$/, '');
const API_KEY = String(process.env.AGENTHOUSE_API_KEY || process.env.AGENTHOUSE_TOKEN || '').trim();
const PROJECT_ID = String(process.env.AGENTHOUSE_PROJECT_ID || '').trim();
const SCOPE = 'dealdesk:access';
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
const SESSION_PATH = path.join(os.homedir(), '.agenthouse', 'dealdesk-oauth.json');
const LOCK_PATH = path.join(os.homedir(), '.agenthouse', 'dealdesk-oauth.lock');
const ERROR_PATH = path.join(os.homedir(), '.agenthouse', 'dealdesk-oauth.error');
const URL_PATH = path.join(os.homedir(), '.agenthouse', 'dealdesk-oauth.url');

const session = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
  clientId: '',
  redirectUri: '',
  projectId: PROJECT_ID,
  apiUrl: API_URL
};

let authorizeUrl = '';
let oauthMeta = null;

function log(msg) {
  process.stderr.write(`[dealdesk-plugin] ${msg}\n`);
}

function resourceUrl() {
  return `${API_URL}/mcp/dealdesk`;
}

function requestRaw(targetUrl, options) {
  const target = new URL(targetUrl);
  const lib = target.protocol === 'http:' ? http : https;
  const body = options.body || null;
  const headers = Object.assign({}, options.headers || {});
  if (body != null && headers['Content-Length'] == null) {
    headers['Content-Length'] = Buffer.byteLength(body);
  }
  return new Promise((resolve, reject) => {
    const req = lib.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'http:' ? 80 : 443),
      path: `${target.pathname}${target.search}`,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, body: data });
      });
    });
    req.on('error', reject);
    if (body != null) req.write(body);
    req.end();
  });
}

async function requestJson(targetUrl, options) {
  const response = await requestRaw(targetUrl, options || {});
  let json = null;
  if (response.body) {
    try {
      json = JSON.parse(response.body);
    } catch (err) {
      json = null;
    }
  }
  return { statusCode: response.statusCode, body: response.body, json };
}

function pickProjectId(data, depth) {
  if (!data || typeof data !== 'object' || (depth || 0) > 5) return {};
  if (!Array.isArray(data)) {
    const listed = Array.isArray(data.projectIds)
      ? data.projectIds
      : (Array.isArray(data.project_ids) ? data.project_ids : null);
    if (Array.isArray(listed)) {
      const ids = listed.map((value) => String(value || '').trim()).filter(Boolean);
      if (ids.length > 1) return { ambiguous: true, ids };
      if (ids.length === 1) return { id: ids[0] };
    }
    for (const key of ['projectId', 'project_id', 'tenantId', 'tenant_id', 'currentProjectId']) {
      if (typeof data[key] === 'string' && data[key].trim()) return { id: data[key].trim() };
    }
    if (data.project && typeof data.project === 'object') {
      const nested = pickProjectId(data.project, (depth || 0) + 1);
      if (nested.id || nested.ambiguous) return nested;
    }
  }
  const list = Array.isArray(data) ? data : (data.projects || data.items || null);
  if (Array.isArray(list)) {
    if (list.length > 1) return { ambiguous: true };
    if (list.length === 1 && list[0] && typeof list[0] === 'object') {
      return pickProjectId({
        projectId: list[0].projectId || list[0].project_id || list[0].id
      }, (depth || 0) + 1);
    }
  }
  if (!Array.isArray(data) && data.data && data.data !== data) {
    return pickProjectId(data.data, (depth || 0) + 1);
  }
  return {};
}

function projectFromAccessToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return {};
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return pickProjectId(payload);
  } catch (err) {
    return {};
  }
}

function validAccess() {
  return Boolean(session.accessToken) && session.expiresAt - 60000 > Date.now();
}

function loadSession() {
  let raw;
  try {
    raw = fs.readFileSync(SESSION_PATH, 'utf8');
  } catch (err) {
    return;
  }
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch (err) {
    return;
  }
  if (!saved || saved.apiUrl !== API_URL) return;
  session.accessToken = String(saved.accessToken || '');
  session.refreshToken = String(saved.refreshToken || '');
  session.expiresAt = Number(saved.expiresAt) || 0;
  session.clientId = String(saved.clientId || '');
  session.redirectUri = String(saved.redirectUri || '');
  if (!PROJECT_ID && saved.projectId) session.projectId = String(saved.projectId);
}

function persistSession() {
  const dir = path.dirname(SESSION_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const payload = {
    apiUrl: API_URL,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    clientId: session.clientId,
    redirectUri: session.redirectUri,
    projectId: session.projectId || ''
  };
  const tmp = `${SESSION_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
  fs.renameSync(tmp, SESSION_PATH);
}

function applyTokenResponse(body) {
  if (!body || !body.access_token) {
    throw new Error('agenthouse did not return an access token');
  }
  session.accessToken = String(body.access_token);
  if (body.refresh_token) session.refreshToken = String(body.refresh_token);
  const expiresIn = Number(body.expires_in);
  session.expiresAt = Date.now() + ((Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600) * 1000);
  const picked = pickProjectId(body);
  const fromJwt = projectFromAccessToken(session.accessToken);
  if (!PROJECT_ID) {
    if (picked.ambiguous || fromJwt.ambiguous) session.projectId = '';
    else session.projectId = picked.id || fromJwt.id || session.projectId || '';
  }
  persistSession();
}

async function discover() {
  if (oauthMeta) return oauthMeta;
  const fallback = {
    authorization_endpoint: `${API_URL}/api/oauth/authorize`,
    token_endpoint: `${API_URL}/api/oauth/token`,
    registration_endpoint: `${API_URL}/api/oauth/register`
  };
  try {
    const response = await requestJson(`${API_URL}/.well-known/oauth-authorization-server`);
    const meta = response.json;
    if (response.statusCode >= 200 && response.statusCode < 300 && meta && meta.authorization_endpoint && meta.token_endpoint) {
      oauthMeta = meta;
      return oauthMeta;
    }
  } catch (err) {
    log(`oauth discovery: ${err.message}`);
  }
  oauthMeta = fallback;
  return oauthMeta;
}

async function tokenRequest(fields) {
  const meta = await discover();
  const body = new URLSearchParams(fields).toString();
  const response = await requestJson(meta.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body
  });
  if (response.statusCode < 200 || response.statusCode >= 300 || !response.json || !response.json.access_token) {
    const description = response.json && (response.json.error_description || response.json.error);
    throw new Error(description || `token request failed (${response.statusCode})`);
  }
  return response.json;
}

async function refreshSession() {
  if (!session.refreshToken || !session.clientId) return false;
  try {
    const body = await tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
      client_id: session.clientId,
      resource: resourceUrl()
    });
    applyTokenResponse(body);
    return true;
  } catch (err) {
    log(`Could not refresh DealDesk sign-in: ${err.message}`);
    session.accessToken = '';
    session.refreshToken = '';
    session.expiresAt = 0;
    return false;
  }
}

async function discoverProjectId() {
  if (session.projectId) return session.projectId;
  const fromJwt = projectFromAccessToken(session.accessToken);
  if (fromJwt.id) {
    session.projectId = fromJwt.id;
    persistSession();
    return session.projectId;
  }
  if (fromJwt.ambiguous) {
    log('This account has more than one project. Set AGENTHOUSE_PROJECT_ID to the project you want.');
    return '';
  }
  for (const suffix of ['/api/me', '/api/projects']) {
    try {
      const response = await requestJson(`${API_URL}${suffix}`, {
        headers: { Authorization: `Bearer ${session.accessToken}`, Accept: 'application/json' }
      });
      if (response.statusCode < 200 || response.statusCode >= 300) continue;
      const picked = pickProjectId(response.json);
      if (picked.id) {
        session.projectId = picked.id;
        persistSession();
        return session.projectId;
      }
      if (picked.ambiguous) {
        log('This account has more than one project. Set AGENTHOUSE_PROJECT_ID to the project you want.');
        return '';
      }
    } catch (err) {
      log(`project lookup ${suffix}: ${err.message}`);
    }
  }
  return '';
}

function openBrowser(url) {
  return new Promise((resolve) => {
    let child;
    if (process.platform === 'win32') {
      child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
    } else if (process.platform === 'darwin') {
      child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    } else {
      child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    }
    child.on('error', (err) => {
      log(`Could not open the browser (${err.message}). Sign in at: ${url}`);
      resolve(false);
    });
    child.on('spawn', () => resolve(true));
    child.unref();
  });
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}

function readLock() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
  } catch (err) {
    return null;
  }
  if (!data || data.apiUrl !== API_URL) return null;
  if (data.pid === 'pending' && Date.now() - Number(data.at || 0) < 15000) return data;
  if (pidAlive(Number(data.pid))) return data;
  return null;
}

function spawnLoginHelper() {
  if (readLock()) return;
  fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
  try {
    const fd = fs.openSync(LOCK_PATH, 'wx');
    fs.writeFileSync(fd, JSON.stringify({ pid: 'pending', apiUrl: API_URL, at: Date.now() }));
    fs.closeSync(fd);
  } catch (err) {
    if (err.code === 'EEXIST') {
      if (readLock()) return;
      try { fs.unlinkSync(LOCK_PATH); } catch (unlinkErr) { return; }
      spawnLoginHelper();
      return;
    }
    throw err;
  }
  try { fs.unlinkSync(ERROR_PATH); } catch (err) { /* no previous error */ }
  try { fs.unlinkSync(URL_PATH); } catch (err) { /* no previous url */ }
  const child = spawn(process.execPath, [__filename, '--login'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: process.env
  });
  child.on('error', (err) => {
    try { fs.unlinkSync(LOCK_PATH); } catch (unlinkErr) { /* lock already removed */ }
    try { fs.writeFileSync(ERROR_PATH, err.message); } catch (writeErr) { /* best effort */ }
    log(`Could not open DealDesk sign-in: ${err.message}`);
  });
  child.unref();
  log('Opening the agenthouse sign-in page for DealDesk.');
}

function listenLoopback(port) {
  const server = http.createServer();
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      server.removeListener('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.removeListener('error', onError);
      resolve(server);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

function htmlPage(title, message) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${title}</title></head><body style="font:16px/1.4 system-ui,sans-serif;padding:32px"><h1>${title}</h1><p>${message}</p></body></html>`;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

async function interactiveLogin() {
  const meta = await discover();
  const savedPort = session.redirectUri ? Number(new URL(session.redirectUri).port) : 0;
  let server;
  try {
    server = await listenLoopback(savedPort || 8731);
  } catch (err) {
    if (err.code !== 'EADDRINUSE') throw err;
    server = await listenLoopback(0);
  }
  const port = server.address().port;
  const redirectUri = `http://127.0.0.1:${port}/callback`;
  try {
    if (!session.clientId || session.redirectUri !== redirectUri) {
      if (!meta.registration_endpoint) throw new Error('agenthouse OAuth registration is unavailable');
      const created = await requestJson(meta.registration_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_name: 'DealDesk',
          redirect_uris: [redirectUri],
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          application_type: 'native',
          scope: SCOPE
        })
      });
      if (!created.json || !created.json.client_id) {
        throw new Error('Could not register DealDesk for sign-in');
      }
      session.clientId = created.json.client_id;
      session.redirectUri = redirectUri;
      persistSession();
    }

    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('base64url');
    const authorize = new URL(meta.authorization_endpoint);
    authorize.searchParams.set('response_type', 'code');
    authorize.searchParams.set('client_id', session.clientId);
    authorize.searchParams.set('redirect_uri', redirectUri);
    authorize.searchParams.set('scope', SCOPE);
    authorize.searchParams.set('state', state);
    authorize.searchParams.set('code_challenge', challenge);
    authorize.searchParams.set('code_challenge_method', 'S256');
    authorize.searchParams.set('resource', resourceUrl());
    authorizeUrl = authorize.toString();
    try {
      fs.writeFileSync(URL_PATH, authorizeUrl, { mode: 0o600 });
    } catch (err) {
      log(`Could not record the sign-in page: ${err.message}`);
    }

    const code = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('DealDesk sign-in timed out. Start the connector again when you are ready to sign in.'));
      }, LOGIN_TIMEOUT_MS);
      const finish = (err, value) => {
        clearTimeout(timer);
        server.removeListener('request', onRequest);
        if (err) reject(err);
        else resolve(value);
      };
      const onRequest = (req, res) => {
        const incoming = new URL(req.url || '/', redirectUri);
        if (incoming.pathname !== '/callback') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        const returnedState = incoming.searchParams.get('state') || '';
        if (!safeEqual(returnedState, state)) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(htmlPage('DealDesk', 'This sign-in attempt did not match. Return to the app and try again.'));
          return;
        }
        const oauthError = incoming.searchParams.get('error');
        if (oauthError) {
          const description = incoming.searchParams.get('error_description') || oauthError;
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(htmlPage('DealDesk', 'Sign-in was not completed. You can close this window.'));
          finish(new Error(description));
          return;
        }
        const authCode = incoming.searchParams.get('code');
        if (!authCode) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(htmlPage('DealDesk', 'Sign-in did not return a code. You can close this window and try again.'));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlPage('DealDesk connected', 'You are signed in. You can close this window and return to your assistant.'));
        finish(null, authCode);
      };
      server.on('request', onRequest);
      openBrowser(authorizeUrl).then((opened) => {
        if (!opened) log(`Sign in at: ${authorizeUrl}`);
      });
    });

    const body = await tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: session.clientId,
      code_verifier: verifier,
      resource: resourceUrl()
    });
    applyTokenResponse(body);
    await discoverProjectId();
    log('DealDesk sign-in completed.');
    return session.accessToken;
  } finally {
    if (server) server.close();
  }
}

async function bootstrap() {
  if (API_KEY) {
    log(`connected to ${API_URL}`);
    return;
  }
  loadSession();
  if (validAccess()) {
    await discoverProjectId();
    log(`using saved DealDesk sign-in for ${API_URL}`);
    return;
  }
  if (await refreshSession()) {
    await discoverProjectId();
    log(`refreshed DealDesk sign-in for ${API_URL}`);
    return;
  }
  spawnLoginHelper();
}

async function loginMain() {
  loadSession();
  fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
  fs.writeFileSync(LOCK_PATH, JSON.stringify({ pid: process.pid, apiUrl: API_URL, at: Date.now() }));
  try {
    if (!validAccess() && !(await refreshSession())) await interactiveLogin();
    else await discoverProjectId();
    try { fs.unlinkSync(ERROR_PATH); } catch (err) { /* clear stale error */ }
  } catch (err) {
    const message = String(err && err.message || err);
    try { fs.writeFileSync(ERROR_PATH, message); } catch (writeErr) { log(writeErr.message); }
    log(message);
    process.exitCode = 1;
  } finally {
    try { fs.unlinkSync(LOCK_PATH); } catch (err) { /* lock already removed */ }
  }
}

let bootPromise = null;
function boot() {
  if (!bootPromise) bootPromise = bootstrap();
  return bootPromise;
}

async function getBearer() {
  await boot();
  if (API_KEY) return API_KEY;
  if (validAccess()) return session.accessToken;
  spawnLoginHelper();
  let loggedUrl = false;
  const started = Date.now();
  while (Date.now() - started < LOGIN_TIMEOUT_MS) {
    loadSession();
    if (validAccess()) {
      await discoverProjectId();
      log('DealDesk sign-in is ready.');
      return session.accessToken;
    }
    if (!loggedUrl) {
      try {
        const url = fs.readFileSync(URL_PATH, 'utf8').trim();
        if (url) {
          log(`Sign in at: ${url}`);
          loggedUrl = true;
        }
      } catch (err) { /* page not ready yet */ }
    }
    let errorText = '';
    try { errorText = fs.readFileSync(ERROR_PATH, 'utf8').trim(); } catch (err) { /* still signing in */ }
    if (errorText && !readLock()) throw new Error(errorText);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error('DealDesk sign-in timed out. Finish the agenthouse page, then try again.');
}

function postMcp(messages, token) {
  const body = (Array.isArray(messages) ? messages : [messages])
    .map((message) => JSON.stringify(message))
    .join('\n') + '\n';
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    'Content-Length': Buffer.byteLength(body)
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return requestRaw(resourceUrl(), { method: 'POST', headers, body }).then((response) => {
    if (response.statusCode === 401) {
      let description = 'Unauthorized';
      try {
        const parsed = JSON.parse(response.body);
        description = parsed.error_description || parsed.error || description;
      } catch (err) {
        description = response.body || description;
      }
      const error = new Error(description);
      error.statusCode = 401;
      throw error;
    }
    const lines = response.body.split('\n').map((line) => line.trim()).filter(Boolean);
    const parsed = [];
    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line));
      } catch (err) {
        log(`parse response: ${err.message}`);
      }
    }
    if (!parsed.length && response.statusCode >= 400) {
      throw new Error(response.body || `DealDesk request failed (${response.statusCode})`);
    }
    return parsed;
  });
}

function injectProject(msg) {
  if (!msg || typeof msg !== 'object') return msg;
  if (msg.method === 'tools/call' && msg.params) {
    const args = msg.params.arguments || {};
    const projectId = PROJECT_ID || session.projectId;
    if (!args.projectId && projectId) {
      msg.params.arguments = Object.assign({}, args, { projectId });
    }
  }
  return msg;
}

function needsAuth(batch) {
  return batch.some((message) => message && message.method && message.method !== 'initialize' && !String(message.method).startsWith('notifications/'));
}

async function postAuthed(batch) {
  const token = await getBearer();
  try {
    return await postMcp(batch, token);
  } catch (err) {
    if (err.statusCode === 401 && !API_KEY) {
      session.accessToken = '';
      session.expiresAt = 0;
      if (await refreshSession()) return postMcp(batch, session.accessToken);
    }
    throw err;
  }
}

async function handleLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch (err) {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' }
    }) + '\n');
    return;
  }
  const batch = Array.isArray(msg) ? msg.map(injectProject) : [injectProject(msg)];
  try {
    const responses = needsAuth(batch)
      ? await postAuthed(batch)
      : await postMcp(batch, API_KEY || (validAccess() ? session.accessToken : ''));
    for (const response of responses) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    log(String(err && err.message || err));
    for (const message of batch) {
      if (message && message.id !== undefined && message.id !== null) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          error: { code: -32000, message: String(err && err.message || err) }
        }) + '\n');
      }
    }
  }
}

function main() {
  if (process.argv.includes('--login')) {
    loginMain().then(() => process.exit(process.exitCode || 0));
    return;
  }
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', (line) => {
    handleLine(line).catch((err) => log(String(err && err.message || err)));
  });
  rl.on('close', () => process.exit(0));
  boot().catch((err) => log(String(err && err.message || err)));
}

if (require.main === module) main();

module.exports = { pickProjectId, projectFromAccessToken };
