// Create/update products from the admin editor in one transaction.
import 'server-only';
import { z } from 'zod';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { HttpError } from './auth';
import { BOTTLE_SHAPES, CAP_STYLES } from './three/bottle';
import { CONCENTRATIONS, FAMILIES, GENDERS, SEASONS } from './perfume';

const money = z.coerce.number().min(0, 'Must be 0 or more.').max(10000000).transform((v) => Math.round(v * 100));
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #C9A45C.');
const notes = z.string().trim().max(300).default('');


export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter a product name.').max(120),
  nameAr: z.string().trim().max(120).default(''),
  brand: z.string().trim().min(1, 'Enter the brand.').max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes.').max(120),
  sku: z.string().trim().toUpperCase().min(2, 'Enter a SKU.').max(40),
  description: z.string().trim().max(5000).default(''),
  descriptionAr: z.string().trim().max(5000).default(''),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  collectionIds: z.array(z.coerce.number().int().positive()).default([]),
  gender: z.enum(GENDERS),
  family: z.enum(FAMILIES),
  concentration: z.enum(CONCENTRATIONS),
  specs: z.object({
    top: notes, heart: notes, base: notes, topAr: notes, heartAr: notes, baseAr: notes,
    longevity: z.coerce.number().int().min(1).max(5).default(3),
    sillage: z.coerce.number().int().min(1).max(5).default(3),
    seasons: z.array(z.enum(SEASONS)).default([]),
  }).default({}),
  bottleStyle: z.object({
    shape: z.enum(BOTTLE_SHAPES).default('classic'), cap: z.enum(CAP_STYLES).default('cube'),
    liquidHex: hex.default('#e2a35c'), capHex: hex.default('#c9a45c'), glassHex: hex.optional(), capMetal: z.boolean().default(true),
  }).default({}),
  modelMediaId: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  seoTitle: z.string().trim().max(70, 'Keep the SEO title under 70 characters.').default(''),
  seoDescription: z.string().trim().max(170, 'Keep the meta description under 170 characters.').default(''),
  images: z.array(z.object({ mediaId: z.string().uuid(), alt: z.string().trim().max(200).default('') })).max(40).default([]),
  variants: z.array(z.object({
    id: z.number().int().positive().optional(),
    sku: z.string().trim().toUpperCase().min(2, 'Size SKU required.').max(60),
    volume: z.coerce.number().int().min(1, 'Enter the size in ml.').max(5000),
    price: money,
    salePrice: money.nullable().optional(),
    costPrice: money.nullable().optional(),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative.').max(100000),
    stockOriginal: z.coerce.number().int().optional(), // stock when the editor loaded; lets concurrent sales be preserved
    active: z.boolean().default(true),
  })).min(1, 'Add at least one size.').max(20),
}).superRefine((d, ctx) => {
  const vols = new Set(); const skus = new Set();
  d.variants.forEach((v, i) => {
    if (v.salePrice != null && v.salePrice >= v.price) ctx.addIssue({ path: ['variants', i, 'salePrice'], code: 'custom', message: 'Sale price must be lower than the price.' });
    if (vols.has(v.volume)) ctx.addIssue({ path: ['variants', i, 'volume'], code: 'custom', message: 'This size is listed twice.' });
    if (skus.has(v.sku)) ctx.addIssue({ path: ['variants', i, 'sku'], code: 'custom', message: 'Duplicate size SKU.' });
    vols.add(v.volume); skus.add(v.sku);
  });
  if (d.status === 'published' && !d.images.length) ctx.addIssue({ path: ['images'], code: 'custom', message: 'Add at least one image before publishing.' });
});

