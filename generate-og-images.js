/**
 * generate-og-images.js
 * Generates static og-image.png and og-image.webp in public/
 * Run: node generate-og-images.js  (after `npm run build` or on a running dev server)
 *
 * Requires: sharp  (npm install --save-dev sharp)
 */
const sharp = require('sharp');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const BASE_URL  = process.env.OG_BASE_URL || 'http://localhost:3000';
const OG_ROUTE  = `${BASE_URL}/opengraph-image`;
const OUT_DIR   = path.join(__dirname, 'public');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Fetching OG image from ${OG_ROUTE} …`);
  const pngBuffer = await fetchBuffer(OG_ROUTE);

  // PNG
  const pngOut = path.join(OUT_DIR, 'og-image.png');
  fs.writeFileSync(pngOut, pngBuffer);
  console.log(`✓ Saved ${pngOut}`);

  // WebP (convert from PNG via sharp)
  const webpOut = path.join(OUT_DIR, 'og-image.webp');
  await sharp(pngBuffer).webp({ quality: 90 }).toFile(webpOut);
  console.log(`✓ Saved ${webpOut}`);

  console.log('\n✅ OG images generated. Commit public/og-image.png and public/og-image.webp.');
}

run().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
