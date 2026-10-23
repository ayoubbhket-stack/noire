// Loads the sample catalogue, collections, imagery and default content.
// Used by /admin/setup ("load sample products") and by `npm run db:seed`.
import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import * as s from '../db/schema.js';
import { categories, collections, products, stockFor, sampleReviews } from '../../scripts/catalog.mjs';
import { DEFAULTS } from './defaults.js';

export async function catalogueCount(db) {
  const res = await db.execute(sql`select count(*)::int as n from products`);
  return (res.rows || res)[0].n;
}

export async function seedDatabase(db, { assetsDir = path.join(process.cwd(), 'seed-assets'), force = false } = {}) {
  const n = await catalogueCount(db);
  if (n > 0 && !force) return { skipped: true, products: n };
  if (force) {
    await db.execute(sql`truncate order_items, order_events, payments, discount_redemptions, orders, customers, stock_movements, reviews, product_images, product_variants, product_collections, products, collections, categories, discounts, media restart identity cascade`);
  }

  await db.transaction(async (tx) => {
    const putMedia = async (rel, mime = 'image/jpeg') => {
      const file = path.join(assetsDir, rel);
      const data = fs.readFileSync(file);
      const [m] = await tx.insert(s.media).values({ filename: path.basename(file), mime, size: data.length, data }).returning({ id: s.media.id });
      return m.id;
    };
    const catIds = {};
    for (const c of categories) {
      const [row] = await tx.insert(s.categories).values(c).returning();
      catIds[c.slug] = row.id;
    }
    const colIds = {};
    for (const c of collections) {
      const coverMediaId = await putMedia(`campaign/col-${c.slug}.jpg`);
      const [row] = await tx.insert(s.collections).values({ ...c, coverMediaId }).returning();
      colIds[c.slug] = row.id;
    }

    let t = Date.now() - products.length * 86400000;
    for (const p of products) {
      t += 86400000;
      const sizes = p.sizes.map(([volume, price, sale]) => ({ volume, price: price * 100, salePrice: sale ? sale * 100 : null }));
      const cheapest = [...sizes].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0];
      const [prod] = await tx.insert(s.products).values({
        name: p.name, nameAr: p.nameAr, slug: p.slug, sku: p.sku, brand: p.brand,
        description: p.description, descriptionAr: p.descriptionAr, categoryId: catIds[p.category],
        price: cheapest.price, salePrice: cheapest.salePrice,
        gender: p.gender, family: p.family, concentration: p.concentration,
        specs: p.specs, bottleStyle: p.style, status: 'published',
        featured: !!p.featured, newArrival: !!p.newArrival,
        seoTitle: `${p.brand} ${p.name}`, seoDescription: p.description.slice(0, 155),
        createdAt: new Date(t), updatedAt: new Date(t),
      }).returning();
      for (const c of p.collections) await tx.insert(s.productCollections).values({ productId: prod.id, collectionId: colIds[c] });
      let order = 0;
      for (const angle of ['front', 'side', 'top']) {
        const rel = `products/${p.slug}-${angle}.jpg`;
        if (!fs.existsSync(path.join(assetsDir, rel))) continue;
        const mediaId = await putMedia(rel);
        await tx.insert(s.productImages).values({ productId: prod.id, mediaId, alt: `${p.brand} ${p.name}`, sortOrder: order++ });
      }
      for (const z of sizes) {
        const sku = `${p.sku}-${z.volume}`;
        const stock = p.soldOut ? 0 : stockFor(sku);
        const [v] = await tx.insert(s.productVariants).values({
          productId: prod.id, sku, volume: z.volume, price: z.price, salePrice: z.salePrice, costPrice: Math.round(z.price * 0.55), stock,
        }).returning();
        await tx.insert(s.stockMovements).values({ variantId: v.id, delta: stock, stockAfter: stock, reason: 'initial', note: 'Opening stock (sample)' });
      }
    }
    // Sample reviews are clearly labelled; delete them from Admin → Inbox → Reviews before launch.
    for (const [slug, , city, rating, title, body] of sampleReviews) {
      const res = await tx.execute(sql`select id from products where slug = ${slug}`);
      const id = (res.rows || res)[0]?.id;
      if (id) await tx.insert(s.reviews).values({ productId: id, name: 'Sample review', city, rating, title, body, status: 'approved' });
    }
    await tx.insert(s.discounts).values([
      { code: 'WELCOME10', description: '10% off your first order', type: 'percent', value: 10, minOrder: 300000, perCustomerOnce: true },
      { code: 'OUD500', description: 'EGP 500 off Oud & Oriental', type: 'fixed', value: 50000, appliesTo: 'collection', targetId: colIds['oud-oriental'], usageLimit: 100 },
    ]);
    const hero = await putMedia('campaign/hero-poster.jpg');
    const campA = await putMedia('campaign/campaign-a.jpg');
    const campB = await putMedia('campaign/campaign-b.jpg');
    const aboutImgs = [await putMedia('campaign/about-macro.jpg'), await putMedia('campaign/about-shelf.jpg'), await putMedia('campaign/about-oud.jpg')];
    const home = structuredClone(DEFAULTS.home);
    home.hero.imageMediaId = hero;
    home.campaignImages = [campA, campB];
    const about = { ...DEFAULTS.about, images: aboutImgs };
    for (const [key, value] of Object.entries({ ...DEFAULTS, home, about })) {
      await tx.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
    }
  });
  return { skipped: false, products: products.length, collections: collections.length };
}
