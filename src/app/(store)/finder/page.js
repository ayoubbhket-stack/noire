import Link from 'next/link';
import Finder from '@/components/store/Finder';
import { getCatalog } from '@/lib/catalog';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t('Find your scent'), description: t('Answer four quick questions and get perfume suggestions that match your taste.'), alternates: { canonical: '/finder' } };
}

export default async function FinderPage() {
  const { t } = await getT();
  const catalog = await getCatalog();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs"><Link href="/">{t('Home')}</Link><span>/</span><span aria-current="page">{t('Find your scent')}</span></nav>
          <h1 className="display-l">{t('Find your scent')}</h1>
          <p className="lede">{t('Four quick questions. No account needed.')}</p>
        </div>
      </section>
      <div className="wrap" style={{ paddingBottom: 96 }}><Finder products={catalog} /></div>
    </>
  );
}
