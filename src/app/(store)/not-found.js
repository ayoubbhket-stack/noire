import Link from 'next/link';
import { getT } from '@/lib/lang';

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="nf">
      <div className="stack" style={{ alignItems: 'center', gap: 20 }}>
        <div className="code" aria-hidden="true">404</div>
        <h1 className="display-m">{t('This scent has faded.')}</h1>
        <p className="muted">{t('This page or product does not exist, or it is no longer available.')}</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link className="btn" href="/shop">{t('Shop perfumes')}</Link><Link className="btn ghost" href="/">{t('Back home')}</Link></div>
      </div>
    </div>
  );
}
