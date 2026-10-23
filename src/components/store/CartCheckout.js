'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './StoreProvider';
import { Field } from './Forms';

const CODE_KEY = 'nr_code';
const getCode = () => { try { return sessionStorage.getItem(CODE_KEY) || ''; } catch { return ''; } };
const putCode = (c) => { try { c ? sessionStorage.setItem(CODE_KEY, c) : sessionStorage.removeItem(CODE_KEY); } catch { /* ignore */ } };

/** Server-priced quote for the current cart; keeps local prices in sync. */
function useQuote({ code, region, paymentMethod }) {
  const { cart, ready, replaceCart } = useStore();
  const [q, setQ] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const items = useMemo(() => cart.map((x) => ({ variantId: x.variantId, qty: x.qty })), [cart]);
  const key = JSON.stringify([items, code, region, paymentMethod]);
  const cartRef = useRef(cart); cartRef.current = cart;
  const refresh = useCallback(async () => {
    if (!ready) return;
    if (!items.length) { setQ(null); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/cart/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items, code: code || undefined, region: region || undefined, paymentMethod }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not load prices.');
      setQ(d); setErr(null);
      // sync display prices / stock caps into the local cart
      const cur = cartRef.current;
      const next = cur.map((x) => { const l = d.lines.find((y) => y.variantId === x.variantId); return l && !l.error ? { ...x, unitPrice: l.unitPrice, max: l.stock } : x; });
      if (next.some((x, i) => x.unitPrice !== cur[i].unitPrice || x.max !== cur[i].max)) replaceCart(next);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [key, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, [refresh]);
  return { q, err, loading, refresh };
}

function Summary({ q, loading, children, showShipping = true }) {
  const { t, fmt } = useStore();
  if (!q) return <aside className="summary"><div className="skeleton" style={{ height: 160 }} /></aside>;
  return (
    <aside className="summary" aria-busy={loading}>
      <h2 className="display-s">{t('Order summary')}</h2>
      <div className="line"><span>{t('Subtotal')}</span><b className="num">{fmt(q.subtotal)}</b></div>
      {q.discount && <div className="line"><span>{t('Discount')} <span className="tag line">{q.discount.code}</span></span><b className="num" style={{ color: 'var(--ok)' }}>− {fmt(q.discountTotal)}</b></div>}
      {showShipping && <div className="line"><span>{t('Shipping')}{q.shippingRegion ? ` · ${t(q.shippingRegion.name)}` : ''}</span><b className="num">{q.shippingFee == null ? t('Choose region') : q.shippingFee === 0 ? t('Free') : fmt(q.shippingFee)}</b></div>}
      {q.codFee > 0 && <div className="line"><span>{t('Cash on delivery fee')}</span><b className="num">{fmt(q.codFee)}</b></div>}
      {q.taxAdded > 0 && <div className="line"><span>{t(q.taxLabel)}</span><b className="num">{fmt(q.taxAdded)}</b></div>}
      <div className="line total"><span>{t('Total')}</span><b className="num">{fmt(q.total)}</b></div>
      {q.taxIncludedAmount > 0 && <p className="small muted" style={{ margin: 0 }}>{t('Includes {amount} VAT.', { amount: fmt(q.taxIncludedAmount) })}</p>}
      {q.freeShippingOver > 0 && q.subtotal - q.discountTotal < q.freeShippingOver && (
        <p className="small free-ship" style={{ margin: 0 }}>{t('Add {amount} more for free shipping.', { amount: fmt(q.freeShippingOver - (q.subtotal - q.discountTotal)) })}</p>
      )}
      {children}
    </aside>
  );
}

function CodeInput({ code, setCode, q }) {
  const { t } = useStore();
  const [v, setV] = useState(code);
  useEffect(() => setV(code), [code]);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <form className="row" style={{ gap: 8, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); const c = v.trim().toUpperCase(); setCode(c); putCode(c); }}>
        <label htmlFor="code" className="sr-only">{t('Discount code')}</label>
        <input id="code" className="input" placeholder={t('Discount code')} value={v} onChange={(e) => setV(e.target.value)} style={{ minHeight: 44, textTransform: 'uppercase' }} />
        <button className="btn small ghost" style={{ minHeight: 44 }}>{t('Apply')}</button>
      </form>
      {code && q?.discountError && <span className="err" style={{ color: 'var(--bad)', fontSize: '.86rem' }} role="alert">{t(q.discountError)} <button className="link" onClick={() => { setCode(''); putCode(''); }}>{t('Remove')}</button></span>}
      {code && q?.discount && <span style={{ color: 'var(--ok)', fontSize: '.86rem' }}>{t('{code} applied', { code: q.discount.code })}{q.discount.description ? ` — ${t(q.discount.description)}` : ''}. <button className="link" onClick={() => { setCode(''); putCode(''); }}>{t('Remove')}</button></span>}
    </div>
  );
}

