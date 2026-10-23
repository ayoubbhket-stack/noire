import Link from 'next/link';
import './store.css';
import { StoreProvider } from '@/components/store/StoreProvider';
import Header from '@/components/store/Header';
import { CartDrawer, QuickView, Toasts } from '@/components/store/Overlays';
import { Cursor, Loader, MotionLayer, RouteProgress } from '@/components/store/Effects';
import { NewsletterForm } from '@/components/store/Forms';
import { LogoMark } from '@/components/store/Icons';
import { getContents } from '@/lib/settings';
import { getCollections, mediaUrl } from '@/lib/catalog';
import { getT } from '@/lib/lang';

export default async function StoreLayout({ children }) {
  const { lang, t } = await getT();
  const { store, home, footer } = await getContents(['store', 'home', 'footer'], lang);
  const collections = await getCollections();
  const a = home.announcement;
  return (
    <StoreProvider currency={store.currency} lang={lang}>
      <a href="#main" className="skip">{t('Skip to content')}</a>
      <Loader />
      <RouteProgress />
      {a?.enabled && a.text && (
        <div className="announce"><Link href={a.href || '/shop'}><span className="track"><span>{a.text}</span><span aria-hidden="true">{a.text}</span><span aria-hidden="true">{a.text}</span></span></Link></div>
      )}
      <Header storeName={store.name} logoUrl={mediaUrl(store.logoMediaId)} social={store.social} />
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="stack" style={{ gap: 14 }}>
              <Link href="/" className="logo"><LogoMark /><span>{store.name}</span></Link>
              <p className="muted" style={{ maxWidth: '36ch' }}>{footer.about}</p>
              <div className="socials">{Object.entries(store.social || {}).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k}</a>)}</div>
            </div>
            <div><h3>{t('Shop')}</h3><ul>
              <li><Link href="/shop">{t('All perfumes')}</Link></li>
              <li><Link href="/shop?gender=women">{t('Women')}</Link></li>
              <li><Link href="/shop?gender=men">{t('Men')}</Link></li>
              <li><Link href="/shop?gender=unisex">{t('Unisex')}</Link></li>
              <li><Link href="/shop?sort=newest">{t('New arrivals')}</Link></li>
              <li><Link href="/finder">{t('Find your scent')}</Link></li>
            </ul></div>
            <div><h3>{t('Collections')}</h3><ul>
              {collections.map((c) => <li key={c.slug}><Link href={`/shop?collection=${c.slug}`}>{c.name}</Link></li>)}
            </ul></div>
            <div><h3>{t('Help')}</h3><ul>
              <li><Link href="/contact">{t('Contact')}</Link></li>
              <li><Link href="/policies/shipping">{t('Shipping')}</Link></li>
              <li><Link href="/policies/returns">{t('Returns')}</Link></li>
              <li><Link href="/policies/privacy">{t('Privacy policy')}</Link></li>
              <li><Link href="/policies/terms">{t('Terms & conditions')}</Link></li>
              <li><Link href="/about">{t('About')}</Link></li>
            </ul></div>
            <div className="stack" style={{ gap: 10 }}>
              <h3 style={{ marginBottom: 0 }}>{footer.newsletterTitle}</h3>
              <p className="muted" style={{ margin: 0 }}>{footer.newsletterText}</p>
              <NewsletterForm id="footer-news" />
              <p className="muted small" style={{ marginTop: 8 }}><span dir="ltr">{store.email}</span><br /><span dir="ltr">{store.phone}</span></p>
            </div>
          </div>
          <div className="footer-word" aria-hidden="true">{store.name}</div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {footer.copyright}</span>
            <span>{t('100% authentic · Cash on delivery across Egypt')}</span>
          </div>
        </div>
      </footer>
      <CartDrawer />
      <QuickView threshold={store.lowStockThreshold} />
      <Toasts />
      <MotionLayer />
      <Cursor />
    </StoreProvider>
  );
}
