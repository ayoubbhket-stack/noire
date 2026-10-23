import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { HomeHero, Rail } from '@/components/store/HomeClient';
import { NewsletterForm } from '@/components/store/Forms';
import { ArrowIcon, CashIcon, FamilyGlyph, GiftIcon, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/store/Icons';
import { PriceTag } from '@/components/store/Overlays';
import { getApprovedReviews, getBestSellers, getCatalog, getCollections, mediaUrl } from '@/lib/catalog';
import { getContents } from '@/lib/settings';
import { getT } from '@/lib/lang';
import { label } from '@/lib/i18n';

export async function generateMetadata() {
  const { lang } = await getT();
  const { store } = await getContents(['store'], lang);
  return { title: { absolute: store.seoTitle }, description: store.seoDescription, alternates: { canonical: '/' } };
}

export default async function Home() {
  const { lang, t } = await getT();
  const { home, store, shipping } = await getContents(['home', 'store', 'shipping'], lang);
  const [catalog, collections, reviews] = await Promise.all([getCatalog(), getCollections(), getApprovedReviews({ limit: 6 })]);
  const best = await getBestSellers(8, home.bestsellerSlugs);
  const featured = (home.featuredProductSlugs?.length
    ? home.featuredProductSlugs.map((s) => catalog.find((p) => p.slug === s)).filter(Boolean)
    : catalog.filter((p) => p.featured)).slice(0, 4);
  const arrivals = catalog.filter((p) => p.newArrival).slice(0, 4);
  const brands = [...new Set(catalog.map((p) => p.brand).filter(Boolean))];
  const families = [...new Set(catalog.map((p) => p.family).filter(Boolean))];
  const homeCollections = collections.filter((c) => c.featuredHome !== false).slice(0, 5);
  const stats = [[t('Perfumes'), catalog.length], [t('Houses'), brands.length], [t('Original'), '100%']];

  const sections = {
    brands: (s) => brands.length > 0 && (
      <section className="brand-strip" key="brands" aria-label={s.title}>
        <div className="track" aria-hidden="true">{[...brands, ...brands, ...brands].map((b, i) => <span key={i}>{b}</span>)}</div>
        <p className="sr-only">{brands.join(', ')}</p>
      </section>
    ),
    featured: (s) => featured.length > 0 && (
      <section className="section" key="featured" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div><p className="eyebrow">{t('Selected')}</p><h2 className="display-l">{s.title}</h2></div>
            <div className="stack end"><p className="lede">{s.text}</p><Link className="link" href="/shop">{t('All perfumes')}</Link></div>
          </div>
          <div className="product-grid">{featured.map((p, i) => <ProductCard key={p.slug} product={p} index={i} priority={i < 2} />)}</div>
        </div>
      </section>
    ),
    families: (s) => families.length > 0 && (
      <section className="section soft" key="families" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal><h2 className="display-l">{s.title}</h2><p className="lede">{s.text}</p></div>
          <div className="family-grid">
            {families.map((f, i) => (
              <Link key={f} href={`/shop?family=${f}`} className={`family-tile fam-${f}`} data-reveal style={{ '--d': `${i * 50}ms` }}>
                <FamilyGlyph family={f} />
                <span className="name">{label('family', f, lang)}</span>
                <span className="small muted num">{t('{n} perfumes', { n: catalog.filter((p) => p.family === f).length })}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    collections: (s) => homeCollections.length > 0 && (
      <section className="section" key="collections" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal><h2 className="display-l">{s.title}</h2><p className="lede">{s.text}</p></div>
          <div className="col-mosaic">
            {homeCollections.map((c, i) => (
              <Link key={c.slug} href={`/shop?collection=${c.slug}`} className="col-tile" data-reveal style={{ '--d': `${i * 80}ms` }}>
                {c.coverUrl && <img src={c.coverUrl} alt="" loading="lazy" />}
                <div className="in"><span className="small">{c.tagline}</span><h3>{c.name}</h3><span className="small num">{t('{n} perfumes', { n: c.products.length })}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    finder: (s) => (
      <section className="section tight" key="finder" aria-label={s.title}>
        <div className="wrap"><div className="finder-cta" data-reveal>
          <div className="glyphs" aria-hidden="true">{['floral', 'fresh', 'woody', 'oriental', 'gourmand'].map((f) => <FamilyGlyph key={f} family={f} />)}</div>
          <div><h2 className="display-m">{s.title}</h2><p className="lede">{s.text}</p></div>
          <Link className="btn" href={s.href || '/finder'}>{s.label || t('Start the quiz')} <ArrowIcon /></Link>
        </div></div>
      </section>
    ),
    campaign: (s) => {
      const imgs = (home.campaignImages || []).map(mediaUrl);
      return imgs.length > 0 && (
        <section className="section" key="campaign" aria-label={s.title}>
          <div className="wrap campaign">
            <figure className="tall"><img src={imgs[0]} alt="" loading="lazy" data-parallax="0.08" /></figure>
            <div className="copy" data-reveal>
              <p className="eyebrow">{t('The NOIRÉ promise')}</p>
              <h2 className="display-l">{s.title}</h2>
              <p className="lede">{s.text}</p>
              <Link className="btn ghost" href="/about">{t('Our story')}</Link>
            </div>
            {imgs[1] && <figure className="wide"><img src={imgs[1]} alt="" loading="lazy" data-parallax="0.12" /></figure>}
          </div>
        </section>
      );
    },
    bestsellers: (s) => best.length > 0 && (
      <section className="section" key="bestsellers" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal><div><p className="eyebrow">{s.text}</p><h2 className="display-l">{s.title}</h2></div></div>
          <Rail label={s.title}>
            {best.map((p, i) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="rail-item" draggable={false}>
                <div className="rail-media"><img src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} loading="lazy" draggable={false} /><span className="rank num">{String(i + 1).padStart(2, '0')}</span></div>
                <span className="card-brand">{p.brand}</span>
                <h3>{p.name}</h3>
                <PriceTag product={p} />
              </Link>
            ))}
          </Rail>
        </div>
      </section>
    ),
    newarrivals: (s) => arrivals.length > 0 && (
      <section className="section" key="newarrivals" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal><div><p className="eyebrow">{s.text}</p><h2 className="display-l">{s.title}</h2></div><Link className="btn ghost end" href="/shop?sort=newest">{t('All new arrivals')}</Link></div>
          <div className="product-grid">{arrivals.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}</div>
        </div>
      </section>
    ),
    trust: (s) => (
      <section className="section tight" key="trust" aria-label={s.title || t('Why shop with us')}>
        <div className="wrap trust">
          {[
            [ShieldIcon, t('100% original'), t('Sealed bottles from official distributors.')],
            [CashIcon, t('Cash on delivery'), t('Pay when your order arrives.')],
            [TruckIcon, t('Fast delivery'), shipping.freeShippingOver ? t('Free shipping over {amount}.', { amount: `${(shipping.freeShippingOver / 100).toLocaleString('en-US')} ${lang === 'ar' ? 'ج.م' : store.currency}` }) : t('Across all of Egypt.')],
            [ReturnIcon, t('Easy returns'), t('14 days on sealed bottles.')],
            [GiftIcon, t('Gift wrapping'), t('Free, with your message.')],
          ].map(([Icon, h, p], i) => (
            <div key={h} className="trust-item" data-reveal style={{ '--d': `${i * 60}ms` }}><Icon /><div><strong>{h}</strong><p className="small muted">{p}</p></div></div>
          ))}
        </div>
      </section>
    ),
    reviews: (s) => reviews.length > 0 && (
      <section className="section soft" key="reviews" aria-label={s.title}>
        <div className="wrap">
          <div className="section-head" data-reveal><h2 className="display-l">{s.title}</h2><p className="lede">{s.text}</p></div>
          <div className="reviews">
            {reviews.map((r) => (
              <figure className="review" key={r.id} data-reveal>
                <span className="stars" aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}<span className="off">{'★'.repeat(5 - r.rating)}</span></span>
                {r.title && <strong>{r.title}</strong>}
                <blockquote>“{r.body}”</blockquote>
                <figcaption className="small muted">{r.name}{r.city ? ` · ${r.city}` : ''} — <Link className="link" href={`/product/${r.productSlug}`}>{r.productName}</Link></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    ),
    newsletter: (s) => (
      <section className="section tight" key="newsletter" aria-label={s.title}>
        <div className="wrap"><div className="newsletter" data-reveal>
          <div><p className="eyebrow">{t('Newsletter')}</p><h2 className="display-m">{s.title}</h2></div>
          <div><p>{s.text}</p><NewsletterForm id="home-news" dark /></div>
        </div></div>
      </section>
    ),
  };

  return (
    <>
      <HomeHero hero={home.hero} poster={mediaUrl(home.hero.imageMediaId)} stats={stats} />
      {home.sections.filter((s) => s.enabled && sections[s.key]).map((s) => sections[s.key](s))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Store', name: store.name, email: store.email, telephone: store.phone, sameAs: Object.values(store.social || {}).filter(Boolean) }) }} />
    </>
  );
}
