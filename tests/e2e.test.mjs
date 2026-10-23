// End-to-end walk-through in a real browser: admin creates a perfume, a shopper
// finds it, picks a size, checks out in Arabic, and the admin fulfils the order.
import { createRequire } from 'node:module';
const require = createRequire(process.env.PLAYWRIGHT_REQUIRE_FROM || import.meta.url);
const { chromium } = require('playwright');
const B = process.env.BASE_URL || 'http://localhost:3000';
const OUT = process.argv[2] || 'tests/screenshots';
(await import('node:fs')).mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem('nr_loaded', '1'); } catch {} });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
let n = 0; const ok = (m) => console.log(`PASS  ${++n}. ${m}`);
const shot = (name) => p.screenshot({ path: `${OUT}/${name}.png` });
const stamp = Date.now().toString().slice(-5);
const NAME = `Test Musk ${stamp}`;
const setLang = (c, lang) => c.addCookies([{ name: 'lang', value: lang, url: B }]);

// 1. admin login
await p.goto(B + '/admin/login');
await p.fill('#email', process.env.ADMIN_EMAIL || 'owner@noire.test'); await p.fill('#pw', process.env.ADMIN_PASSWORD || 'NoireOwner2026');
await p.click('button:has-text("Sign in")');
await p.waitForURL(B + '/admin'); await p.waitForSelector('h1:has-text("Dashboard")');
ok('Admin signed in');

// 2. create a perfume with two sizes, Arabic name and notes, then publish
await p.goto(B + '/admin/products/new');
await p.fill('#p-brand', 'Test House');
await p.fill('#p-sku', `NR-T${stamp}`);
await p.fill('#p-name', NAME);
await p.fill('#p-name-ar', `مسك تجريبي ${stamp}`);
await p.fill('#p-desc', 'A soft white musk created by the end-to-end check.');
await p.selectOption('#p-gender', 'women');
await p.selectOption('#p-family', 'musky');
await p.fill('input[aria-label="Price"] >> nth=0', '1500');
await p.fill('input[aria-label="Price"] >> nth=1', '2500');
await p.fill('input[aria-label="Stock"] >> nth=0', '5');
await p.fill('input[aria-label="Stock"] >> nth=1', '2');
await p.fill('#n-top', 'Pear, Bergamot'); await p.fill('#n-top-ar', 'كمثرى، برجموت');
await p.fill('#n-base', 'White musk'); await p.fill('#n-base-ar', 'مسك أبيض');
await p.check('label.check:has-text("Gift Picks") input');
await p.setInputFiles('.dropzone input[type=file] >> nth=0', 'seed-assets/products/rose-velours-front.jpg');
await p.waitForSelector('.img-tile img');
await p.click('button:has-text("Save & publish")');
await p.waitForURL(/\/admin\/products\/\d+$/); await p.waitForSelector('.pill.published');
ok('Perfume created with two sizes, Arabic text, notes and image'); await shot('01-product-editor');
const slug = await p.inputValue('#p-slug');

// 3. storefront search + filters (English)
await setLang(ctx, 'en');
await p.goto(`${B}/shop?q=${encodeURIComponent('Test Musk')}`);
await p.waitForSelector(`.card-name:has-text("${NAME}")`);
ok('Found by storefront search');
await p.goto(`${B}/shop?gender=women&family=musky`);
await p.waitForSelector(`.card-name:has-text("${NAME}")`);
ok('Appears under Women + Musky filters');
await p.goto(`${B}/shop?gender=men`);
if (await p.locator(`.card-name:has-text("${NAME}")`).count()) throw new Error('filter leak');
ok('Excluded from the Men filter');

// 4. Arabic product page: Arabic name, notes, size price switch, add to bag
await setLang(ctx, 'ar');
await p.goto(`${B}/product/${slug}`);
await p.waitForSelector(`h1:has-text("مسك تجريبي ${stamp}")`);
if ((await p.getAttribute('html', 'dir')) !== 'rtl') throw new Error('not rtl');
await p.waitForSelector('.note:has-text("كمثرى")');
await p.click('.size-opt:has-text("100")');
const priceTxt = await p.textContent('.buy .price.big');
if (!priceTxt.includes('2,500')) throw new Error('size price not applied: ' + priceTxt);
ok('Arabic product page: RTL, Arabic name and notes, size changes the price');
await p.click('.buy-row button.grow');
await p.waitForSelector('.drawer');
const drawerTxt = await p.textContent('.drawer');
if (!drawerTxt.includes('100 ml')) throw new Error('size not in bag');
ok('100 ml size added to the bag'); await shot('02-ar-product-drawer');
await p.click('.drawer button[aria-label="قفل"]');

