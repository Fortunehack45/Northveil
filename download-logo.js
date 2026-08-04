import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log("⚡ DOWNLOADING NORTHVEIL LOGO FROM https://iili.io/CU64M11.png...\n");

  const res = await fetch('https://iili.io/CU64M11.png');
  if (!res.ok) {
    console.error("Failed to download image:", res.statusText);
    return;
  }

  const buffer = await res.arrayBuffer();
  const fileData = Buffer.from(buffer);

  const targets = [
    'public/logo.png',
    'public/favicon.png',
    'public/favicon.ico',
    'src/assets/logo.png'
  ];

  for (const t of targets) {
    const fullPath = path.resolve(t);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileData);
    console.log(`✅ Saved logo to: ${t} (${fileData.length} bytes)`);
  }
})();