export function CartView() {
  const { cart, ready, setQty, removeFromCart, t, fmt } = useStore();
  const [code, setCode] = useState('');
  useEffect(() => setCode(getCode()), []);
  const { q, err, loading } = useQuote({ code });
  if (!ready) return <div className="skeleton" style={{ height: 300 }} />;
  if (!cart.length) {
    return (
      <div className="empty">
        <h2 className="display-s">{t('Your bag is empty')}</h2>
        <p className="muted">{t('Find a scent you love and it will wait for you here.')}</p>
        <Link className="btn" href="/shop">{t('Shop perfumes')}</Link>
      </div>
    );
  }
  const problems = q?.problems || [];
  return (
    <div className="cart-layout">
      <div>
        {err && <div className="notice bad" role="alert" style={{ marginBottom: 16 }}>{t(err)}</div>}
        {problems.length > 0 && <div className="notice bad" role="alert" style={{ marginBottom: 16 }}>{t('Some items need attention before checkout.')}</div>}
        <div className="cart-lines">
          {cart.map((x) => {
            const l = q?.lines.find((y) => y.variantId === x.variantId);
            return (
              <div className="cart-line" key={x.variantId}>
                <Link href={`/product/${x.slug}`}>{x.image ? <img src={x.image} alt={x.name} /> : <span />}</Link>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/product/${x.slug}`} className="t">{x.name}</Link>
                  <div className="v">{x.variantLabel}</div>
                  <div className="v num">{t('{price} each', { price: fmt(l?.unitPrice ?? x.unitPrice) })}</div>
                  {l?.error && <div className="err">{t(l.error)}</div>}
                  <div className="ctrl">
                    <div className="qty small" role="group" aria-label={t('Quantity')}>
                      <button aria-label={t('Decrease quantity')} onClick={() => setQty(x.variantId, x.qty - 1)} disabled={x.qty <= 1}>−</button>
                      <input aria-label={t('Quantity')} className="num" value={x.qty} inputMode="numeric" onChange={(e) => setQty(x.variantId, Math.min(l?.stock || 20, Number(e.target.value.replace(/\D/g, '')) || 1))} />
                      <button aria-label={t('Increase quantity')} onClick={() => setQty(x.variantId, Math.min(l?.stock ?? x.max ?? 20, x.qty + 1))} disabled={x.qty >= (l?.stock ?? x.max ?? 20)}>+</button>
                    </div>
                    <button className="rm" onClick={() => removeFromCart(x.variantId)}>{t('Remove')}</button>
                  </div>
                </div>
                <span className="price num">{fmt((l?.unitPrice ?? x.unitPrice) * x.qty)}</span>
              </div>
            );
          })}
        </div>
        <Link href="/shop" className="link small" style={{ display: 'inline-block', marginTop: 24 }}>{t('Continue shopping')}</Link>
      </div>
      <Summary q={q} loading={loading} showShipping={false}>
        <CodeInput code={code} setCode={setCode} q={q} />
        <p className="small muted" style={{ margin: 0 }}>{t('Shipping is calculated at checkout by region.')}</p>
        <Link className="btn block" href="/checkout" aria-disabled={problems.length > 0 || !q} onClick={(e) => problems.length && e.preventDefault()}>{t('Proceed to checkout')}</Link>
      </Summary>
    </div>
  );
}

const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function CheckoutView({ regions }) {
  const router = useRouter();
  const { cart, ready, clearCart, toast, t, fmt, lang } = useStore();
  const [f, setF] = useState({ name: '', phone: '', email: '', region: '', city: '', address: '', note: '', paymentMethod: 'cod' });
  const [code, setCode] = useState('');
  const [errs, setErrs] = useState({});
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const keyRef = useRef(null);
  useEffect(() => {
    setCode(getCode());
    try { keyRef.current = sessionStorage.getItem('nr_ckey') || newKey(); sessionStorage.setItem('nr_ckey', keyRef.current); } catch { keyRef.current = newKey(); }
    try { const saved = JSON.parse(localStorage.getItem('nr_checkout') || 'null'); if (saved) setF((x) => ({ ...x, ...saved, paymentMethod: 'cod' })); } catch { /* ignore */ }
  }, []);
  const { q, loading, refresh } = useQuote({ code, region: f.region, paymentMethod: f.paymentMethod });
  const region = regions.find((r) => r.name === f.region);
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value, ...(k === 'region' ? { city: '' } : {}) })); setErrs((x) => ({ ...x, [k]: undefined })); };

  useEffect(() => { if (q && !q.onlinePaymentAvailable && f.paymentMethod === 'online') setF((x) => ({ ...x, paymentMethod: 'cod' })); }, [q, f.paymentMethod]);

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 3) e.name = t('Enter your full name.');
    const digits = f.phone.replace(/[^\d]/g, '').replace(/^20(?=1)/, '0').replace(/^0020/, '0');
    if (!/^01[0125]\d{8}$/.test(digits)) e.phone = t('Enter an Egyptian mobile number, e.g. 010 1234 5678.');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = t('Enter a valid email address.');
    if (!f.region) e.region = t('Choose your region.');
    if (!f.city.trim()) e.city = t('Choose or enter your city.');
    if (f.address.trim().length < 8) e.address = t('Enter the street, building and apartment.');
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (busy) return;
    setFormErr('');
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) { document.getElementById(`co-${Object.keys(e)[0]}`)?.focus(); return; }
    if (!q || q.problems.length) { setFormErr(t('Some items in your bag are unavailable. Review your bag first.')); return; }
    setBusy(true);
    try {
      try { const { paymentMethod, note, ...keep } = f; localStorage.setItem('nr_checkout', JSON.stringify(keep)); } catch { /* ignore */ }
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...f, lang, code: code || '', items: cart.map((x) => ({ variantId: x.variantId, qty: x.qty })), idempotencyKey: keyRef.current, expectedTotal: q.total }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.fields) setErrs(Object.fromEntries(Object.entries(d.fields).map(([k, v]) => [k.split('.')[0], t(v)])));
        setFormErr(t(d.error || 'Could not place the order. Please try again.'));
        if (r.status === 409) { await refresh(); keyRef.current = newKey(); try { sessionStorage.setItem('nr_ckey', keyRef.current); } catch { /* ignore */ } }
        setBusy(false);
        return;
      }
      setDone(true);
      clearCart(); putCode('');
      try { sessionStorage.removeItem('nr_ckey'); } catch { /* ignore */ }
      if (d.redirectUrl) { window.location.href = d.redirectUrl; return; }
      if (d.paymentError) toast(t(d.paymentError), { tone: 'bad', ms: 9000 });
      router.push(`/order/${d.number}?t=${d.token}`);
    } catch {
      setFormErr(t('Network problem. Check your connection and press Place order again — you will not be charged twice.'));
      setBusy(false);
    }
  };

  if (!ready) return <div className="skeleton" style={{ height: 400 }} />;
  if (!cart.length && !done) return <div className="empty"><h2 className="display-s">{t('Your bag is empty')}</h2><Link className="btn" href="/shop">{t('Shop perfumes')}</Link></div>;
  if (done) return <div className="empty"><p className="muted">{t('Placing order…')}</p><div className="skeleton" style={{ height: 8, width: 200 }} /></div>;

  return (
    <form className="cart-layout" onSubmit={submit} noValidate>
      <div className="stack" style={{ gap: 36 }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="display-s" style={{ marginBottom: 16 }}>{t('Contact details')}</legend>
          <div className="form-grid">
            <Field id="co-name" label={t('Full name')} err={errs.name}><input id="co-name" className="input" value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errs.name} aria-describedby={errs.name ? 'co-name-err' : undefined} /></Field>
            <Field id="co-phone" label={t('Mobile number')} err={errs.phone} hint={t('The courier will call this number.')}><input id="co-phone" type="tel" inputMode="tel" className="input" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="010 1234 5678" aria-invalid={!!errs.phone} /></Field>
            <Field id="co-email" label={t('Email (optional)')} err={errs.email} hint={t('For your order confirmation.')} full><input id="co-email" type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errs.email} /></Field>
          </div>
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="display-s" style={{ marginBottom: 16 }}>{t('Delivery')}</legend>
          <div className="form-grid">
            <Field id="co-region" label={t('Region')} err={errs.region}>
              <select id="co-region" className="select" value={f.region} onChange={set('region')} aria-invalid={!!errs.region}>
                <option value="">{t('Choose region')}</option>
                {regions.map((r) => <option key={r.name} value={r.name}>{t(r.name)} — {fmt(r.fee)} · {t('{days} days', { days: r.days })}</option>)}
              </select>
            </Field>
            <Field id="co-city" label={t('City / area')} err={errs.city}>
              {region?.cities?.length ? (
                <select id="co-city" className="select" value={region.cities.includes(f.city) ? f.city : (f.city ? 'Other' : '')} onChange={set('city')} aria-invalid={!!errs.city}>
                  <option value="">{t('Choose city')}</option>
                  {region.cities.map((c) => <option key={c} value={c}>{t(c)}</option>)}
                </select>
              ) : <input id="co-city" className="input" value={f.city} onChange={set('city')} autoComplete="address-level2" disabled={!f.region} placeholder={f.region ? '' : t('Choose a region first')} />}
            </Field>
            <Field id="co-address" label={t('Street address')} err={errs.address} full hint={t('Street, building number, floor, apartment, landmark.')}><textarea id="co-address" className="textarea" style={{ minHeight: 90 }} value={f.address} onChange={set('address')} autoComplete="street-address" aria-invalid={!!errs.address} /></Field>
            <Field id="co-note" label={t('Delivery note or gift message (optional)')} full><input id="co-note" className="input" value={f.note} onChange={set('note')} /></Field>
          </div>
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="display-s" style={{ marginBottom: 16 }}>{t('Payment')}</legend>
          <div className="pay-opts" role="radiogroup">
            {q?.codAvailable !== false && (
              <label className="pay-opt"><input type="radio" name="pay" value="cod" checked={f.paymentMethod === 'cod'} onChange={set('paymentMethod')} />
                <span><strong>{t('Cash on delivery')}</strong><br /><span className="muted small">{t('Pay the courier in cash when your order arrives.')}{q?.codFee ? ` ${t('A {fee} fee applies.', { fee: fmt(q.codFee) })}` : ''}</span></span></label>
            )}
            <label className={`pay-opt${q?.onlinePaymentAvailable ? '' : ' disabled'}`}><input type="radio" name="pay" value="online" disabled={!q?.onlinePaymentAvailable} checked={f.paymentMethod === 'online'} onChange={set('paymentMethod')} />
              <span><strong>{t('Card / wallet (online)')}</strong><br /><span className="muted small">{q?.onlinePaymentAvailable ? t('You will be redirected to our secure payment page (Paymob).') : t('Online payment is not available yet. Please use cash on delivery.')}</span></span></label>
          </div>
        </fieldset>
      </div>
      <Summary q={q} loading={loading}>
        <div className="mini-lines">
          {cart.map((x) => {
            const l = q?.lines.find((y) => y.variantId === x.variantId);
            return (
              <div className="mini-line" key={x.variantId}>
                {x.image ? <img src={x.image} alt="" /> : <span />}
                <div style={{ minWidth: 0 }}><strong style={{ fontSize: '.9rem' }}>{x.name}</strong> <span className="muted num">× {x.qty}</span><div className="small muted">{x.variantLabel}</div>{l?.error && <div style={{ color: 'var(--bad)', fontSize: '.8rem' }}>{t(l.error)}</div>}</div>
                <span className="num" style={{ fontSize: '.86rem' }}>{fmt((l?.unitPrice ?? x.unitPrice) * x.qty)}</span>
              </div>
            );
          })}
        </div>
        <CodeInput code={code} setCode={setCode} q={q} />
        {formErr && <div className="notice bad" role="alert">{formErr}</div>}
        <button className="btn block" disabled={busy || loading || !q || q.problems.length > 0}>{busy ? t('Placing order…') : f.paymentMethod === 'online' ? `${t('Pay')} ${q ? fmt(q.total) : ''}` : `${t('Place order')} · ${q ? fmt(q.total) : ''}`}</button>
        <p className="small muted" style={{ margin: 0 }}>{t('By placing your order you agree to our')} <Link className="link" href="/policies/terms">{t('terms')}</Link> {t('and')} <Link className="link" href="/policies/returns">{t('returns policy')}</Link>.</p>
        <Link href="/cart" className="link small">{t('Back to bag')}</Link>
      </Summary>
    </form>
  );
}
