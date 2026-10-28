// usage: node snap.js <entry.html> <w> <h> <outdir> t1 t2 ...
const { chromium } = require('playwright');
(async () => {
  const [entry, w, h, out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://localhost:8765/template/${entry}`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__vaReady);
  for (const t of ts) { await p.evaluate(x => window.setT(x), +t); await p.screenshot({ path: `${out}/${entry.replace('.html','')}_${t}.png`, omitBackground: true }); }
  await b.close();
})();
