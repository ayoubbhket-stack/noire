import Link from 'next/link';
import crypto from 'node:crypto';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { getSetting } from '@/lib/settings';
import { getT } from '@/lib/lang';
import { formatPrice, ORDER_STATUS } from '@/lib/i18n';

export const metadata = { title: 'Order', robots: { index: false } };

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const PAY = { unpaid: 'To be paid on delivery', pending: 'Waiting for payment confirmation', paid: 'Paid', failed: 'Payment failed — we will contact you', refunded: 'Refunded' };

export default async function OrderPage({ params, searchParams }) {
  const db = await getDb();
  const [o] = await db.select().from(s.orders).where(eq(s.orders.number, params.number));
  // the access token in the link protects customer details
  const tok = String(searchParams.t || '');
  if (!o || tok.length !== o.accessToken.length || !crypto.timingSafeEqual(Buffer.from(tok), Buffer.from(o.accessToken))) notFound();
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, o.id));
  const store = await getSetting('store');
  const { lang, t } = await getT();
  const formatMoney = (v) => formatPrice(v, store.currency, lang);
  const stepIdx = STEPS.indexOf(o.status);
  return (
    <div className="wrap">
      <section className="confirm-hero">
        <nav className="steps"><span>01 {t('Bag')}</span><span>—</span><span>02 {t('Checkout')}</span><span>—</span><span className="on">03 {t('Confirmation')}</span></nav>
        <p className="eyebrow">{o.status === 'cancelled' ? t('Order cancelled') : t('Thank you, order received')}</p>
        <h1 className="display-l">{t('{name}, your order is being prepared.', { name: o.name.split(' ')[0] })}</h1>
        <div className="num-big">{o.number}</div>
        <p className="lede">{t('Keep this order number.')} {o.paymentMethod === 'cod' ? t('Pay {amount} in cash when the courier arrives.', { amount: formatMoney(o.total) }) : ''} {t('We will call {phone} to confirm delivery.', { phone: o.phone })}</p>
      </section>
      {stepIdx > -1 && (
        <ol className="row" style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', gap: 0 }} aria-label={t('Order progress')}>
          {STEPS.map((st, i) => <li key={st} className="small" style={{ flex: 1, minWidth: 90, paddingTop: 10, borderTop: `2px solid ${i <= stepIdx ? 'var(--accent)' : 'var(--line)'}`, color: i <= stepIdx ? 'var(--fg)' : 'var(--muted)' }}>{ORDER_STATUS[st][lang === 'ar' ? 1 : 0]}</li>)}
        </ol>
      )}
      <div className="cart-layout" style={{ paddingTop: 0 }}>
        <div className="cart-lines">
          {items.map((i) => (
            <div className="cart-line" key={i.id} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <div><span className="t">{i.name}</span> <span className="muted num">× {i.qty}</span><div className="v">{i.variantLabel} · {i.sku}</div></div>
              <span className="price num">{formatMoney(i.lineTotal)}</span>
            </div>
          ))}
          <div className="stack" style={{ paddingBlock: 24, gap: 6 }}>
            <span className="label">{t('Deliver to')}</span>
            <p style={{ margin: 0 }}>{o.name} · {o.phone}<br />{o.address}<br />{o.city}, {o.region}</p>
          </div>
        </div>
        <aside className="summary">
          <div className="line"><span>{t('Subtotal')}</span><b>{formatMoney(o.subtotal)}</b></div>
          {o.discountTotal > 0 && <div className="line"><span>{t('Discount')} {o.discountCode}</span><b>− {formatMoney(o.discountTotal)}</b></div>}
          <div className="line"><span>{t('Shipping')}</span><b>{o.shippingFee ? formatMoney(o.shippingFee) : t('Free')}</b></div>
          {o.codFee > 0 && <div className="line"><span>{t('Cash on delivery fee')}</span><b>{formatMoney(o.codFee)}</b></div>}
          {o.taxTotal > 0 && <div className="line"><span>{t('Tax')}</span><b>{formatMoney(o.taxTotal)}</b></div>}
          <div className="line total"><span>{t('Total')}</span><b>{formatMoney(o.total)}</b></div>
          <div className="line"><span>{t('Payment')}</span><b>{o.paymentMethod === 'cod' ? t('Cash on delivery') : t('Online')} · {t(PAY[o.paymentStatus])}</b></div>
          <Link className="btn block" href="/shop">{t('Continue shopping')}</Link>
          <Link className="link small" href="/contact">{t('Questions about this order? Contact us')}</Link>
        </aside>
      </div>
    </div>
  );
}
