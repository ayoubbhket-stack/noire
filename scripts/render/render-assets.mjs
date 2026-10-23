// Renders the sample product photography and campaign imagery from the
// procedural 3D bottle, using headless Chromium.
// Usage: node scripts/render/render-assets.mjs [products|campaign]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
import { products } from '../catalog.mjs';

const require = createRequire(process.env.PLAYWRIGHT_REQUIRE_FROM || import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const out = path.join(root, 'seed-assets');
const only = process.argv[2];
for (const d of ['products', 'campaign']) { if (only && only !== d) continue; fs.rmSync(path.join(out, d), { recursive: true, force: true }); fs.mkdirSync(path.join(out, d), { recursive: true }); }
fs.rmSync(path.join(out, 'models'), { recursive: true, force: true });

const srv = await serve(4791, root);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto('http://localhost:4791/scripts/render/render.html');
await page.waitForFunction(() => window.ready, null, { timeout: 60000 });

const save = (file, dataUrl) => fs.writeFileSync(path.join(out, file), Buffer.from(dataUrl.split(',')[1], 'base64'));
const P = Object.fromEntries(products.map((p) => [p.slug, p.style]));

if (!only || only === 'products') {
  for (const p of products) {
    for (const angle of ['front', 'side', 'top']) {
      save(`products/${p.slug}-${angle}.jpg`, await page.evaluate((o) => window.renderShot(o), { style: p.style, bg: p.bg, angle }));
    }
    console.log('rendered', p.slug);
  }
}

if (!only || only === 'campaign') {
  const scenes = {
    'hero-poster': { w: 1800, h: 1100, bg: 'cream', cam: [0, 4, 36], look: [0, -1, 0], floor: -6, items: [
      { style: P['santal-nuit'], pos: [-7.5, 0, -3], rot: [0, 0.5, 0], scale: 1.15 },
      { style: P['rose-velours'], pos: [0.5, 0, 2], rot: [0, -0.3, 0], scale: 1.25 },
      { style: P['oud-royale'], pos: [8, 0, -2], rot: [0, -0.6, 0], scale: 1.1 }],
      shapes: [{ kind: 'cyl', r: 5, h: 0.6, pos: [0.5, -5.7, 2], color: '#e6dccd' }, { kind: 'sphere', r: 0.9, pos: [-12, -5.1, 3], color: '#d8c4a4' }] },
    'col-oud-oriental': { w: 1600, h: 1100, bg: 'sand', cam: [0, 3, 40], look: [0, 0, 0], floor: -5, items: [{ style: P['oud-royale'], pos: [-3, 0, 0], rot: [0, 0.4, 0], scale: 1.2 }, { style: P['ambre-sultan'], pos: [4.5, 0, -2], rot: [0, -0.5, 0] }] },
    'col-fresh': { w: 1600, h: 1100, bg: 'sage', cam: [0, 3, 40], look: [0, 0, 0], floor: -5, items: [{ style: P['bleu-marin'], pos: [-3.5, 0, -1], rot: [0, 0.4, 0], scale: 1.1 }, { style: P['the-vert'], pos: [3.5, 0, 1], rot: [0, -0.3, 0], scale: 1.1 }] },
    'col-floral': { w: 1600, h: 1100, bg: 'blush', cam: [0, 3, 40], look: [0, 0, 0], floor: -5, items: [{ style: P['rose-velours'], pos: [-3.5, 0, 0], rot: [0, 0.3, 0], scale: 1.15 }, { style: P['iris-poudre'], pos: [4, 0, -1], rot: [0, -0.4, 0] }] },
    'col-evening': { w: 1600, h: 1100, bg: 'night', cam: [0, 3, 40], look: [0, 0, 0], floor: -5, items: [{ style: P['vanille-noire'], pos: [-3.5, 0, 0], rot: [0, 0.3, 0], scale: 1.1 }, { style: P['cuir-fume'], pos: [4, 0, -1], rot: [0, -0.4, 0], scale: 1.1 }] },
    'col-gifts': { w: 1600, h: 1100, bg: 'cream', cam: [0, 3, 38], look: [0, -1, 0], floor: -5, items: [{ style: P['jasmin-soleil'], pos: [-6, 0, -1], rot: [0, 0.4, 0] }, { style: P['neroli-blanc'], pos: [0, 0, 1], rot: [0, 0, 0], scale: 1.1 }, { style: P['the-vert'], pos: [6, 0, -1], rot: [0, -0.4, 0] }],
      shapes: [{ kind: 'ring', r: 9, t: 0.08, pos: [0, -4.9, 0], rot: [Math.PI / 2, 0, 0], color: '#c9a45c', metal: true }] },
    'campaign-a': { w: 1600, h: 2000, bg: 'blush', cam: [0, 3, 40], look: [0, 0, 0], floor: -8, items: [{ style: P['rose-velours'], pos: [0, 0, 0], rot: [0, -0.25, 0], scale: 1.9 }],
      shapes: [{ kind: 'sphere', r: 1.6, pos: [-7, -6.4, 3], color: '#e9b8bd' }, { kind: 'sphere', r: 0.9, pos: [6, -7.1, 4], color: '#efd6cf' }] },
    'campaign-b': { w: 1600, h: 1000, bg: 'sand', cam: [0, 2, 30], look: [0, -1, 0], floor: -5, items: [{ style: P['santal-nuit'], pos: [0, 0, 0], rot: [0, -0.35, 0], scale: 1.35 }] },
    'about-macro': { w: 1600, h: 1100, bg: 'cream', cam: [3, 1, 15], look: [0, 0, 0], floor: -5, items: [{ style: P['neroli-blanc'], pos: [0, 0, 0], rot: [0, -0.6, 0] }] },
    'about-shelf': { w: 1200, h: 1500, bg: 'stone', cam: [0, 4, 42], look: [0, -1, 0], floor: -8, items: [
      { style: P['iris-poudre'], pos: [-4, 0, 0], rot: [0, 0.3, 0] }, { style: P['cuir-fume'], pos: [3.5, 0, -2], rot: [0, -0.3, 0] }, { style: P['jasmin-soleil'], pos: [0, 0, 4], rot: [0, 0.1, 0], scale: 0.9 }] },
    'about-oud': { w: 1600, h: 1100, bg: 'night', cam: [0, 2, 26], look: [0, -1, 0], floor: -5, items: [{ style: P['oud-royale'], pos: [0, 0, 0], rot: [0, 0.4, 0], scale: 1.3 }] },
  };
  for (const [name, sc] of Object.entries(scenes)) {
    save(`campaign/${name}.jpg`, await page.evaluate((o) => window.renderScene(o), sc));
    console.log('rendered', name);
  }
}

await browser.close();
srv.close();
