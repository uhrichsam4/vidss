// Tiny static server for the film (ES modules + fetch need http). Exported for the render tools; run directly to preview.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '..')
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.wav': 'audio/wav'}
export function serve(port = 0) {
  const server = http.createServer((req, res) => {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]))
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end() }
    res.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res)
  })
  return new Promise((r) => server.listen(port, () => r({server, url: `http://127.0.0.1:${server.address().port}`})))
}
if (process.argv[1] === import.meta.filename) { const {url} = await serve(8765); console.log('preview at', url + '/index.html') }
