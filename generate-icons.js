import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#121826"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="106" fill="none" stroke="#1e293b" stroke-width="8"/>

  <!-- Barbell Bar -->
  <rect x="76" y="244" width="360" height="24" rx="6" fill="url(#metalGrad)"/>

  <!-- Left Inner Collar -->
  <rect x="140" y="216" width="16" height="80" rx="5" fill="#475569"/>

  <!-- Left Plates -->
  <rect x="100" y="160" width="32" height="192" rx="10" fill="url(#emeraldGrad)"/>
  <rect x="68" y="190" width="24" height="132" rx="8" fill="#3b82f6"/>

  <!-- Right Inner Collar -->
  <rect x="356" y="216" width="16" height="80" rx="5" fill="#475569"/>

  <!-- Right Plates -->
  <rect x="380" y="160" width="32" height="192" rx="10" fill="url(#emeraldGrad)"/>
  <rect x="420" y="190" width="24" height="132" rx="8" fill="#3b82f6"/>

  <!-- 5x5 Text Accent -->
  <text x="256" y="410" text-anchor="middle" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" letter-spacing="4">5×5</text>
</svg>
`);

async function generate() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgBuffer);
  console.log('Saved favicon.svg');
}

generate().catch(console.error);
