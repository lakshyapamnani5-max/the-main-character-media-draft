const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = 'C:/Users/LAKSHYA/.gemini/antigravity/brain/dfdecdc2-596a-4da4-a021-7147dbe1410d/.user_uploaded/media_1794065230317_9bcec9b2.png';
const srcData = fs.readFileSync(inputPath);
const srcPng = PNG.sync.read(srcData);

// Save copy of raw input to public/logo-original.png
fs.writeFileSync('public/logo-original.png', srcData);

// Exact artwork bounding box: minX: 73, maxX: 486, minY: 149, maxY: 270
const pad = 12;
const cropX = Math.max(0, 73 - pad);
const cropY = Math.max(0, 149 - pad);
const cropW = Math.min(srcPng.width - cropX, (486 - 73 + 1) + pad * 2);
const cropH = Math.min(srcPng.height - cropY, (270 - 149 + 1) + pad * 2);

console.log('Cropping artwork:', { cropX, cropY, cropW, cropH });

// Extract cropped PNG with original white background
const croppedPng = new PNG({ width: cropW, height: cropH });
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = (srcPng.width * (cropY + y) + (cropX + x)) << 2;
    const dstIdx = (cropW * y + x) << 2;
    croppedPng.data[dstIdx] = srcPng.data[srcIdx];
    croppedPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
    croppedPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
    croppedPng.data[dstIdx + 3] = srcPng.data[srcIdx + 3];
  }
}
fs.writeFileSync('public/logo.png', PNG.sync.write(croppedPng));

// Extract cropped PNG with transparent background
const transparentPng = new PNG({ width: cropW, height: cropH });
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = (srcPng.width * (cropY + y) + (cropX + x)) << 2;
    const dstIdx = (cropW * y + x) << 2;
    const r = srcPng.data[srcIdx];
    const g = srcPng.data[srcIdx + 1];
    const b = srcPng.data[srcIdx + 2];
    const br = (r + g + b) / 3;
    const alpha = Math.max(0, Math.min(255, Math.round(255 - br)));
    transparentPng.data[dstIdx] = 18;
    transparentPng.data[dstIdx + 1] = 18;
    transparentPng.data[dstIdx + 2] = 18;
    transparentPng.data[dstIdx + 3] = alpha;
  }
}
fs.writeFileSync('public/logo-transparent.png', PNG.sync.write(transparentPng));

// Bilinear scaling into a target square canvas
function createSquareIcon(targetSize, contentScalePercent = 0.82, bgColor = { r: 255, g: 255, b: 255, a: 255 }) {
  const icon = new PNG({ width: targetSize, height: targetSize });
  
  // Fill background
  for (let i = 0; i < icon.data.length; i += 4) {
    icon.data[i] = bgColor.r;
    icon.data[i + 1] = bgColor.g;
    icon.data[i + 2] = bgColor.b;
    icon.data[i + 3] = bgColor.a;
  }

  const maxW = targetSize * contentScalePercent;
  const maxH = targetSize * contentScalePercent;
  const scale = Math.min(maxW / cropW, maxH / cropH);

  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const startX = (targetSize - drawW) / 2;
  const startY = (targetSize - drawH) / 2;

  for (let dy = 0; dy < targetSize; dy++) {
    const syReal = (dy - startY) / scale;
    if (syReal < 0 || syReal >= cropH - 1) continue;
    const syFloor = Math.floor(syReal);
    const syCeil = Math.min(cropH - 1, syFloor + 1);
    const fy = syReal - syFloor;

    for (let dx = 0; dx < targetSize; dx++) {
      const sxReal = (dx - startX) / scale;
      if (sxReal < 0 || sxReal >= cropW - 1) continue;
      const sxFloor = Math.floor(sxReal);
      const sxCeil = Math.min(cropW - 1, sxFloor + 1);
      const fx = sxReal - sxFloor;

      const idx00 = (cropW * syFloor + sxFloor) << 2;
      const idx10 = (cropW * syFloor + sxCeil) << 2;
      const idx01 = (cropW * syCeil + sxFloor) << 2;
      const idx11 = (cropW * syCeil + sxCeil) << 2;

      const dstIdx = (targetSize * dy + dx) << 2;

      for (let c = 0; c < 3; c++) {
        const top = croppedPng.data[idx00 + c] * (1 - fx) + croppedPng.data[idx10 + c] * fx;
        const bot = croppedPng.data[idx01 + c] * (1 - fx) + croppedPng.data[idx11 + c] * fx;
        icon.data[dstIdx + c] = Math.round(top * (1 - fy) + bot * fy);
      }
      icon.data[dstIdx + 3] = 255;
    }
  }

  return icon;
}

// 1. PWA 512x512
const pwa512 = createSquareIcon(512, 0.86);
fs.writeFileSync('public/pwa-512x512.png', PNG.sync.write(pwa512));

// 2. PWA 192x192
const pwa192 = createSquareIcon(192, 0.86);
fs.writeFileSync('public/pwa-192x192.png', PNG.sync.write(pwa192));

// 3. PWA Maskable 512x512 (Safe zone is 80% circle, content scale ~0.68)
const pwaMaskable = createSquareIcon(512, 0.68);
fs.writeFileSync('public/pwa-maskable-512x512.png', PNG.sync.write(pwaMaskable));

// 4. Apple Touch Icon 180x180
const appleTouch = createSquareIcon(180, 0.84);
fs.writeFileSync('public/apple-touch-icon.png', PNG.sync.write(appleTouch));

// 5. Multi-resolution Favicon.ico (standard Windows / browser multi-resolution ICO)
function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entryBuffers = [];
  const imageBuffers = [];

  for (const { size, buffer } of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entryBuffers.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entryBuffers, ...imageBuffers]);
}

const icoSizes = [16, 32, 48, 64];
const icoEntries = icoSizes.map(sz => {
  const pngObj = createSquareIcon(sz, 0.92);
  return {
    size: sz,
    buffer: PNG.sync.write(pngObj)
  };
});
const icoBuffer = buildIco(icoEntries);
fs.writeFileSync('public/favicon.ico', icoBuffer);

// 6. Modern SVG Icon
const logoPngBase64 = PNG.sync.write(croppedPng).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#FFFFFF" />
  <rect x="12" y="12" width="488" height="488" rx="88" fill="none" stroke="#E8E3D9" stroke-width="4" />
  <image href="data:image/png;base64,${logoPngBase64}" x="36" y="180" width="440" height="152" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
fs.writeFileSync('public/icon.svg', svgContent);

console.log('All icons and PWA assets generated successfully!');
