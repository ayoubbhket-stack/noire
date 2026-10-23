import Link from 'next/link';
import { ContactForm, CopyText } from '@/components/store/Forms';
import { getContents } from '@/lib/settings';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Contact'), description: t('Questions about a scent, an order or a gift? Contact us.'), alternates: { canonical: '/contact' } };
}

export default async function Contact() {
  const { lang, t } = await getT();
  const { store, contact } = await getContents(['store', 'contact'], lang);
  const groups = [...new Set(contact.faqs.map((f) => f.group || t('General')))];
  const wa = String(store.whatsapp || store.phone || '').replace(/\D/g, '').replace(/^0/, '20');
  return (
    <>
      <section className="page-head"><div className="wrap spread end-y">
        <div><nav className="crumbs"><Link href="/">{t('Home')}</Link><span>/</span><span aria-current="page">{t('Contact')}</span></nav><h1 className="display-xl">{t('Talk to us')}</h1></div>
        <p className="lede">{contact.intro}</p>
      </div></section>
      <div className="wrap contact-grid">
        <div className="contact-card">
          <div><span className="label">{t('Email')}</span><div className="row"><a className="big link" href={`mailto:${store.email}`} dir="ltr">{store.email}</a><CopyText text={store.email} /></div></div>
          <div><span className="label">{t('Phone / WhatsApp')}</span><div className="row"><span className="big num" dir="ltr">{store.phone}</span><CopyText text={store.phone} /></div>
            {wa && <a className="btn small" style={{ marginTop: 12 }} href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">{t('Chat on WhatsApp')}</a>}</div>
          <div><span className="label">{t('Store')}</span><p className="muted" style={{ margin: '6px 0 0' }}>{store.address}<br />{store.hours}</p></div>
          <div className="socials">{Object.entries(store.social || {}).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k}</a>)}</div>
          {store.showMap && <a className="map-ph" href={store.mapUrl || '#'} target="_blank" rel="noreferrer"><span className="pin" /><span className="small">{t('Open in maps')} ↗</span></a>}
        </div>
        <div><h2 className="display-s" style={{ marginBottom: 20 }}>{t('Send a message')}</h2><ContactForm /></div>
      </div>
      <section className="section bordered" id="faq">
        <div className="wrap">
          <h2 className="display-l" style={{ marginBottom: 40 }}>{t('Questions')}</h2>
          {groups.map((g) => (
            <div className="faq-group" key={g}>
              <span className="eyebrow">{g}</span>
              <div className="accordion">{contact.faqs.filter((f) => (f.group || t('General')) === g).map((f, i) => <details key={i}><summary>{f.q}</summary><div className="body"><p>{f.a}</p></div></details>)}</div>
            </div>
          ))}
          <p className="muted">{t('More detail in our')} <Link className="link" href="/policies/shipping">{t('shipping policy')}</Link> {t('and')} <Link className="link" href="/policies/returns">{t('returns policy')}</Link>.</p>
        </div>
      </section>
    </>
  );
}
