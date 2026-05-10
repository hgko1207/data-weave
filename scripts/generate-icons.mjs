import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
mkdirSync(publicDir, { recursive: true });

// emerald + cyan accent on zinc-950 — matches DESIGN.md tokens
function makeSvg({ size, maskable }) {
  const inset = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - inset * 2;
  const dot = Math.round(inner * 0.08);
  const dotX = inset + Math.round(inner * 0.14);
  const dotY = inset + Math.round(inner * 0.18);
  const fontSize = Math.round(inner * 0.62);
  const textY = inset + Math.round(inner * 0.74);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="0.3" cy="0.2" r="1.2">
      <stop offset="0" stop-color="#1f2937"/>
      <stop offset="1" stop-color="#09090b"/>
    </radialGradient>
    <radialGradient id="dot" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0" stop-color="#34d399"/>
      <stop offset="1" stop-color="#10b981"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : Math.round(size * 0.18)}" fill="url(#bg)"/>
  <circle cx="${dotX}" cy="${dotY}" r="${dot}" fill="url(#dot)" opacity="0.95"/>
  <text x="50%" y="${textY}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="#f4f4f5" text-anchor="middle" letter-spacing="-${Math.round(fontSize * 0.06)}">D</text>
</svg>`;
}

async function emit(name, size, maskable = false) {
  const svg = makeSvg({ size, maskable });
  const out = resolve(publicDir, name);
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`wrote ${name} (${size}x${size}${maskable ? " maskable" : ""})`);
}

await emit("icon-192.png", 192);
await emit("icon-512.png", 512);
await emit("icon-maskable.png", 512, true);

// also drop the source SVG so it can be inlined as needed
writeFileSync(resolve(publicDir, "icon.svg"), makeSvg({ size: 512, maskable: false }));
console.log("wrote icon.svg");
