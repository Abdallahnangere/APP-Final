const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon.ico' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateIcons() {
  try {
    console.log('🎨 Generating favicon and Apple icons...');
    
    for (const { size, name } of sizes) {
      await sharp('public/images/logo-original.png')
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png({ quality: 90, effort: 9 })
        .toFile(`public/${name}`);
      
      console.log(`✓ Generated ${name} (${size}×${size})`);
    }

    // Generate manifest.json for PWA
    const manifest = {
      name: "SaukiMart - Nigeria's Fastest Mobile Commerce",
      short_name: "SaukiMart",
      description: "Buy instant mobile data, airtime, and premium gadgets across Nigeria",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#007AFF",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable" }
      ],
      categories: ["shopping", "productivity"],
      screenshots: [
        { src: "/images/logo.png", sizes: "256x256", type: "image/png", form_factor: "narrow" }
      ]
    };

    fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✓ Generated manifest.json');

    console.log('\n✅ All icons generated successfully!');
  } catch (err) {
    console.error('❌ Error generating icons:', err.message);
  }
}

generateIcons();
