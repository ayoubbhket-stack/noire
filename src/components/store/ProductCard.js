'use client';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import { EyeIcon, HeartIcon } from './Icons';
import { PriceTag } from './Overlays';
import { cartItemFrom } from './variants';

export default function ProductCard({ product, priority = false, index = 0 }) {
  const { addToCart, wish, toggleWish, setQuick, t, lab } = useStore();
  const main = product.images[0];
  const alt = product.images[1];
  const inStock = product.variants.filter((v) => v.stock > 0);
  const onSale = product.variants.some((v) => v.salePrice != null && v.salePrice < v.price);
  const saved = wish.includes(product.slug);

  const quickAdd = () => {
    if (inStock.length === 1) addToCart(cartItemFrom(product, inStock[0]));
    else setQuick(product);
  };

  return (
    <article className="card" data-reveal style={{ '--d': `${(index % 4) * 70}ms` }}>
      <div className="card-media">
        <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          {main && <img className="main" src={main.url} alt={main.alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />}
          {alt && <img className="alt" src={alt.url} alt="" loading="lazy" decoding="async" />}
        </Link>
        <div className="card-flags">
          {product.newArrival && <span className="tag">{t('New')}</span>}
          {onSale && <span className="tag sale">{t('Sale')}</span>}
        </div>
        {!product.inStock && <div className="soldout-veil"><span className="tag dark">{t('Sold out')}</span></div>}
        <button className="icon-btn card-wish" aria-pressed={saved} aria-label={saved ? t('Remove from wishlist') : t('Save to wishlist')} onClick={() => toggleWish(product.slug, product.name)}><HeartIcon /></button>
        <div className="card-actions">
          <button className="btn small" disabled={!product.inStock} onClick={quickAdd}>{product.inStock ? (inStock.length === 1 ? t('Add to cart') : t('Choose size')) : t('Sold out')}</button>
          <button className="btn small ghost icon-only" onClick={() => setQuick(product)} aria-label={t('Quick view')}><EyeIcon /></button>
        </div>
      </div>
      <div className="card-body">
        <span className="card-brand">{product.brand}</span>
        <h3 className="card-name"><Link href={`/product/${product.slug}`}>{product.name}</Link></h3>
        <div className="card-meta">
          <span>{lab('concShort', product.concentration)} · {lab('family', product.family)}</span>
          <span dir="ltr">{product.variants.map((v) => v.volume).join(' / ')} ml</span>
        </div>
        <PriceTag product={product} />
        <p className="card-desc">{product.description}</p>
      </div>
    </article>
  );
}
