const sharp = require('sharp');
const fs = require('fs');
const dir = 'assets/images';

async function run() {
  // Hero: large source -> responsive webp + jpg fallback
  const hero = `${dir}/hero-produce.jpg`;
  const widths = [800, 1200, 1600, 2000];
  for (const w of widths) {
    await sharp(hero).resize(w).webp({ quality: 72 }).toFile(`${dir}/hero-${w}.webp`);
  }
  await sharp(hero).resize(1600).jpeg({ quality: 80, mozjpeg: true }).toFile(`${dir}/hero-1600.jpg`);

  // Content images -> webp + sized jpg
  for (const name of ['about', 'delivery-center']) {
    const src = `${dir}/${name}.jpg`;
    await sharp(src).resize(900).webp({ quality: 78 }).toFile(`${dir}/${name}.webp`);
    await sharp(src).resize(900).jpeg({ quality: 82, mozjpeg: true }).toFile(`${dir}/${name}-900.jpg`);
  }

  // report
  const files = fs.readdirSync(dir).filter(f => /\.(webp|jpg)$/.test(f));
  for (const f of files) {
    const kb = (fs.statSync(`${dir}/${f}`).size / 1024).toFixed(0);
    console.log(`${f.padEnd(24)} ${kb} KB`);
  }
}
run().catch(e => { console.error(e); process.exit(1); });
