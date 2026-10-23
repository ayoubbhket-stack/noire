'use client';
// "Find your scent" quiz: four questions, then products ranked by how well
// their gender, family, season and strength match the answers.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { FamilyGlyph } from './Icons';
import { useStore } from './StoreProvider';

const Q = [
  { key: 'for', title: 'Who is it for?', opts: [['women', 'For her'], ['men', 'For him'], ['any', 'For anyone']] },
  { key: 'mood', title: 'How do you want to smell?', opts: [['fresh', 'Fresh and clean', 'fresh'], ['floral', 'Soft and floral', 'floral'], ['warm', 'Warm and sweet', 'gourmand'], ['deep', 'Deep and woody', 'woody'], ['oud', 'Oud and oriental', 'oriental']] },
  { key: 'when', title: 'When will you wear it most?', opts: [['day', 'Every day, work'], ['night', 'Evenings and occasions'], ['summer', 'Hot summer days'], ['winter', 'Cold winter nights']] },
  { key: 'strength', title: 'How strong do you like it?', opts: [['soft', 'Close to the skin'], ['medium', 'Noticed when people come close'], ['loud', 'Fills the room']] },
];

const MOOD = {
  fresh: ['fresh', 'citrus', 'aquatic', 'green'],
  floral: ['floral', 'powdery', 'fruity'],
  warm: ['gourmand', 'oriental', 'musky'],
  deep: ['woody', 'leather', 'spicy'],
  oud: ['oriental', 'woody', 'spicy', 'leather'],
};

function score(p, a) {
  let s = 0;
  if (a.for === 'any' || !a.for) s += p.gender === 'unisex' ? 2 : 1;
  else if (p.gender === a.for) s += 4; else if (p.gender === 'unisex') s += 2.5; else s -= 6;
  const fams = MOOD[a.mood] || [];
  const fi = fams.indexOf(p.family);
  if (fi === 0) s += 5; else if (fi > 0) s += 3.5 - fi * 0.4;
  if (a.when === 'summer' && p.seasons.some((x) => x === 'summer' || x === 'spring')) s += 2;
  if (a.when === 'winter' && p.seasons.some((x) => x === 'winter' || x === 'autumn')) s += 2;
  if (a.when === 'day' && p.sillage <= 3) s += 1.5;
  if (a.when === 'night' && p.sillage >= 4) s += 1.5;
  const want = { soft: 2, medium: 3, loud: 5 }[a.strength];
  if (want) s -= Math.abs(p.sillage - want) * 0.8;
  if (!p.inStock) s -= 3;
  return s;
}

export default function Finder({ products }) {
  const { t } = useStore();
  const [step, setStep] = useState(0);
  const [a, setA] = useState({});
  const done = step >= Q.length;
  const results = useMemo(() => (done ? [...products].map((p) => [score(p, a), p]).sort((x, y) => y[0] - x[0]).slice(0, 4).map(([, p]) => p) : []), [done, products, a]);
  const q = Q[step];

  if (done) {
    return (
      <div className="finder-results">
        <div className="spread center-y" style={{ marginBottom: 28 }}>
          <div><p className="eyebrow">{t('Your matches')}</p><h2 className="display-l">{t('We think you will love these')}</h2></div>
          <button className="btn ghost" onClick={() => { setA({}); setStep(0); }}>{t('Start again')}</button>
        </div>
        <div className="product-grid">{results.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}</div>
        <p className="muted" style={{ marginTop: 28 }}>{t('Not sure yet? Message us and we will help you choose.')} <Link className="link" href="/contact">{t('Contact us')}</Link></p>
      </div>
    );
  }

  return (
    <div className="finder">
      <div className="finder-progress" aria-hidden="true">{Q.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <p className="eyebrow">{t('Question {n} of {total}', { n: step + 1, total: Q.length })}</p>
      <h2 className="display-l" key={q.key}>{t(q.title)}</h2>
      <div className={`finder-opts${q.key === 'mood' ? ' moods' : ''}`} role="radiogroup" aria-label={t(q.title)}>
        {q.opts.map(([v, l, fam]) => (
          <button key={v} role="radio" aria-checked={a[q.key] === v} className="finder-opt" onClick={() => { setA((x) => ({ ...x, [q.key]: v })); setTimeout(() => setStep((s) => s + 1), 180); }}>
            {fam && <FamilyGlyph family={fam} />}
            <span>{t(l)}</span>
          </button>
        ))}
      </div>
      {step > 0 && <button className="link small" style={{ marginTop: 24 }} onClick={() => setStep((s) => s - 1)}>{t('Back')}</button>}
    </div>
  );
}
