'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from './StoreProvider';
import { CloseIcon } from './Icons';
import { cartItemFrom, stockLabel, useSizeSelection } from './variants';

export function CartDrawer() {
  const { drawer, setDrawer, cart, setQty, removeFromCart, count, t, fmt } = useStore();
  const path = usePathname();
  useEffect(() => { setDrawer(false); }, [path, setDrawer]);
  useEffect(() => {
    if (!drawer) return undefined;
    const k = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [drawer, setDrawer]);
  if (!drawer) return null;
  const sub = cart.reduce((n, x) => n + x.unitPrice * x.qty, 0);
  return (
    <>
      <div className="scrim" onClick={() => setDrawer(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('Shopping bag')}>
        <div className="spread center-y">
          <h2 className="display-s">{t('Your bag')} <span className="muted num">({count})</span></h2>
          <button className="icon-btn" aria-label={t('Close')} onClick={() => setDrawer(false)} autoFocus><CloseIcon /></button>
        </div>
        <div className="lines">
          {!cart.length && <div className="empty"><p className="muted">{t('Your bag is empty.')}</p><Link className="btn small" href="/shop">{t('Shop perfumes')}</Link></div>}
          {cart.map((x) => (
            <div className="mini-line" key={x.variantId}>
              {x.image ? <img src={x.image} alt="" /> : <span />}
              <div style={{ minWidth: 0 }}>
                {x.brand && <span className="card-brand">{x.brand}</span>}
                <Link href={`/product/${x.slug}`} className="t">{x.name}</Link>
                <div className="v">{x.variantLabel}</div>
                <div className="row" style={{ marginTop: 8, gap: 10 }}>
                  <div className="qty small">
                    <button aria-label={t('Decrease quantity')} onClick={() => (x.qty > 1 ? setQty(x.variantId, x.qty - 1) : removeFromCart(x.variantId))}>−</button>
                    <input aria-label={t('Quantity')} className="num" value={x.qty} readOnly />
                    <button aria-label={t('Increase quantity')} onClick={() => setQty(x.variantId, Math.min(x.max || 20, x.qty + 1))}>+</button>
                  </div>
                  <button className="rm" onClick={() => removeFromCart(x.variantId)}>{t('Remove')}</button>
                </div>
              </div>
              <span className="price num">{fmt(x.unitPrice * x.qty)}</span>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="spread"><span className="muted">{t('Subtotal')}</span><b className="price num">{fmt(sub)}</b></div>
            <p className="small muted" style={{ margin: 0 }}>{t('Shipping and discounts are calculated at checkout.')}</p>
            <Link className="btn block" href="/checkout">{t('Checkout')}</Link>
            <Link className="btn ghost block" href="/cart">{t('View bag')}</Link>
          </div>
        )}
      </aside>
    </>
  );
}

/** Size buttons: volume + price per size. */
export function SizePicker({ product, value, onChange }) {
  const { t, fmt } = useStore();
  return (
    <div className="size-opts" role="radiogroup" aria-label={t('Size')}>
      {product.variants.map((v) => {
        const sale = v.salePrice != null && v.salePrice < v.price;
        return (
          <button key={v.id} type="button" role="radio" className="size-opt" aria-checked={value === v.id} disabled={v.stock <= 0} onClick={() => onChange(v.id)}>
            <span className="ml num">{v.volume}<small> ml</small></span>
            <span className="pr num">{fmt(v.finalPrice)}{sale && <s>{fmt(v.price)}</s>}</span>
            {v.stock <= 0 && <span className="so">{t('Sold out')}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function QuickView({ threshold = 3 }) {
  const { quick, setQuick, t } = useStore();
  useEffect(() => {
    if (!quick) return undefined;
    const k = (e) => e.key === 'Escape' && setQuick(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [quick, setQuick]);
  if (!quick) return null;
  return (
    <>
      <div className="scrim" onClick={() => setQuick(null)} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${t('Quick view')}: ${quick.name}`}>
        <QuickBody product={quick} onClose={() => setQuick(null)} threshold={threshold} />
      </div>
    </>
  );
}

function QuickBody({ product, onClose, threshold }) {
  const { addToCart, t, lab } = useStore();
  const sel = useSizeSelection(product);
  const [img, setImg] = useState(0);
  const st = stockLabel(sel.variant?.stock ?? 0, threshold, t);
  return (
    <div className="modal-box">
      <div className="media">
        {product.images[img] && <img key={product.images[img].url} src={product.images[img].url} alt={product.images[img].alt} />}
        <div className="dots-nav">
          {product.images.map((im, i) => <button key={im.url} aria-pressed={i === img} aria-label={t('Image {n}', { n: i + 1 })} onClick={() => setImg(i)} />)}
        </div>
      </div>
      <div className="content">
        <button className="icon-btn modal-x" aria-label={t('Close')} onClick={onClose} autoFocus><CloseIcon /></button>
        <span className="card-brand">{product.brand}</span>
        <h2 className="display-m">{product.name}</h2>
        <p className="muted small" style={{ margin: 0 }}>{lab('concentration', product.concentration)} · {lab('gender', product.gender)} · {lab('family', product.family)}</p>
        {product.notes.top.length > 0 && <p className="small" style={{ margin: 0 }}><span className="muted">{t('Notes')}: </span>{[...product.notes.top, ...product.notes.heart].slice(0, 5).join('، ')}</p>}
        <div className="opt-group"><span className="label">{t('Choose size')}</span><SizePicker product={product} value={sel.variant?.id} onChange={sel.setId} /></div>
        <span className={`stock ${st.cls}`}>{st.text}</span>
        <button className="btn block" disabled={!sel.variant || sel.variant.stock <= 0} onClick={() => { addToCart(cartItemFrom(product, sel.variant)); onClose(); }}>
          {sel.variant?.stock > 0 ? t('Add to cart') : t('Sold out')}
        </button>
        <Link href={`/product/${product.slug}`} className="link small" onClick={onClose}>{t('Full details')}</Link>
      </div>
    </div>
  );
}

/** "From" price (cheapest in-stock size) with the original price when on sale. */
export function PriceTag({ product, big }) {
  const { t, fmt } = useStore();
  const onSale = product.salePrice != null && product.salePrice < product.price;
  return (
    <div className={`price num${big ? ' big' : ''}`}>
      {product.priceRange && <span className="from">{t('From')}</span>}
      <span className={onSale ? 'now' : ''}>{fmt(product.finalPrice)}</span>
      {onSale && <s>{fmt(product.price)}</s>}
    </div>
  );
}

export function Toasts() {
  const { toasts, t } = useStore();
  return (
    <div className="toasts" aria-live="polite" role="status">
      {toasts.map((x) => (
        <div key={x.id} className={`toast${x.tone === 'bad' ? ' bad' : ''}`}>
          <span>{x.text}</span>
          {x.href && <Link href={x.href}>{x.action || t('View')}</Link>}
        </div>
      ))}
    </div>
  );
}