// 5. bag: quantity + discount
await p.goto(B + '/cart');
await p.waitForSelector('.cart-line');
await p.click('.cart-line >> nth=0 >> button[aria-label="زوّد الكمية"]');
await p.waitForFunction(() => document.querySelector('.cart-line input').value === '2');
await p.fill('#code', 'WELCOME10'); await p.click('button:has-text("طبّق")');
await p.waitForSelector('text=كود WELCOME10 اتطبق');
ok('Quantity 2 and WELCOME10 applied in Arabic bag'); await shot('03-ar-cart');
await p.reload(); await p.waitForSelector('.cart-line');
ok('Bag kept after refresh');

// 6. checkout in Arabic
await p.goto(B + '/checkout');
await p.waitForSelector('#co-name');
await p.click('.summary button.btn.block');
await p.waitForSelector('.field.has-error');
const errTxt = await p.textContent('.field.has-error .err');
if (!/اكتب/.test(errTxt)) throw new Error('validation not arabic: ' + errTxt);
ok('Validation messages shown in Arabic');
await p.fill('#co-name', 'يوسف عادل');
await p.fill('#co-phone', '0100' + stamp + '12');
await p.selectOption('#co-region', 'Giza');
await p.selectOption('#co-city', 'Dokki');
await p.fill('#co-address', '14 شارع التحرير، عمارة 2، شقة 7');
await p.waitForTimeout(800);
const totalText = await p.textContent('.summary .total b');
await shot('04-ar-checkout');
await p.click('.summary button.btn.block');
await p.waitForURL(/\/order\/NR-\d+\?t=/, { timeout: 30000 });
const number = (await p.textContent('.num-big')).trim();
ok(`Order ${number} placed; total ${totalText}`); await shot('05-ar-confirmation');
const cartAfter = await p.evaluate(() => JSON.parse(localStorage.getItem('nr_cart_v1') || '[]').length);
if (cartAfter !== 0) throw new Error('cart not cleared');
ok('Bag cleared after order');

// 7. admin: order + stock
await p.goto(`${B}/admin/orders?q=${number}`);
await p.click(`a:has-text("${number}")`);
await p.waitForSelector('h1.mono');
ok('Order visible in admin'); await shot('06-admin-order');
await p.click('button.btn:has-text("confirmed")'); await p.waitForSelector('.pill.confirmed');
ok('Order confirmed');
await p.goto(`${B}/admin/inventory?q=T${stamp}`);
await p.waitForSelector('.tbl tbody tr');
const big = (await p.locator('.tbl tbody tr', { hasText: '100 ml' }).locator('td.r .pill').first().textContent()).trim();
if (big !== '0') throw new Error('100 ml stock not decremented: ' + big);
ok('100 ml stock went 2 → 0');

// 8. Arabic content editing
await p.goto(B + '/admin/content?tab=home&lang=ar');
await p.fill('#ar-hero-headline', 'ريحتك، توقيعك.');
await p.click('button:has-text("Save & publish")'); await p.waitForSelector('.adm-toast:has-text("Saved")');
await p.goto(B + '/'); await p.waitForSelector('h1[aria-label="ريحتك، توقيعك."]');
ok('Arabic headline edited from admin');
await p.goto(B + '/admin/content?tab=home&lang=ar');
await p.fill('#ar-hero-headline', 'لاقي الريحة اللي بتفضل معاك.');
await p.click('button:has-text("Save & publish")'); await p.waitForSelector('.adm-toast:has-text("Saved")');

// 9. finder quiz
await p.goto(B + '/finder');
for (let i = 0; i < 4; i++) { await p.click('.finder-opt >> nth=0'); await p.waitForTimeout(400); }
await p.waitForSelector('.finder-results .card');
ok('Scent finder returns matches'); await shot('07-finder');

// 10. mobile, both languages
for (const lang of ['ar', 'en']) {
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await setLang(m, lang);
  await m.addInitScript(() => { try { sessionStorage.setItem('nr_loaded', '1'); } catch {} });
  const mp = await m.newPage();
  for (const u of ['/', '/shop', `/product/${slug}`, '/checkout', '/collections', '/finder']) {
    await mp.goto(B + u); await mp.waitForTimeout(1200);
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 0) throw new Error(`horizontal overflow on ${lang} ${u}: ${over}px`);
  }
  await mp.goto(B + '/'); await mp.waitForTimeout(1500); await mp.screenshot({ path: `${OUT}/m-${lang}-home.png` });
  await m.close();
}
ok('Mobile pages render without horizontal overflow in Arabic and English');
console.log(errs.length ? `page errors: ${errs.slice(0, 5).join(' | ')}` : 'no page errors');
await b.close();
