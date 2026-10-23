import Link from 'next/link';
import './(store)/store.css';
import { getT } from '@/lib/lang';

export const metadata = { title: 'Page not found' };

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main className="nf">
      <div className="stack" style={{ alignItems: 'center', gap: 20 }}>
        <div className="code" aria-hidden="true">404</div>
        <h1 className="display-m">{t('This scent has faded.')}</h1>
        <p className="muted">{t('This page does not exist or has moved.')}</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link className="btn" href="/">{t('Back home')}</Link><Link className="btn ghost" href="/shop">{t('Shop perfumes')}</Link></div>
      </div>
    </main>
  );
}
