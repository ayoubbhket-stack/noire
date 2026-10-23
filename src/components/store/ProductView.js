'use client';
import { useEffect, useRef, useState } from 'react';
import Viewer3D from '../three/Viewer3D';
import { useStore } from './StoreProvider';
import { HeartIcon } from './Icons';
import { SizePicker } from './Overlays';
import { cartItemFrom, stockLabel, useSizeSelection } from './variants';

function Meter({ label, value, words }) {
  return (
    <div className="meter">
      <div className="spread"><span className="label">{label}</span><span className="small">{words[Math.max(0, Math.min(4, value - 1))]}</span></div>
      <div className="bars" aria-label={`${label}: ${value}/5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= value ? 'on' : ''} />)}</div>
    </div>
  );
}

export default function ProductView({ product: p, threshold, reviewSummary, shippingNote, shippingPolicy, returnsPolicy }) {
  const { addToCart, wish, toggleWish, pushRecent, t, fmt, lab } = useStore();
  const sel = useSizeSelection(p);
  const [idx, setIdx] = useState(-1); // -1 = 3D view
  const [qty, setQty] = useState(1);
  const [stickyOn, setStickyOn] = useState(false);
  const buyRef = useRef(null);

  useEffect(() => { pushRecent(p.slug); }, [p.slug, pushRecent]);
  useEffect(() => { setQty((q) => Math.max(1, Math.min(q, sel.variant?.stock || 1))); }, [sel.variant]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setStickyOn(!e.isIntersecting && e.boundingClientRect.top < 0));
    if (buyRef.current) io.observe(buyRef.current);
    return () => io.disconnect();
  }, []);

  const v = sel.variant;
  const st = stockLabel(v?.stock ?? 0, threshold, t);
  const saved = wish.includes(p.slug);
  const img = p.images[idx] || p.images[0];
  const add = () => v && v.stock > 0 && addToCart(cartItemFrom(p, v, qty));
  const perMl = v ? fmt(Math.round(v.finalPrice / v.volume)) : '';
  const tiers = [['Top notes', p.notes.top, 'The first impression, the first 15 minutes.'], ['Heart notes', p.notes.heart, 'The character, for the next few hours.'], ['Base notes', p.notes.base, 'What stays on your skin until the end.']];

  return (
    <div className="pdp">
      <div className="gallery">
        <div className="stage">
          {idx === -1 ? (
            <>
              <Viewer3D bottle={p.bottle} modelUrl={p.modelUrl} fit={12} distance={34} eager poster={p.images[0]?.url} posterAlt={t('3D model of {name}', { name: p.name })} />
              <span className="stage-hint small">{t('Drag to rotate')}</span>
            </>
          ) : img && <img key={img.url} src={img.url} alt={img.alt} className="stage-img" />}
        </div>
        <div className="thumbs" role="group" aria-label={t('Product images')}>
          <button className="t3d" aria-pressed={idx === -1} onClick={() => setIdx(-1)} aria-label={t('Show interactive 3D view')}>3D</button>
          {p.images.map((im, i) => (
            <button key={im.url} aria-pressed={idx === i} aria-label={t('Image {n}', { n: i + 1 })} onClick={() => setIdx(i)}><img src={im.url} alt="" loading="lazy" /></button>
          ))}
        </div>
      </div>

      <div className="buy">
        <div className="stack" style={{ gap: 10 }}>
          <div className="row" style={{ gap: 8 }}>
            {p.newArrival && <span className="tag">{t('New')}</span>}
            {p.variants.some((x) => x.salePrice != null) && <span className="tag sale">{t('Sale')}</span>}
            <span className="tag line">{t('100% original')}</span>
          </div>
          <span className="card-brand big">{p.brand}</span>
          <h1 className="display-l">{p.name}</h1>
          <p className="muted" style={{ margin: 0 }}>{lab('concentration', p.concentration)} · {lab('gender', p.gender)} · {lab('family', p.family)}</p>
          <div className="spread center-y">
            <div className="price big num"><span className={v?.salePrice != null ? 'now' : ''}>{v ? fmt(v.finalPrice) : ''}</span>{v?.salePrice != null && <s>{fmt(v.price)}</s>}</div>
            {reviewSummary && <a href="#reviews" className="small muted"><span className="stars">★</span> {reviewSummary.avg.toFixed(1)} ({reviewSummary.count})</a>}
          </div>
          {v && <p className="small muted" style={{ margin: 0 }}>{t('{price} per ml', { price: perMl })} · SKU {v.sku}</p>}
        </div>
        <p style={{ margin: 0 }}>{p.description}</p>

        <div className="opt-group">
          <span className="label">{t('Choose size')}</span>
          <SizePicker product={p} value={v?.id} onChange={sel.setId} />
        </div>

        <span className={`stock ${st.cls}`} aria-live="polite">{st.text}</span>
        <div className="buy-row" ref={buyRef}>
          <div className="qty" aria-label={t('Quantity')}>
            <button aria-label={t('Decrease quantity')} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <input aria-label={t('Quantity')} className="num" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(v?.stock || 1, Number(e.target.value.replace(/\D/g, '')) || 1)))} />
            <button aria-label={t('Increase quantity')} onClick={() => setQty((q) => Math.min(v?.stock || 1, q + 1, 20))}>+</button>
          </div>
          <button className="btn grow" disabled={!v || v.stock <= 0} onClick={add}>{v && v.stock > 0 ? t('Add to cart') : t('Sold out')}</button>
          <button className={`icon-btn wish-btn${saved ? ' on' : ''}`} aria-pressed={saved} aria-label={saved ? t('Remove from wishlist') : t('Save to wishlist')} onClick={() => toggleWish(p.slug, p.name)}><HeartIcon /></button>
        </div>
        <ul className="perks small">
          <li>{t('100% authentic, sealed bottle')}</li>
          <li>{t('Cash on delivery available')}</li>
          <li>{t('Free gift wrapping on request')}</li>
          <li>{shippingNote}</li>
        </ul>

        {(p.notes.top.length + p.notes.heart.length + p.notes.base.length) > 0 && (
          <section className="pyramid" aria-label={t('Fragrance notes')}>
            <h2 className="display-s">{t('Fragrance notes')}</h2>
            {tiers.map(([title, notes, hint], i) => notes.length > 0 && (
              <div className={`tier tier-${i}`} key={title}>
                <div><span className="label">{t(title)}</span><p className="small muted" style={{ margin: '2px 0 0' }}>{t(hint)}</p></div>
                <div className="notes">{notes.map((n) => <span key={n} className="note">{n}</span>)}</div>
              </div>
            ))}
          </section>
        )}

        <div className="meters">
          <Meter label={t('Longevity')} value={p.longevity} words={[t('Very weak'), t('Weak'), t('Moderate'), t('Long lasting'), t('Very long lasting')]} />
          <Meter label={t('Sillage')} value={p.sillage} words={[t('Intimate'), t('Soft'), t('Moderate'), t('Strong'), t('Enormous')]} />
          {p.seasons.length > 0 && (
            <div className="meter"><span className="label">{t('Best for')}</span><div className="row" style={{ gap: 6 }}>{p.seasons.map((s) => <span key={s} className="chip static">{lab('season', s)}</span>)}</div></div>
          )}
        </div>

        <div className="accordion">
          <details><summary>{t('Authenticity guarantee')}</summary><div className="body"><p>{t('Every bottle we sell is original and sealed, sourced from official distributors. Ask us for the batch code of any bottle before or after you buy.')}</p></div></details>
          <details><summary>{t('Shipping')}</summary><div className="body">{shippingPolicy.split('\n\n').map((x, i) => <p key={i}>{x}</p>)}</div></details>
          <details><summary>{t('Returns')}</summary><div className="body">{returnsPolicy.split('\n\n').map((x, i) => <p key={i}>{x}</p>)}</div></details>
        </div>
      </div>

      <div className={`sticky-buy${stickyOn ? ' show' : ''}`} aria-hidden={!stickyOn}>
        <div style={{ flex: 1, minWidth: 0 }}><strong className="ellipsis">{p.name}</strong><span className="small muted">{v?.volume} ml · {v ? fmt(v.finalPrice) : ''}</span></div>
        <button className="btn small" disabled={!v || v.stock <= 0} onClick={add} tabIndex={stickyOn ? 0 : -1}>{v && v.stock > 0 ? t('Add to cart') : t('Sold out')}</button>
      </div>
    </div>
  );
}
