// Storefront catalogue queries. Everything here reads published data only.
import 'server-only';
import { cache } from 'react';
import { and, asc, desc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { effectivePrice } from './money';
import { getLang } from './lang';

export const mediaUrl = (id) => (id ? `/api/media/${id}` : null);

const pick = (en, ar, lang) => (lang === 'ar' && ar ? ar : en);
const list = (v) => String(v || '').split(/[,،]/).map((x) => x.trim()).filter(Boolean);

function shapeProduct(p, { variants, images, cols, category, ratings, lang }) {
  const vs = variants.filter((v) => v.productId === p.id && v.active).sort((a, b) => a.volume - b.volume);
  const ims = images.filter((i) => i.productId === p.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const totalStock = vs.reduce((n, v) => n + v.stock, 0);
  const r = ratings?.get(p.id);
  const sp = p.specs || {};
  const name = pick(p.name, p.nameAr, lang);
  // "from" price: cheapest in-stock size, else cheapest size
  const priced = vs.map((v) => ({ ...v, finalPrice: effectivePrice(v) }));
  const cheapest = [...priced].sort((a, b) => a.finalPrice - b.finalPrice);
  const from = cheapest.find((v) => v.stock > 0) || cheapest[0];
  return {
    id: p.id, name, nameEn: p.name, nameAr: p.nameAr, slug: p.slug, sku: p.sku, brand: p.brand,
    description: pick(p.description, p.descriptionAr, lang),
    price: from ? from.price : p.price, salePrice: from ? from.salePrice : p.salePrice, finalPrice: from ? from.finalPrice : effectivePrice(p),
    priceRange: priced.length > 1 && cheapest[0].finalPrice !== cheapest[cheapest.length - 1].finalPrice,
    category: category?.slug || null, categoryName: category ? pick(category.name, category.nameAr, lang) : '',
    collections: cols.filter((c) => c.productId === p.id).map((c) => c.slug),
    gender: p.gender, family: p.family, concentration: p.concentration,
    notes: {
      top: list(pick(sp.top, sp.topAr, lang)), heart: list(pick(sp.heart, sp.heartAr, lang)), base: list(pick(sp.base, sp.baseAr, lang)),
      // English names kept for search in both languages
      all: [...list(sp.top), ...list(sp.heart), ...list(sp.base), ...list(sp.topAr), ...list(sp.heartAr), ...list(sp.baseAr)],
    },
    longevity: Number(sp.longevity) || 0, sillage: Number(sp.sillage) || 0, seasons: sp.seasons || [],
    bottle: p.bottleStyle || {},
    featured: p.featured, newArrival: p.newArrival, status: p.status,
    createdAt: new Date(p.createdAt).toISOString(), updatedAt: new Date(p.updatedAt).toISOString(),
    modelUrl: mediaUrl(p.modelMediaId),
    seoTitle: p.seoTitle, seoDescription: p.seoDescription,
    images: ims.map((i) => ({ id: i.id, url: mediaUrl(i.mediaId), alt: i.alt || name })),
    variants: priced.map((v) => ({ id: v.id, sku: v.sku, volume: v.volume, price: v.price, salePrice: v.salePrice, finalPrice: v.finalPrice, stock: v.stock })),
    totalStock, inStock: totalStock > 0,
    rating: r ? { avg: r.avg, count: r.count } : null,
  };
}

/** Load products (default: published) with all relations, shaped for the UI. */
export async function loadProducts({ ids, statuses = ['published'], lang = 'en' } = {}) {
  const db = await getDb();
  const where = [inArray(s.products.status, statuses)];
  if (ids) where.push(ids.length ? inArray(s.products.id, ids) : sql`false`);
  const prods = await db.select().from(s.products).where(and(...where)).orderBy(desc(s.products.createdAt));
  if (!prods.length) return [];
  const pids = prods.map((p) => p.id);
  const [variants, images, cols, cats, ratingRows] = await Promise.all([
    db.select().from(s.productVariants).where(inArray(s.productVariants.productId, pids)).orderBy(asc(s.productVariants.id)),
    db.select().from(s.productImages).where(inArray(s.productImages.productId, pids)),
    db.select({ productId: s.productCollections.productId, slug: s.collections.slug })
      .from(s.productCollections).innerJoin(s.collections, eq(s.productCollections.collectionId, s.collections.id))
      .where(and(inArray(s.productCollections.productId, pids), eq(s.collections.published, true))),
    db.select().from(s.categories),
    db.select({ productId: s.reviews.productId, avg: sql`round(avg(${s.reviews.rating})::numeric, 1)`.mapWith(Number), count: sql`count(*)`.mapWith(Number) })
      .from(s.reviews).where(and(inArray(s.reviews.productId, pids), eq(s.reviews.status, 'approved'))).groupBy(s.reviews.productId),
  ]);
  const ratings = new Map(ratingRows.map((r) => [r.productId, r]));
  const catMap = new Map(cats.map((c) => [c.id, c]));
  return prods
    // storefront: hide products whose category is hidden
    .filter((p) => statuses.join() !== 'published' || !p.categoryId || catMap.get(p.categoryId)?.published !== false)
    .map((p) => shapeProduct(p, { variants, images, cols, category: catMap.get(p.categoryId), ratings, lang }));
}

export const getCatalog = cache(async () => loadProducts({ lang: await getLang() }));

export async function getProductBySlug(slug, { includeDrafts = false } = {}) {
  const db = await getDb();
  const [p] = await db.select({ id: s.products.id, status: s.products.status }).from(s.products).where(eq(s.products.slug, slug));
  if (!p) return null;
  if (!includeDrafts && p.status !== 'published') return null;
  const [shaped] = await loadProducts({ ids: [p.id], statuses: ['published', 'draft', 'archived'], lang: await getLang() });
  return shaped || null;
}

export const getCategories = cache(async () => {
  const db = await getDb();
  const lang = await getLang();
  const rows = await db.select().from(s.categories).where(eq(s.categories.published, true)).orderBy(asc(s.categories.sortOrder));
  return rows.map((c) => ({ ...c, name: pick(c.name, c.nameAr, lang), description: pick(c.description, c.descriptionAr, lang) }));
});

export const getCollections = cache(async () => {
  const db = await getDb();
  const rows = await db.select().from(s.collections).where(eq(s.collections.published, true)).orderBy(asc(s.collections.sortOrder));
  const catalog = await getCatalog();
  const lang = await getLang();
  return rows.map((c) => ({
    ...c, name: pick(c.name, c.nameAr, lang), tagline: pick(c.tagline, c.taglineAr, lang), description: pick(c.description, c.descriptionAr, lang),
    coverUrl: mediaUrl(c.coverMediaId),
    products: catalog.filter((p) => p.collections.includes(c.slug)),
  }));
});

/** Best sellers by units in non-cancelled orders; falls back to featured. */
export async function getBestSellers(limit = 8, manualSlugs = []) {
  const catalog = await getCatalog();
  if (manualSlugs?.length) return manualSlugs.map((sl) => catalog.find((p) => p.slug === sl)).filter(Boolean).slice(0, limit);
  const db = await getDb();
  const rows = await db.select({ productId: s.orderItems.productId, units: sql`sum(${s.orderItems.qty})`.mapWith(Number) })
    .from(s.orderItems).innerJoin(s.orders, eq(s.orderItems.orderId, s.orders.id))
    .where(notInArray(s.orders.status, ['cancelled', 'refunded']))
    .groupBy(s.orderItems.productId).orderBy(desc(sql`sum(${s.orderItems.qty})`)).limit(limit);
  const ranked = rows.map((r) => catalog.find((p) => p.id === r.productId)).filter(Boolean);
  const fill = catalog.filter((p) => p.featured && !ranked.includes(p));
  return [...ranked, ...fill].slice(0, limit);
}

export async function getApprovedReviews({ productId, limit = 12 } = {}) {
  const db = await getDb();
  const where = [eq(s.reviews.status, 'approved')];
  if (productId) where.push(eq(s.reviews.productId, productId));
  const lang = await getLang();
  return db.select({ r: s.reviews, productName: s.products.name, productNameAr: s.products.nameAr, productSlug: s.products.slug })
    .from(s.reviews).innerJoin(s.products, eq(s.reviews.productId, s.products.id))
    .where(and(...where)).orderBy(desc(s.reviews.createdAt)).limit(limit)
    .then((rows) => rows.map(({ r, productName, productNameAr, productSlug }) => ({ ...r, productName: pick(productName, productNameAr, lang), productSlug })));
}

/** Filtering/sorting used by the shop page. Pure function over the catalog. */
export function filterProducts(list, q) {
  let out = list;
  const term = (q.q || '').trim().toLowerCase();
  if (term) {
    const words = term.split(/\s+/);
    out = out.filter((p) => {
      const hay = [p.name, p.nameEn, p.nameAr, p.brand, p.sku, p.description, p.family, p.gender, p.categoryName, ...p.notes.all, ...p.collections].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }
  const multi = (v) => (v ? String(v).split(',').filter(Boolean) : []);
  const cats = multi(q.category); if (cats.length) out = out.filter((p) => cats.includes(p.category));
  const cols = multi(q.collection); if (cols.length) out = out.filter((p) => p.collections.some((c) => cols.includes(c)));
  const brands = multi(q.brand); if (brands.length) out = out.filter((p) => brands.includes(p.brand));
  const genders = multi(q.gender); if (genders.length) out = out.filter((p) => genders.includes(p.gender));
  const fams = multi(q.family); if (fams.length) out = out.filter((p) => fams.includes(p.family));
  const concs = multi(q.conc); if (concs.length) out = out.filter((p) => concs.includes(p.concentration));
  const seasons = multi(q.season); if (seasons.length) out = out.filter((p) => p.seasons.some((x) => seasons.includes(x)));
  if (q.min) out = out.filter((p) => p.finalPrice >= Number(q.min) * 100);
  if (q.max) out = out.filter((p) => p.finalPrice <= Number(q.max) * 100);
  if (q.stock === 'in') out = out.filter((p) => p.inStock);
  if (q.stock === 'out') out = out.filter((p) => !p.inStock);
  if (q.sale === '1') out = out.filter((p) => p.variants.some((v) => v.salePrice != null));
  const sorters = {
    featured: (a, b) => (b.featured - a.featured) || (b.inStock - a.inStock) || (new Date(b.createdAt) - new Date(a.createdAt)),
    newest: (a, b) => (b.newArrival - a.newArrival) || (new Date(b.createdAt) - new Date(a.createdAt)),
    'price-asc': (a, b) => a.finalPrice - b.finalPrice,
    'price-desc': (a, b) => b.finalPrice - a.finalPrice,
    lasting: (a, b) => b.longevity - a.longevity,
  };
  return [...out].sort(sorters[q.sort] || sorters.featured);
}

export function facetOptions(list) {
  const prices = list.map((p) => p.finalPrice);
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return {
    brands: uniq(list.map((p) => p.brand)),
    genders: ['women', 'men', 'unisex'].filter((g) => list.some((p) => p.gender === g)),
    families: uniq(list.map((p) => p.family)),
    concentrations: ['parfum', 'edp', 'edt', 'edc', 'oil'].filter((c) => list.some((p) => p.concentration === c)),
    priceMin: prices.length ? Math.floor(Math.min(...prices) / 100) : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices) / 100) : 0,
  };
}
