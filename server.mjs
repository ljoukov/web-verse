import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only this ignored file is loaded. Secrets never become browser assets.
try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const { handleApi } = await import('./backend/api.mjs');
const root = fileURLToPath(new URL('./public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };

export function createServer() {
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    try {
      if (await handleApi(req, res)) return;
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Method not allowed'); return; }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let path = resolve(root, '.' + pathname);
      if (path !== root.slice(0, -1) && !path.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      if (!path.startsWith(root) || path.split(sep).some(part => part.startsWith('.'))) { res.writeHead(404); res.end('Not found'); return; }
      const file = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : file);
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      const status = ['ENOENT', 'ENOTDIR', 'URIError'].includes(error.code || error.name) ? 404 : 500;
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(status === 404 ? 'Page not found' : 'Could not complete request');
      if (status === 500) console.error('Request failed:', error.name);
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 16000;
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  createServer().listen(port, host, () => {
    console.log('WebVerse repair sites: http://localhost:' + port);
    console.log('  /stillwater  /goodhands  /formfield');
  });
}
