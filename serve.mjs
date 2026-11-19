import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'site');
const port = +process.env.PORT || 4817;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.otf':'font/otf','.woff2':'font/woff2','.json':'application/json'};
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, p); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
  const size = fs.statSync(f).size, type = types[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) { const [s, e] = range.replace('bytes=', '').split('-'); const start = +s, end = e ? +e : size - 1;
    res.writeHead(206, {'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1});
    return fs.createReadStream(f, {start, end}).pipe(res); }
  res.writeHead(200, {'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache'});
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('http://localhost:' + port));