export async function saveProduct(id, input, adminUserId) {
  const d = productSchema.parse(input);
  const db = await getDb();
  return db.transaction(async (tx) => {
    // the product row mirrors the cheapest active size so lists and reports have a "from" price
    const live = d.variants.filter((v) => v.active);
    const cheapest = [...(live.length ? live : d.variants)].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0];
    const values = {
      name: d.name, nameAr: d.nameAr, brand: d.brand, slug: d.slug, sku: d.sku, description: d.description, descriptionAr: d.descriptionAr,
      categoryId: d.categoryId || null, price: cheapest.price, salePrice: cheapest.salePrice ?? null, costPrice: cheapest.costPrice ?? null,
      gender: d.gender, family: d.family, concentration: d.concentration, specs: d.specs, bottleStyle: d.bottleStyle,
      modelMediaId: d.modelMediaId || null, status: d.status, featured: d.featured, newArrival: d.newArrival,
      seoTitle: d.seoTitle, seoDescription: d.seoDescription, updatedAt: new Date(),
    };
    let pid = id;
    if (pid) {
      const [ex] = await tx.select({ id: s.products.id }).from(s.products).where(eq(s.products.id, pid));
      if (!ex) throw new HttpError(404, 'Product not found.');
      await tx.update(s.products).set(values).where(eq(s.products.id, pid));
    } else {
      const [row] = await tx.insert(s.products).values(values).returning({ id: s.products.id });
      pid = row.id;
    }
    // collections
    await tx.delete(s.productCollections).where(eq(s.productCollections.productId, pid));
    for (const cid of [...new Set(d.collectionIds)]) await tx.insert(s.productCollections).values({ productId: pid, collectionId: cid });
    // images (ordered)
    await tx.delete(s.productImages).where(eq(s.productImages.productId, pid));
    for (const [i, im] of d.images.entries()) await tx.insert(s.productImages).values({ productId: pid, mediaId: im.mediaId, alt: im.alt, sortOrder: i });
    // variants: update existing, insert new, deactivate removed (kept for order history)
    const existing = await tx.select().from(s.productVariants).where(eq(s.productVariants.productId, pid)).for('update');
    const keepIds = d.variants.filter((v) => v.id).map((v) => v.id);
    const removed = existing.filter((v) => !keepIds.includes(v.id));
    if (removed.length) {
      // free up the SKU and size of removed variants, then retire them
      for (const v of removed) await tx.update(s.productVariants).set({ active: false, sku: `${v.sku}-RET${v.id}`, volume: 100000 + v.id }).where(eq(s.productVariants.id, v.id));
    }
    // move sizes out of the way first so swapping volumes between rows never collides
    for (const v of d.variants.filter((x) => x.id)) await tx.update(s.productVariants).set({ volume: 200000 + v.id }).where(eq(s.productVariants.id, v.id));
    for (const v of d.variants) {
      const cur = existing.find((e) => e.id === v.id);
      const priceCols = { price: v.price, salePrice: v.salePrice ?? null, costPrice: v.costPrice ?? null };
      if (cur) {
        // apply the editor's change as a delta so sales made meanwhile are not overwritten
        const next = Math.max(0, v.stockOriginal != null ? cur.stock + (v.stock - v.stockOriginal) : v.stock);
        await tx.update(s.productVariants).set({ sku: v.sku, volume: v.volume, ...priceCols, active: v.active, stock: next }).where(eq(s.productVariants.id, cur.id));
        if (next !== cur.stock) await tx.insert(s.stockMovements).values({ variantId: cur.id, delta: next - cur.stock, stockAfter: next, reason: 'adjustment', note: 'Set in product editor', adminUserId });
      } else {
        const [nv] = await tx.insert(s.productVariants).values({ productId: pid, sku: v.sku, volume: v.volume, ...priceCols, stock: v.stock, active: v.active }).returning();
        await tx.insert(s.stockMovements).values({ variantId: nv.id, delta: v.stock, stockAfter: v.stock, reason: 'initial', note: 'Variant created', adminUserId });
      }
    }
    return pid;
  });
}

export async function deleteProduct(id) {
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(s.orderItems).where(eq(s.orderItems.productId, id));
  if (n > 0) {
    await db.update(s.products).set({ status: 'archived', updatedAt: new Date() }).where(eq(s.products.id, id));
    return { archived: true };
  }
  await db.delete(s.products).where(eq(s.products.id, id));
  return { deleted: true };
}
