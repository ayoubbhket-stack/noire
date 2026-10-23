import { CheckoutView } from '@/components/store/CartCheckout';
import { getSetting } from '@/lib/settings';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Checkout'), robots: { index: false } };
}

export default async function Checkout() {
  const { t } = await getT();
  const shipping = await getSetting('shipping');
  return (
    <>
      <section className="page-head compact"><div className="wrap">
        <nav className="steps" aria-label={t('Checkout steps')}><span>01 {t('Bag')}</span><span>—</span><span className="on">02 {t('Checkout')}</span><span>—</span><span>03 {t('Confirmation')}</span></nav>
        <h1 className="display-l">{t('Checkout')}</h1>
      </div></section>
      <div className="wrap"><CheckoutView regions={shipping.regions} /></div>
    </>
  );
}
