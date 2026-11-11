// Generates the app icons (exercise photos live in public/media as <id>-0.jpg / <id>-1.jpg).
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// ---- icons (solid dark tile with a gold five-point star), written as PNG without dependencies ----
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };

function starPng(size) {
  const px = Buffer.alloc((size * 4 + 1) * size);
  const cx = size / 2, cy = size / 2 + size * 0.02, R = size * 0.34, r = R * 0.45;
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rad = i % 2 ? r : R; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; });
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  for (let y = 0; y < size; y++) {
    px[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (const [ox, oy] of [[.25, .25], [.75, .25], [.25, .75], [.75, .75]]) hit += inside(x + ox, y + oy) ? 1 : 0;
      const t = hit / 4, o = y * (size * 4 + 1) + 1 + x * 4;
      px[o] = Math.round(14 + (242 - 14) * t); px[o + 1] = Math.round(17 + (193 - 17) * t); px[o + 2] = Math.round(22 + (78 - 22) * t); px[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(px)), chunk('IEND', Buffer.alloc(0))]);
}
const pub = new URL('../public/', import.meta.url).pathname;
writeFileSync(pub + 'icon-192.png', starPng(192));
writeFileSync(pub + 'icon-512.png', starPng(512));
writeFileSync(pub + 'apple-touch-icon.png', starPng(180));
writeFileSync(pub + 'icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0e1116"/><polygon fill="#f2c14e" points="50,17 59,41 84,41 64,57 71,82 50,67 29,82 36,57 16,41 41,41"/></svg>\n`);
console.log('wrote icons');
