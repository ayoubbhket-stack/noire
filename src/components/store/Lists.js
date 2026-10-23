'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useStore } from './StoreProvider';
import { cartItemFrom } from './variants';

function useProducts(slugs, ready) {
  const [data, setData] = useState(null);
  const key = slugs.join(',');
  useEffect(() => {
    if (!ready) return;
    if (!key) { setData([]); return; }
    fetch(`/api/products?slugs=${encodeURIComponent(key)}`).then((r) => r.json()).then((d) => setData(d.products || [])).catch(() => setData([]));
  }, [key, ready]);
  return data;
}

export function RecentlyViewed({ exclude }) {
  const { recent, ready, t } = useStore();
  const slugs = recent.filter((s) => s !== exclude).slice(0, 4);
  const list = useProducts(slugs, ready);
  if (!list?.length) return null;
  return (
    <section className="section tight" aria-label={t('Recently viewed')}>
      <div className="wrap">
        <h2 className="display-m" style={{ marginBottom: 24 }}>{t('Recently viewed')}</h2>
        <div className="product-grid">{list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}</div>
      </div>
    </section>
  );
}

export function WishlistView() {
  const { wish, ready, removeWish, addToCart, setQuick, t, fmt, lab } = useStore();
  const list = useProducts(wish, ready);
  if (!ready || list === null) {
    return <div className="product-grid" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ aspectRatio: '4/5' }} />)}</div>;
  }
  const missing = wish.filter((s) => !list.some((p) => p.slug === s));
  if (!list.length) {
    return (
      <div className="empty">
        <h2 className="display-s">{t('Nothing saved yet')}</h2>
        <p className="muted">{t('Tap the heart on any perfume to keep it here. Your wishlist is saved on this device.')}</p>
        <Link className="btn" href="/shop">{t('Shop perfumes')}</Link>
      </div>
    );
  }
  return (
    <>
      <div className="cart-lines">
        {list.map((p) => {
          const inStock = p.variants.filter((v) => v.stock > 0);
          return (
            <div className="cart-line" key={p.slug}>
              <Link href={`/product/${p.slug}`}><img src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} /></Link>
              <div style={{ minWidth: 0 }}>
                <Link href={`/product/${p.slug}`} className="t">{p.name}</Link>
                <div className="v">{p.brand} · {lab('concShort', p.concentration)} · {p.variants.map((v) => v.volume).join(' / ')} ml</div>
                <div className={`stock ${p.inStock ? (inStock.reduce((n, v) => n + v.stock, 0) <= 3 ? 'low' : '') : 'out'}`} style={{ marginTop: 8, fontSize: '.84rem' }}>{p.inStock ? t('In stock') : t('Sold out')}</div>
                <div className="ctrl">
                  <button className="btn small" disabled={!p.inStock} onClick={() => {
                    if (inStock.length === 1) { addToCart(cartItemFrom(p, inStock[0])); removeWish(p.slug); } else setQuick(p);
                  }}>{p.inStock ? (inStock.length === 1 ? t('Move to bag') : t('Choose size')) : t('Sold out')}</button>
                  <button className="rm" onClick={() => removeWish(p.slug)}>{t('Remove')}</button>
                </div>
              </div>
              <span className="price num">{fmt(p.finalPrice)}{p.salePrice != null && <s>{fmt(p.price)}</s>}</span>
            </div>
          );
        })}
      </div>
      {missing.length > 0 && <p className="muted" style={{ marginTop: 16 }}>{t('{n} saved items are no longer available.', { n: missing.length })} <button className="link" onClick={() => missing.forEach(removeWish)}>{t('Remove')}</button></p>}
    </>
  );
}
