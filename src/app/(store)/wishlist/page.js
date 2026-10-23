import Link from 'next/link';
import { WishlistView } from '@/components/store/Lists';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Wishlist'), robots: { index: false } };
}

export default async function Wishlist() {
  const { t } = await getT();
  return (
    <>
      <section className="page-head"><div className="wrap spread end-y">
        <div><nav className="crumbs"><Link href="/">{t('Home')}</Link><span>/</span><span aria-current="page">{t('Wishlist')}</span></nav><h1 className="display-l">{t('Saved perfumes')}</h1></div>
        <p className="lede">{t('Perfumes you have saved on this device. Move them to your bag when you are ready.')}</p>
      </div></section>
      <div className="wrap" style={{ paddingBlock: '32px 96px' }}><WishlistView /></div>
    </>
  );
}
