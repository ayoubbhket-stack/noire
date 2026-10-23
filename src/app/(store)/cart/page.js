import Link from 'next/link';
import { CartView } from '@/components/store/CartCheckout';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Bag'), robots: { index: false } };
}

export default async function Cart() {
  const { t } = await getT();
  return (
    <>
      <section className="page-head compact"><div className="wrap spread end-y">
        <div><nav className="steps" aria-label={t('Checkout steps')}><span className="on">01 {t('Bag')}</span><span>—</span><span>02 {t('Checkout')}</span><span>—</span><span>03 {t('Confirmation')}</span></nav><h1 className="display-l">{t('Your bag')}</h1></div>
        <Link href="/shop" className="link">{t('Continue shopping')}</Link>
      </div></section>
      <div className="wrap"><CartView /></div>
    </>
  );
}
