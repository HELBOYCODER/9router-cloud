import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- helpers ----------
function send(res, code, obj, headers = {}) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, { 'content-type': typeof obj === 'string' ? 'text/html' : 'application/json', ...headers });
  res.end(body);
}
function upstream(urlStr, method, headers, body, timeout = 90000) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(u, { method, headers: { ...headers, host: u.host }, timeout }, (resp) => {
      const chunks = [];
      resp.on('data', (c) => chunks.push(c));
      resp.on('end', () => resolve({ status: resp.statusCode || 500, body: Buffer.concat(chunks).toString(), headers: resp.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('upstream timeout')));
    if (body) req.write(body);
    req.end();
  });
}

// ---------- provider registry ----------
// ponytail: providers از فایل کانفیگ خونده میشن؛ کلیدها از env
const DEFAULT_PROVIDERS = {
  // name -> { baseUrl, models:[...], keyEnv }
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    keyEnv: 'OPENROUTER_API_KEY',
    models: ['stealth/union-alpha'],
  },
};

function loadProviders() {
  if (process.env.PROVIDERS_JSON) {
    try { return JSON.parse(process.env.PROVIDERS_JSON); } catch {}
  }
  const cfgPath = path.join(__dirname, 'providers.json');
  if (fs.existsSync(cfgPath)) {
    try { return JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch {}
  }
  return DEFAULT_PROVIDERS;
}

// ---------- OpenAI-compatible endpoint ----------
async function chatCompletions(req, res, body) {
  let payload;
  try { payload = JSON.parse(body); } catch { return send(res, 400, { error: { message: 'invalid JSON body' } }); }
  const model = payload.model || '';
  if (!model) return send(res, 400, { error: { message: 'missing model' } });

  const providers = loadProviders();
  // match: provider/model یا مدل خالی
  let provName = Object.keys(providers).find((k) => model.startsWith(k + '/'));
  let modelName = model;
  if (provName) {
    modelName = model.slice(provName.length + 1);
  } else {
    // مدل بدون پیشوند → اولین provider که مدل رو داره
    provName = Object.keys(providers).find((k) => providers[k].models.includes(model)) || Object.keys(providers)[0];
  }
  const prov = providers[provName];
  if (!prov) return send(res, 404, { error: { message: `unknown provider for model ${model}` } });

  const key = process.env[prov.keyEnv] || '';
  if (!key) return send(res, 401, { error: { message: `env ${prov.keyEnv} not set on server` } });

  const up = await upstream(
    prov.baseUrl + '/chat/completions',
    'POST',
    { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    JSON.stringify({ ...payload, model: modelName })
  );
  send(res, up.status, up.body);
}

// ---------- routing ----------
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  try {
    if (u.pathname === '/' || u.pathname === '/health' || u.pathname === '/healthz') {
      return send(res, 200, {
        ok: true,
        service: '9router-cloud',
        usage: 'POST /v1/chat/completions  header: Authorization: Bearer <key>',
        providers: Object.keys(loadProviders()),
      });
    }
    if (u.pathname === '/v1/models' || u.pathname === '/models') {
      const providers = loadProviders();
      const data = Object.entries(providers).flatMap(([k, p]) => p.models.map((m) => ({ id: `${k}/${m}`, object: 'model' })));
      return send(res, 200, { object: 'list', data });
    }
    if (u.pathname === '/v1/chat/completions' || u.pathname === '/chat/completions') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      return chatCompletions(req, res, Buffer.concat(chunks).toString());
    }
    if (u.pathname === '/dashboard' || u.pathname === '/') {
      const p = path.join(__dirname, '9router-dashboard.html');
      if (fs.existsSync(p)) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(fs.readFileSync(p, 'utf8'));
      }
      return send(res, 200, { ok: true, service: '9router-cloud' });
    }
    send(res, 404, { error: 'unknown route', hint: 'use /v1/chat/completions or /v1/models' });
  } catch (err) {
    send(res, 500, { error: { message: String(err.message || err) } });
  }
});
server.listen(PORT, () => console.log(`9router-cloud listening on :${PORT}`));
