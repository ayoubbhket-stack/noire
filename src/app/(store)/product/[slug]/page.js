import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import ProductView from '@/components/store/ProductView';
import { RecentlyViewed } from '@/components/store/Lists';
import { ReviewForm } from '@/components/store/Forms';
import { getApprovedReviews, getCatalog, getProductBySlug } from '@/lib/catalog';
import { getContents } from '@/lib/settings';
import { currentAdmin } from '@/lib/auth';
import { getT } from '@/lib/lang';
import { formatPrice } from '@/lib/i18n';

async function load(slug, preview) {
  const admin = preview ? await currentAdmin() : null;
  return getProductBySlug(slug, { includeDrafts: !!admin });
}

export async function generateMetadata({ params, searchParams }) {
  const p = await load(params.slug, searchParams.preview);
  if (!p) return { title: 'Not found' };
  const img = p.images[0]?.url;
  const title = p.seoTitle || `${p.brand} ${p.name}`;
  return {
    title,
    description: p.seoDescription || p.description.slice(0, 155),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description: p.description, images: img ? [{ url: img }] : undefined, type: 'website' },
    robots: p.status !== 'published' ? { index: false } : undefined,
  };
}

export default async function ProductPage({ params, searchParams }) {
  const { lang, t } = await getT();
  const p = await load(params.slug, searchParams.preview);
  if (!p) notFound();
  const [{ store, shipping, policies }, reviews, catalog] = await Promise.all([
    getContents(['store', 'shipping', 'policies'], lang), getApprovedReviews({ productId: p.id, limit: 20 }), getCatalog(),
  ]);
  const related = catalog.filter((x) => x.slug !== p.slug)
    .map((x) => [(x.family === p.family) * 3 + x.collections.filter((c) => p.collections.includes(c)).length + (x.gender === p.gender || x.gender === 'unisex'), x])
    .sort((a, b) => b[0] - a[0]).slice(0, 4).map(([, x]) => x);
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : null;
  const money = (v) => formatPrice(v, store.currency, lang);
  const fees = shipping.regions.map((r) => r.fee);
  const shippingNote = shipping.freeShippingOver
    ? t('Delivery from {fee}, free over {free}.', { fee: money(Math.min(...fees)), free: money(shipping.freeShippingOver) })
    : t('Delivery from {fee}.', { fee: money(Math.min(...fees)) });
  const prices = p.variants.map((v) => v.finalPrice);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: `${p.brand} ${p.nameEn}`, sku: p.sku, description: p.description,
    image: p.images.map((i) => i.url), brand: { '@type': 'Brand', name: p.brand },
    offers: { '@type': 'AggregateOffer', priceCurrency: store.currency, lowPrice: (Math.min(...prices) / 100).toFixed(2), highPrice: (Math.max(...prices) / 100).toFixed(2), offerCount: p.variants.length, availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    ...(avg ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length } } : {}),
  };

  return (
    <>
      {p.status !== 'published' && <div className="preview-bar">Preview — this product is {p.status} and not visible to customers.</div>}
      <div className="wrap">
        <nav className="crumbs" aria-label={t('Breadcrumb')} style={{ paddingTop: 24 }}>
          <Link href="/">{t('Home')}</Link><span>/</span><Link href="/shop">{t('Shop')}</Link><span>/</span>
          <Link href={`/shop?brand=${encodeURIComponent(p.brand)}`}>{p.brand}</Link><span>/</span><span aria-current="page">{p.name}</span>
        </nav>
        <ProductView product={p} threshold={store.lowStockThreshold} reviewSummary={avg ? { avg, count: reviews.length } : null}
          shippingNote={shippingNote} shippingPolicy={policies.shipping} returnsPolicy={policies.returns} />
      </div>

      <section className="section tight bordered" id="reviews">
        <div className="wrap">
          <div className="spread center-y" style={{ marginBottom: 24 }}>
            <h2 className="display-m">{t('Reviews')}</h2>
            {avg && <p style={{ margin: 0 }}><span className="stars">★</span> <span className="num">{avg.toFixed(1)} / 5</span> · {t('{n} reviews', { n: reviews.length })}</p>}
          </div>
          {reviews.length ? (
            <div className="reviews">{reviews.map((r) => (
              <figure className="review" key={r.id}>
                <span className="stars" aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}<span className="off">{'★'.repeat(5 - r.rating)}</span></span>
                {r.title && <strong>{r.title}</strong>}
                <blockquote>{r.body}</blockquote>
                <figcaption className="small muted">{r.name}{r.city ? ` · ${r.city}` : ''} · {new Date(r.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { month: 'short', year: 'numeric' })}</figcaption>
              </figure>
            ))}</div>
          ) : <p className="muted">{t('No reviews yet. Be the first to review {name}.', { name: p.name })}</p>}
          <details className="accordion" style={{ marginTop: 32 }}><summary>{t('Write a review')}</summary><div className="body"><ReviewForm productId={p.id} /></div></details>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section tight">
          <div className="wrap">
            <div className="spread center-y" style={{ marginBottom: 28 }}><h2 className="display-m">{t('You may also like')}</h2><Link href="/shop" className="link">{t('Shop all')}</Link></div>
            <div className="product-grid">{related.map((r, i) => <ProductCard key={r.slug} product={r} index={i} />)}</div>
          </div>
        </section>
      )}
      <RecentlyViewed exclude={p.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
