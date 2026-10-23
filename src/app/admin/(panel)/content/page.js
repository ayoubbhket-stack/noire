import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { requireAdminPage } from '@/lib/auth';
import { getSetting, getSettings } from '@/lib/settings';
import ContentEditor, { TranslationEditor } from '@/components/admin/ContentEditor';

export const metadata = { title: 'Website content' };
const TABS = [['home', 'Homepage'], ['about', 'About page'], ['contact', 'Contact & FAQ'], ['policies', 'Policies'], ['footer', 'Footer & newsletter']];
const AR_TABS = [...TABS, ['store', 'Store details']];

export default async function Content({ searchParams }) {
  await requireAdminPage('content.write');
  const ar = searchParams.lang === 'ar';
  const tabs = ar ? AR_TABS : TABS;
  const tab = tabs.some(([k]) => k === searchParams.tab) ? searchParams.tab : 'home';
  const db = await getDb();
  const products = await db.select({ slug: s.products.slug, name: s.products.name }).from(s.products).where(eq(s.products.status, 'published')).orderBy(asc(s.products.name));
  const q = (k, l) => `/admin/content?tab=${k}${l ? '&lang=ar' : ''}`;
  let editor;
  if (ar) {
    const [english, arabic] = await Promise.all([getSetting(tab), getSetting(`${tab}_ar`)]);
    editor = <TranslationEditor key={`${tab}-ar`} tab={tab} english={english} initial={arabic} />;
  } else {
    const data = await getSettings([tab]);
    editor = <ContentEditor key={tab} tab={tab} initial={data[tab]} products={products} />;
  }
  return (
    <>
      <div className="adm-head"><div><h1>Website content</h1><p className="sub">The storefront is in Arabic and English. Edit the English content, then add the Arabic text in the Arabic tab.</p></div>
        <div className="row" style={{ gap: 8 }}>
          <div className="seg"><Link href={q(tab === 'store' ? 'home' : tab, false)} aria-current={!ar ? 'page' : undefined} className={`btn small${ar ? ' ghost' : ''}`}>English</Link><Link href={q(tab, true)} aria-current={ar ? 'page' : undefined} className={`btn small${ar ? '' : ' ghost'}`}>العربية</Link></div>
          <a className="btn ghost small" href={tab === 'home' || tab === 'store' ? '/' : tab === 'policies' ? '/policies/shipping' : `/${tab === 'footer' ? '' : tab}`} target="_blank" rel="noreferrer">View page ↗</a>
        </div>
      </div>
      <nav className="tabs">{tabs.map(([k, l]) => <Link key={k} href={q(k, ar)} aria-current={tab === k ? 'page' : undefined}>{l}</Link>)}</nav>
      {editor}
    </>
  );
}
