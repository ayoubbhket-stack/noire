import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import ShopControls from '@/components/store/ShopControls';
import { facetOptions, filterProducts, getCatalog, getCategories, getCollections } from '@/lib/catalog';
import { getT } from '@/lib/lang';
import { label } from '@/lib/i18n';

const PAGE = 12;

function headingFor(sp, cats, cols, t, lang) {
  const col = cols.find((x) => x.slug === sp.collection);
  const cat = cats.find((x) => x.slug === sp.category);
  if (col) return [col.name, col.description];
  if (cat) return [cat.name, cat.description];
  if (sp.gender && !sp.gender.includes(',')) return [t('Perfumes for {who}', { who: label('gender', sp.gender, lang) }), null];
  if (sp.family && !sp.family.includes(',')) return [label('family', sp.family, lang), null];
  if (sp.brand && !sp.brand.includes(',')) return [sp.brand, null];
  if (sp.q) return [`“${sp.q}”`, null];
  return [t('All perfumes'), null];
}

export async function generateMetadata({ searchParams }) {
  const { lang, t } = await getT();
  const [cats, cols] = await Promise.all([getCategories(), getCollections()]);
  const [title, desc] = headingFor(searchParams, cats, cols, t, lang);
  return {
    title,
    description: desc || t('Original designer and niche perfumes. Filter by brand, scent family, concentration and price. Cash on delivery across Egypt.'),
    alternates: { canonical: searchParams.collection ? `/shop?collection=${searchParams.collection}` : '/shop' },
    robots: searchParams.q ? { index: false } : undefined,
  };
}

export default async function Shop({ searchParams }) {
  const { lang, t } = await getT();
  const [catalog, categories, collections] = await Promise.all([getCatalog(), getCategories(), getCollections()]);
  const results = filterProducts(catalog, searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const shown = results.slice(0, page * PAGE);
  const facets = facetOptions(catalog);
  const view = searchParams.view === 'list' ? 'list' : 'grid';
  const [heading, desc] = headingFor(searchParams, categories, collections, t, lang);

  const countFor = (key, value) => filterProducts(catalog, { ...searchParams, [key]: value }).length;
  const counts = {
    category: Object.fromEntries(categories.map((c) => [c.slug, countFor('category', c.slug)])),
    brand: Object.fromEntries(facets.brands.map((b) => [b, countFor('brand', b)])),
    gender: Object.fromEntries(facets.genders.map((g) => [g, countFor('gender', g)])),
    family: Object.fromEntries(facets.families.map((f) => [f, countFor('family', f)])),
  };

  const nextParams = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v));
  nextParams.set('page', String(page + 1));

  return (
    <>
      <section className="page-head">
        <div className="wrap spread end-y">
          <div>
            <nav className="crumbs" aria-label={t('Breadcrumb')}><Link href="/">{t('Home')}</Link><span>/</span><Link href="/shop">{t('Shop')}</Link></nav>
            <h1 className="display-l">{heading}</h1>
          </div>
          <p className="lede">{desc || t('Every bottle is original and sealed. Filter by brand, family, strength and price.')}</p>
        </div>
      </section>
      <div className="wrap">
        <ShopControls
          params={searchParams}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          collections={collections.map((c) => ({ slug: c.slug, name: c.name }))}
          facets={facets} counts={counts} total={results.length} view={view}
        >
          {shown.length > 0 ? (
            <>
              <div className={`product-grid${view === 'list' ? ' list' : ''}`}>
                {shown.map((p, i) => <ProductCard key={p.slug} product={p} index={i} priority={i < 4} />)}
              </div>
              <div className="stack center" style={{ marginTop: 48, gap: 12 }}>
                <p className="small muted num">{t('Showing {a} of {b}', { a: shown.length, b: results.length })}</p>
                {shown.length < results.length && <Link className="btn ghost" href={`/shop?${nextParams}`} scroll={false}>{t('Load more')}</Link>}
              </div>
            </>
          ) : (
            <div className="empty">
              <h2 className="display-s">{t('No perfumes match these filters')}</h2>
              <p className="muted">{t('Try removing a filter or searching for a note like “vanilla”.')}</p>
              <Link className="btn" href="/shop">{t('Clear all filters')}</Link>
            </div>
          )}
        </ShopControls>
      </div>
    </>
  );
}
