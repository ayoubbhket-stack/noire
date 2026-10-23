'use client';
import { useStore } from '@/components/store/StoreProvider';

export default function Error({ reset }) {
  const { t } = useStore();
  return (
    <div className="nf">
      <div className="stack" style={{ alignItems: 'center', gap: 16 }}>
        <p className="eyebrow">{t('Something went wrong')}</p>
        <h1 className="display-m">{t('We could not load this page.')}</h1>
        <p className="muted">{t('Check your connection and try again. If it keeps happening, contact us.')}</p>
        <button className="btn" onClick={() => reset()}>{t('Try again')}</button>
      </div>
    </div>
  );
}
