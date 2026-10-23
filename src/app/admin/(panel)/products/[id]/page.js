import { notFound } from 'next/navigation';
import { asc, eq, sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { can, requireAdminPage } from '@/lib/auth';
import ProductEditor from '@/components/admin/ProductEditor';

export const metadata = { title: 'Edit product' };

export default async function EditProduct({ params }) {
  const me = await requireAdminPage('products.read');
  const db = await getDb();
  const id = Number(params.id);
  const [p] = await db.select().from(s.products).where(eq(s.products.id, id));
  if (!p) notFound();
  const [cats, cols, pc, imgs, vars, [{ sold }]] = await Promise.all([
    db.select().from(s.categories).orderBy(s.categories.sortOrder),
    db.select().from(s.collections).orderBy(s.collections.sortOrder),
    db.select().from(s.productCollections).where(eq(s.productCollections.productId, id)),
    db.select().from(s.productImages).where(eq(s.productImages.productId, id)).orderBy(asc(s.productImages.sortOrder)),
    db.select().from(s.productVariants).where(eq(s.productVariants.productId, id)).orderBy(asc(s.productVariants.id)),
    db.select({ sold: sql`coalesce(sum(qty),0)::int` }).from(s.orderItems).where(eq(s.orderItems.productId, id)),
  ]);
  const initial = {
    id: p.id, name: p.name, nameAr: p.nameAr, brand: p.brand, slug: p.slug, sku: p.sku, description: p.description, descriptionAr: p.descriptionAr,
    categoryId: p.categoryId, collectionIds: pc.map((x) => x.collectionId),
    gender: p.gender, family: p.family, concentration: p.concentration,
    specs: { top: '', heart: '', base: '', topAr: '', heartAr: '', baseAr: '', longevity: 3, sillage: 3, seasons: [], ...(p.specs || {}) },
    bottleStyle: { shape: 'classic', cap: 'cube', liquidHex: '#e2a35c', capHex: '#c9a45c', capMetal: true, ...(p.bottleStyle || {}) },
    modelMediaId: p.modelMediaId, status: p.status, featured: p.featured, newArrival: p.newArrival, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
    images: imgs.map((i) => ({ mediaId: i.mediaId, alt: i.alt })),
    variants: vars.filter((v) => !/-RET\d+$/.test(v.sku)).sort((a, b) => a.volume - b.volume).map((v) => ({
      id: v.id, sku: v.sku, volume: v.volume, price: v.price / 100, salePrice: v.salePrice != null ? v.salePrice / 100 : '', costPrice: v.costPrice != null ? v.costPrice / 100 : '',
      stock: v.stock, stockOriginal: v.stock, active: v.active,
    })),
  };
  return <ProductEditor initial={initial} categories={cats} collections={cols} readOnly={!can(me, 'products.write')} sold={sold} />;
}
