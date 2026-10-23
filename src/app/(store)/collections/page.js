import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { getCollections } from '@/lib/catalog';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Collections'), description: t('Curated perfume edits for every mood and moment.'), alternates: { canonical: '/collections' } };
}

export default async function Collections() {
  const { t } = await getT();
  const cols = await getCollections();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs"><Link href="/">{t('Home')}</Link><span>/</span><span aria-current="page">{t('Collections')}</span></nav>
          <h1 className="display-xl">{t('Collections')}</h1>
          <nav className="row" style={{ marginTop: 28 }} aria-label={t('Jump to collection')}>
            {cols.map((c) => <a key={c.slug} href={`#${c.slug}`} className="chip">{c.name} <span className="num muted">{c.products.length}</span></a>)}
          </nav>
        </div>
      </section>
      {cols.length ? cols.map((c, i) => (
        <section className={`col-section${i % 2 ? ' flip' : ''} theme-${c.theme}`} key={c.slug} id={c.slug}>
          <div className="wrap">
            <div className="col-hero">
              <div className="img" data-reveal>{c.coverUrl && <img src={c.coverUrl} alt="" loading="lazy" data-parallax="0.08" />}</div>
              <div className="txt stack" data-reveal style={{ gap: 18 }}>
                <span className="eyebrow num">{String(i + 1).padStart(2, '0')} — {c.tagline}</span>
                <h2 className="display-l">{c.name}</h2>
                <p className="lede">{c.description}</p>
                <Link className="btn" href={`/shop?collection=${c.slug}`}>{t('Shop {name}', { name: c.name })} · <span className="num">{c.products.length}</span></Link>
              </div>
            </div>
            {c.products.length ? <div className="product-grid">{c.products.slice(0, 4).map((p, k) => <ProductCard key={p.slug} product={p} index={k} />)}</div> : <p className="muted">{t('New perfumes for this collection are coming soon.')}</p>}
          </div>
        </section>
      )) : <div className="wrap empty"><p className="muted">{t('No collections are published yet.')}</p></div>}
    </>
  );
}
