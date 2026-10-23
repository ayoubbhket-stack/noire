import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContents } from '@/lib/settings';
import { getT } from '@/lib/lang';
import { formatPrice } from '@/lib/i18n';

const TITLES = { shipping: 'Shipping policy', returns: 'Returns policy', privacy: 'Privacy policy', terms: 'Terms & conditions' };

export async function generateMetadata({ params }) {
  const { t } = await getT();
  return TITLES[params.slug] ? { title: t(TITLES[params.slug]), alternates: { canonical: `/policies/${params.slug}` } } : { title: 'Not found' };
}

export default async function Policy({ params }) {
  if (!TITLES[params.slug]) notFound();
  const { lang, t } = await getT();
  const { policies, shipping, store } = await getContents(['policies', 'shipping', 'store'], lang);
  const money = (v) => formatPrice(v, store.currency, lang);
  return (
    <>
      <section className="page-head"><div className="wrap">
        <nav className="crumbs"><Link href="/">{t('Home')}</Link><span>/</span><span aria-current="page">{t(TITLES[params.slug])}</span></nav>
        <h1 className="display-l">{t(TITLES[params.slug])}</h1>
        <nav className="row" style={{ marginTop: 24 }}>{Object.entries(TITLES).map(([k, x]) => <Link key={k} href={`/policies/${k}`} className={`chip${k === params.slug ? ' on' : ''}`}>{t(x)}</Link>)}</nav>
      </div></section>
      <div className="wrap"><div className="policy prose">
        {(policies[params.slug] || '').split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        {params.slug === 'shipping' && (
          <div className="table-wrap">
            <table className="ship-table">
              <thead><tr><th>{t('Region')}</th><th>{t('Delivery')}</th><th className="end">{t('Fee')}</th></tr></thead>
              <tbody>{shipping.regions.map((r) => <tr key={r.name}><td>{t(r.name)}</td><td className="muted">{t('{days} working days', { days: r.days })}</td><td className="num end">{money(r.fee)}</td></tr>)}</tbody>
            </table>
            {shipping.freeShippingOver > 0 && <p className="muted" style={{ marginTop: 16 }}>{t('Free shipping on orders over {amount}.', { amount: money(shipping.freeShippingOver) })}</p>}
          </div>
        )}
      </div></div>
    </>
  );
}
