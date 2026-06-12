const sharp = require('sharp');
const fs = require('fs');

async function processDir(dir, width, q) {
  const files = fs.readdirSync(dir).filter(f => /\.jpe?g$/i.test(f) && !/-\d+\.jpg$/.test(f));
  for (const f of files) {
    const base = f.replace(/\.jpe?g$/i, '');
    const src = `${dir}/${f}`;
    const buf = fs.readFileSync(src);
    await sharp(buf).rotate().resize(width, null, { withoutEnlargement: true }).webp({ quality: q }).toFile(`${dir}/${base}.webp`);
    await sharp(buf).rotate().resize(width, null, { withoutEnlargement: true }).jpeg({ quality: q + 6, mozjpeg: true }).toFile(`${dir}/${base}.jpg.tmp`);
    fs.renameSync(`${dir}/${base}.jpg.tmp`, `${dir}/${base}.jpg`);
  }
  return files.length;
}

(async () => {
  const m = await processDir('assets/images/members', 640, 74);
  const w = await processDir('assets/images/work', 900, 76);
  console.log(`members: ${m} processed, work: ${w} processed`);
  let total = 0;
  for (const d of ['assets/images/members', 'assets/images/work']) {
    fs.readdirSync(d).forEach(f => { total += fs.statSync(`${d}/${f}`).size; });
  }
  console.log(`combined image weight: ${(total / 1024).toFixed(0)} KB`);
})().catch(e => { console.error(e); process.exit(1); });
