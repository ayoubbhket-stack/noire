'use client';
import { useEffect, useState } from 'react';

/** Size selection shared by the product page and quick view. */
export function useSizeSelection(product) {
  const pick = () => (product.variants.find((v) => v.stock > 0) || product.variants[0])?.id;
  const [id, setId] = useState(pick);
  useEffect(() => { setId(pick()); }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const variant = product.variants.find((v) => v.id === id) || product.variants[0] || null;
  return { variant, setId };
}

export function cartItemFrom(product, variant, qty = 1) {
  return {
    variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, brand: product.brand,
    image: product.images[0]?.url || null,
    variantLabel: `${variant.volume} ml`,
    unitPrice: variant.finalPrice, qty, max: variant.stock,
  };
}

export function stockLabel(stock, threshold, t) {
  if (stock <= 0) return { cls: 'out', text: t('Sold out') };
  if (stock <= threshold) return { cls: 'low', text: t('Only {n} left', { n: stock }) };
  return { cls: '', text: t('In stock, ships in 1 working day') };
}
