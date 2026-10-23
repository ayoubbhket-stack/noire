'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useStore } from './StoreProvider';
import { CloseIcon, FilterIcon, GridIcon, ListIcon, SearchIcon } from './Icons';

const SORTS = [['featured', 'Featured'], ['newest', 'Newest arrivals'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['lasting', 'Longest lasting']];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export default function ShopControls({ params, categories, collections, facets, counts, total, view, children }) {
  const router = useRouter();
  const path = usePathname();
  const { t, lab, fmt } = useStore();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.q || '');
  const [min, setMin] = useState(params.min || '');
  const [max, setMax] = useState(params.max || '');
  useEffect(() => { setQ(params.q || ''); setMin(params.min || ''); setMax(params.max || ''); }, [params.q, params.min, params.max]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const go = (patch) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    for (const [k, v] of Object.entries(patch)) { if (v == null || v === '') next.delete(k); else next.set(k, v); }
    if (!('page' in patch)) next.delete('page');
    start(() => router.replace(`${path}${next.toString() ? `?${next}` : ''}`, { scroll: false }));
  };
  const list = (k) => (params[k] ? String(params[k]).split(',') : []);
  const toggle = (k, v) => { const cur = list(k); go({ [k]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(',') }); };

  useEffect(() => {
    if ((params.q || '') === q) return undefined;
    const tm = setTimeout(() => go({ q: q.trim() }), 350);
    return () => clearTimeout(tm);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = [];
  const nameOf = (arr, s) => arr.find((x) => x.slug === s)?.name || s;
  list('category').forEach((v) => active.push(['category', v, nameOf(categories, v)]));
  list('collection').forEach((v) => active.push(['collection', v, nameOf(collections, v)]));
  list('brand').forEach((v) => active.push(['brand', v, v]));
  list('gender').forEach((v) => active.push(['gender', v, lab('gender', v)]));
  list('family').forEach((v) => active.push(['family', v, lab('family', v)]));
  list('conc').forEach((v) => active.push(['conc', v, lab('concShort', v)]));
  list('season').forEach((v) => active.push(['season', v, lab('season', v)]));
  if (params.min) active.push(['min', null, `${t('From')} ${fmt(params.min * 100)}`]);
  if (params.max) active.push(['max', null, `${t('Up to')} ${fmt(params.max * 100)}`]);
  if (params.stock) active.push(['stock', null, params.stock === 'in' ? t('In stock') : t('Sold out')]);
  if (params.sale) active.push(['sale', null, t('On sale')]);
  if (params.q) active.push(['q', null, `“${params.q}”`]);

  const Check = ({ k, v, label, count }) => (
    <label className="check"><input type="checkbox" checked={list(k).includes(v)} onChange={() => toggle(k, v)} />
      <span>{label}</span>{count != null && <span className="count num">{count}</span>}
    </label>
  );

  return (
    <div className="shop-layout" aria-busy={pending}>
      <aside className={`filters${open ? ' open' : ''}`} aria-label={t('Filters')}>
        <div className="mobile-head"><span className="display-s">{t('Filters')}</span><button className="icon-btn" aria-label={t('Close')} onClick={() => setOpen(false)}><CloseIcon /></button></div>
        <div className="search-field">
          <label htmlFor="shop-q" className="sr-only">{t('Search')}</label>
          <SearchIcon />
          <input id="shop-q" className="input" placeholder={t('Search perfumes, brands, notes')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <details open><summary>{t('For')}</summary><div className="filter-opts">{facets.genders.map((g) => <Check key={g} k="gender" v={g} label={lab('gender', g)} count={counts.gender[g]} />)}</div></details>
        <details open><summary>{t('Brand')}</summary><div className="filter-opts">{facets.brands.map((b) => <Check key={b} k="brand" v={b} label={b} count={counts.brand[b]} />)}</div></details>
        <details open><summary>{t('Scent family')}</summary><div className="filter-opts">{facets.families.map((f) => <Check key={f} k="family" v={f} label={lab('family', f)} count={counts.family[f]} />)}</div></details>
        <details><summary>{t('Concentration')}</summary><div className="filter-opts">{facets.concentrations.map((c) => <Check key={c} k="conc" v={c} label={lab('concentration', c)} />)}</div></details>
        <details><summary>{t('Season')}</summary><div className="filter-opts">{SEASONS.map((s) => <Check key={s} k="season" v={s} label={lab('season', s)} />)}</div></details>
        <details><summary>{t('Category')}</summary><div className="filter-opts">{categories.map((c) => <Check key={c.slug} k="category" v={c.slug} label={c.name} count={counts.category[c.slug]} />)}</div></details>
        <details><summary>{t('Collection')}</summary><div className="filter-opts">{collections.map((c) => <Check key={c.slug} k="collection" v={c.slug} label={c.name} />)}</div></details>
        <details open><summary>{t('Price')}</summary>
          <form className="price-range" onSubmit={(e) => { e.preventDefault(); go({ min, max }); }}>
            <div className="field"><label htmlFor="pmin">{t('Min')}</label><input id="pmin" className="input" inputMode="numeric" placeholder={String(facets.priceMin)} value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} /></div>
            <div className="field"><label htmlFor="pmax">{t('Max')}</label><input id="pmax" className="input" inputMode="numeric" placeholder={String(facets.priceMax)} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} /></div>
            <button className="btn small ghost" style={{ gridColumn: '1 / -1' }}>{t('Apply price')}</button>
          </form>
        </details>
        <details><summary>{t('Availability')}</summary><div className="filter-opts">
          <label className="check"><input type="radio" name="stock" checked={!params.stock} onChange={() => go({ stock: '' })} /> <span>{t('All')}</span></label>
          <label className="check"><input type="radio" name="stock" checked={params.stock === 'in'} onChange={() => go({ stock: 'in' })} /> <span>{t('In stock')}</span></label>
          <label className="check"><input type="checkbox" checked={params.sale === '1'} onChange={() => go({ sale: params.sale === '1' ? '' : '1' })} /> <span>{t('On sale')}</span></label>
        </div></details>
        <div className="apply-bar"><button className="btn ghost" style={{ flex: 1 }} onClick={() => { router.replace(path); setOpen(false); }}>{t('Clear')}</button><button className="btn" style={{ flex: 2 }} onClick={() => setOpen(false)}>{t('Show {n} results', { n: total })}</button></div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <div className="toolbar">
          <div className="left">
            <button className="btn small ghost filters-toggle" onClick={() => setOpen(true)}><FilterIcon /> {t('Filters')}{active.length ? ` (${active.length})` : ''}</button>
            <span className="muted small num" aria-live="polite">{pending ? t('Updating…') : t('{n} perfumes', { n: total })}</span>
          </div>
          <div className="right">
            <label htmlFor="sort" className="sr-only">{t('Sort')}</label>
            <select id="sort" className="select compact" value={params.sort || 'featured'} onChange={(e) => go({ sort: e.target.value })}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
            </select>
            <div className="seg" role="group" aria-label={t('Layout')}>
              <button aria-pressed={view === 'grid'} aria-label={t('Grid view')} onClick={() => go({ view: '' })}><GridIcon /></button>
              <button aria-pressed={view === 'list'} aria-label={t('List view')} onClick={() => go({ view: 'list' })}><ListIcon /></button>
            </div>
          </div>
        </div>
        {active.length > 0 && (
          <div className="active-filters" aria-label={t('Active filters')}>
            {active.map(([k, v, l]) => (
              <button key={k + v} className="chip on" onClick={() => (v ? toggle(k, v) : go({ [k]: '' }))}>{l} <span aria-hidden="true">×</span></button>
            ))}
            <button className="chip" onClick={() => router.replace(path, { scroll: false })}>{t('Clear all')}</button>
          </div>
        )}
        <div style={{ opacity: pending ? 0.5 : 1, transition: 'opacity .2s' }}>{children}</div>
      </div>
    </div>
  );
}
