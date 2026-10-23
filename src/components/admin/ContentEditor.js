'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, F, SingleImage, Toggle, Dropzone, uploadFiles, useAdmin } from './ui';

import { BOTTLE_SHAPES, CAP_STYLES } from '@/lib/three/bottle';

const SECTION_NAMES = {
  brands: 'Brand names band', featured: 'Featured products', families: 'Shop by scent family', collections: 'Collection showcase',
  finder: '“Find your scent” quiz banner', campaign: 'Campaign imagery', bestsellers: 'Best sellers', newarrivals: 'New arrivals',
  trust: 'Trust badges (original, COD, returns…)', reviews: 'Customer reviews', newsletter: 'Newsletter signup',
};

export function useSaver(endpoint, key, initial) {
  const router = useRouter();
  const { toast } = useAdmin();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errs, setErrs] = useState({});
  const update = (fn) => { setV((x) => (typeof fn === 'function' ? fn(structuredClone(x)) : fn)); setDirty(true); };
  const save = async () => {
    setBusy(true); setErrs({});
    const r = await api('PUT', endpoint, { key, value: v });
    setBusy(false);
    if (r.ok) { toast('Saved and published'); setDirty(false); router.refresh(); } else { setErrs(r.fields); toast(`${r.error} ${Object.entries(r.fields)[0]?.join(': ') || ''}`, 'bad'); }
  };
  return { v, update, save, busy, dirty, errs };
}

export function SaveBar({ busy, dirty, save }) {
  return (
    <div className="saving-bar">
      {dirty && <span className="muted" style={{ fontSize: '.85rem' }}>Unsaved changes</span>}
      <button className="btn" onClick={save} disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save & publish'}</button>
    </div>
  );
}

function Repeater({ items, onChange, blank, render, addLabel = 'Add item' }) {
  const move = (i, d) => { const a = [...items]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <div className="repeater">
      {items.map((it, i) => (
        <div className="repeater-item" key={i}>
          {render(it, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
          <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
            <button type="button" className="btn small ghost" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" className="btn small ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button type="button" className="btn small danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn small ghost" style={{ justifySelf: 'start' }} onClick={() => onChange([...items, structuredClone(blank)])}>+ {addLabel}</button>
    </div>
  );
}

function MediaList({ ids, onChange, max = 4 }) {
  const { toast } = useAdmin();
  const [busy, setBusy] = useState(false);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="img-grid">{ids.map((id, i) => (
        <div className="img-tile" key={id}><img src={`/api/media/${id}`} alt="" /><div className="bar">
          <button type="button" disabled={i === 0} onClick={() => { const a = [...ids]; [a[i], a[i - 1]] = [a[i - 1], a[i]]; onChange(a); }}>←</button>
          <button type="button" onClick={() => onChange(ids.filter((x) => x !== id))}>✕</button>
        </div></div>
      ))}</div>
      {ids.length < max && <Dropzone busy={busy} onFiles={async (files) => { setBusy(true); try { const ms = await uploadFiles(files.slice(0, max - ids.length)); onChange([...ids, ...ms.map((m) => m.id)]); } catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); } }} />}
    </div>
  );
}

export default function ContentEditor({ tab, initial, products }) {
  const s = useSaver('/api/admin/content', tab, initial);
  const { v, update } = s;
  const input = (path, label, opts = {}) => {
    const get = path.split('.').reduce((o, k) => o?.[k], v) ?? '';
    const setter = (val) => update((x) => { const ks = path.split('.'); let o = x; ks.slice(0, -1).forEach((k) => { o = o[k]; }); o[ks.at(-1)] = val; return x; });
    const id = `c-${path}`;
    return <F id={id} label={label} hint={opts.hint} full={opts.full} err={s.errs[path]}>{opts.area ? <textarea id={id} className="textarea" style={{ minHeight: opts.rows || 96 }} value={get} onChange={(e) => setter(e.target.value)} /> : <input id={id} className="input" value={get} onChange={(e) => setter(e.target.value)} />}</F>;
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {tab === 'home' && (
        <>
          <section className="panel"><div className="ph"><h2>Announcement bar</h2><Toggle id="ann" label="Show" checked={v.announcement.enabled} onChange={(x) => update((d) => { d.announcement.enabled = x; return d; })} /></div>
            <div className="pb form-grid">{input('announcement.text', 'Text')}{input('announcement.href', 'Link', { hint: 'e.g. /shop?collection=gifts' })}</div></section>
          <section className="panel"><div className="ph"><h2>Hero</h2></div><div className="pb form-grid">
            {input('hero.eyebrow', 'Small label above headline')}{input('hero.headline', 'Headline')}
            {input('hero.text', 'Supporting text', { area: true, full: true })}
            {input('hero.primaryLabel', 'Primary button label')}{input('hero.primaryHref', 'Primary button link')}
            {input('hero.secondaryLabel', 'Secondary button label')}{input('hero.secondaryHref', 'Secondary button link')}
            <F id="h-shape" label="3D bottle shape"><select id="h-shape" className="select" value={v.hero.bottle?.shape || 'classic'} onChange={(e) => update((d) => { d.hero.bottle = { ...d.hero.bottle, shape: e.target.value }; return d; })}>{BOTTLE_SHAPES.map((x) => <option key={x}>{x}</option>)}</select></F>
            <F id="h-cap" label="Cap style"><select id="h-cap" className="select" value={v.hero.bottle?.cap || 'cube'} onChange={(e) => update((d) => { d.hero.bottle = { ...d.hero.bottle, cap: e.target.value }; return d; })}>{CAP_STYLES.map((x) => <option key={x}>{x}</option>)}</select></F>
            <div className="row" style={{ gap: 16 }}>
              <F id="h-li" label="Perfume colour"><input id="h-li" type="color" className="hex" style={{ width: 60, height: 40 }} value={v.hero.bottle?.liquidHex || '#e2a35c'} onChange={(e) => update((d) => { d.hero.bottle = { ...d.hero.bottle, liquidHex: e.target.value }; return d; })} /></F>
              <F id="h-ca" label="Cap colour"><input id="h-ca" type="color" className="hex" style={{ width: 60, height: 40 }} value={v.hero.bottle?.capHex || '#c9a45c'} onChange={(e) => update((d) => { d.hero.bottle = { ...d.hero.bottle, capHex: e.target.value }; return d; })} /></F>
            </div>
            <div className="full"><SingleImage label="Hero poster image (shown while the 3D model loads and on devices without WebGL)" value={v.hero.imageMediaId} onChange={(id) => update((d) => { d.hero.imageMediaId = id; return d; })} /></div>
          </div></section>
          <section className="panel"><div className="ph"><h2>Homepage sections</h2><span className="label">Reorder, hide and edit copy</span></div><div className="pb stack" style={{ gap: 10 }}>
            {v.sections.map((sec, i) => (
              <details key={sec.key} className="repeater-item">
                <summary style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', listStyle: 'none' }}>
                  <span className="mono muted">{String(i + 1).padStart(2, '0')}</span><strong style={{ flex: 1 }}>{SECTION_NAMES[sec.key] || sec.key}</strong>
                  <span className={`pill ${sec.enabled ? 'published' : 'draft'}`}>{sec.enabled ? 'shown' : 'hidden'}</span>
                  <button type="button" className="btn small ghost" disabled={i === 0} onClick={(e) => { e.preventDefault(); update((d) => { [d.sections[i], d.sections[i - 1]] = [d.sections[i - 1], d.sections[i]]; return d; }); }}>↑</button>
                  <button type="button" className="btn small ghost" disabled={i === v.sections.length - 1} onClick={(e) => { e.preventDefault(); update((d) => { [d.sections[i], d.sections[i + 1]] = [d.sections[i + 1], d.sections[i]]; return d; }); }}>↓</button>
                </summary>
                <div className="form-grid" style={{ marginTop: 12 }}>
                  <div className="full"><Toggle id={`se${i}`} label="Show this section" checked={sec.enabled} onChange={(x) => update((d) => { d.sections[i].enabled = x; return d; })} /></div>
                  {input(`sections.${i}.title`, 'Title')}{input(`sections.${i}.text`, 'Text', { area: true, rows: 70 })}
                  {sec.key === 'finder' && <>{input(`sections.${i}.label`, 'Button label')}{input(`sections.${i}.href`, 'Button link')}</>}
                  {sec.key === 'campaign' && <div className="full"><span className="label">Campaign images (2 recommended: tall, then wide)</span><MediaList ids={v.campaignImages || []} onChange={(ids) => update((d) => { d.campaignImages = ids; return d; })} /></div>}
                  {sec.key === 'featured' && <PickProducts label="Featured products (leave empty to use products marked “featured”)" value={v.featuredProductSlugs} products={products} onChange={(x) => update((d) => { d.featuredProductSlugs = x; return d; })} />}
                  {sec.key === 'bestsellers' && <PickProducts label="Best sellers (leave empty to rank automatically by units sold)" value={v.bestsellerSlugs} products={products} onChange={(x) => update((d) => { d.bestsellerSlugs = x; return d; })} />}
                </div>
              </details>
            ))}
          </div></section>
        </>
      )}
      {tab === 'about' && (
        <>
          <section className="panel"><div className="ph"><h2>Story</h2></div><div className="pb form-grid">
            {input('headline', 'Headline', { full: true })}{input('intro', 'Introduction', { area: true, full: true })}
            {input('story', 'The story behind the store', { area: true, full: true, rows: 140 })}{input('philosophy', 'How you choose what to sell', { area: true, full: true, rows: 140 })}
          </div></section>
          <section className="panel"><div className="ph"><h2>Editorial photography</h2></div><div className="pb"><MediaList ids={v.images || []} max={3} onChange={(ids) => update((d) => { d.images = ids; return d; })} /><p className="muted" style={{ fontSize: '.8rem' }}>First image is the wide hero; the next two appear in the editorial spread.</p></div></section>
          <section className="panel"><div className="ph"><h2>Process steps</h2></div><div className="pb"><Repeater items={v.process} blank={{ title: '', text: '' }} addLabel="Add step" onChange={(a) => update((d) => { d.process = a; return d; })}
            render={(it, set) => <div className="form-grid"><F label="Title"><input className="input" value={it.title} onChange={(e) => set({ title: e.target.value })} /></F><F label="Text"><textarea className="textarea" style={{ minHeight: 60 }} value={it.text} onChange={(e) => set({ text: e.target.value })} /></F></div>} /></div></section>
          <section className="panel"><div className="ph"><h2>Timeline</h2></div><div className="pb"><Repeater items={v.timeline} blank={{ year: '', title: '', text: '' }} addLabel="Add milestone" onChange={(a) => update((d) => { d.timeline = a; return d; })}
            render={(it, set) => <div className="form-grid-3"><F label="Year / label"><input className="input" value={it.year} onChange={(e) => set({ year: e.target.value })} /></F><F label="Title"><input className="input" value={it.title} onChange={(e) => set({ title: e.target.value })} /></F><F label="Text"><input className="input" value={it.text} onChange={(e) => set({ text: e.target.value })} /></F></div>} /></div></section>
          <section className="panel"><div className="ph"><h2>What makes it different</h2></div><div className="pb"><Repeater items={v.difference} blank={{ title: '', text: '' }} onChange={(a) => update((d) => { d.difference = a; return d; })}
            render={(it, set) => <div className="form-grid"><F label="Title"><input className="input" value={it.title} onChange={(e) => set({ title: e.target.value })} /></F><F label="Text"><textarea className="textarea" style={{ minHeight: 60 }} value={it.text} onChange={(e) => set({ text: e.target.value })} /></F></div>} /></div></section>
          <section className="panel"><div className="ph"><h2>Values (scrolling band)</h2></div><div className="pb"><F id="vals" label="Comma-separated" hint="e.g. Authenticity, Care, Honest pricing"><input id="vals" className="input" value={v.values.join(', ')} onChange={(e) => update((d) => { d.values = e.target.value.split(',').map((x) => x.trim()).filter(Boolean); return d; })} /></F></div></section>
        </>
      )}
      {tab === 'contact' && (
        <>
          <section className="panel"><div className="ph"><h2>Contact page intro</h2><a className="link label" href="/admin/settings">Phone, email, address &amp; social links are in Store settings →</a></div><div className="pb">{input('intro', 'Intro text', { area: true })}</div></section>
          <section className="panel"><div className="ph"><h2>Frequently asked questions</h2><span className="label">Grouped by the “group” field</span></div><div className="pb"><Repeater items={v.faqs} blank={{ group: 'Orders', q: '', a: '' }} addLabel="Add question" onChange={(a) => update((d) => { d.faqs = a; return d; })}
            render={(it, set) => <div className="form-grid"><F label="Group"><input className="input" value={it.group} onChange={(e) => set({ group: e.target.value })} placeholder="Orders, Shipping, Returns…" /></F><F label="Question"><input className="input" value={it.q} onChange={(e) => set({ q: e.target.value })} /></F><F label="Answer" full><textarea className="textarea" style={{ minHeight: 70 }} value={it.a} onChange={(e) => set({ a: e.target.value })} /></F></div>} /></div></section>
        </>
      )}
      {tab === 'policies' && (
        <section className="panel"><div className="ph"><h2>Policies</h2><span className="label">Separate paragraphs with a blank line</span></div><div className="pb form-grid">
          {input('shipping', 'Shipping policy', { area: true, full: true, rows: 160 })}{input('returns', 'Returns policy', { area: true, full: true, rows: 160 })}
          {input('privacy', 'Privacy policy', { area: true, full: true, rows: 200 })}{input('terms', 'Terms & conditions', { area: true, full: true, rows: 200 })}
        </div></section>
      )}
      {tab === 'footer' && (
        <section className="panel"><div className="ph"><h2>Footer &amp; newsletter</h2></div><div className="pb form-grid">
          {input('about', 'Short brand description', { area: true, full: true })}{input('newsletterTitle', 'Newsletter title')}{input('newsletterText', 'Newsletter text')}{input('copyright', 'Copyright line', { full: true })}
        </div></section>
      )}
      <SaveBar {...s} />
    </div>
  );
}

function PickProducts({ label, value = [], products, onChange }) {
  return (
    <div className="full stack" style={{ gap: 6 }}>
      <span className="label" style={{ fontSize: '.64rem' }}>{label}</span>
      <div className="row" style={{ gap: 6 }}>
        {value.map((sl) => <button type="button" key={sl} className="chip on" onClick={() => onChange(value.filter((x) => x !== sl))}>{products.find((p) => p.slug === sl)?.name || sl} ×</button>)}
        <select className="select" style={{ maxWidth: 240, minHeight: 34 }} value="" aria-label="Add product" onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
          <option value="">+ Add product</option>{products.filter((p) => !value.includes(p.slug)).map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>
    </div>
  );
}

// ---- Arabic translations -------------------------------------------------
// Lists every text field of the English content with an Arabic box next to it.
// Empty Arabic boxes fall back to English on the storefront.
const SKIP = /(href|Href|MediaId|^key$|productSlug|Slugs|Images|images|bottle|enabled|currency|email|phone|whatsapp|mapUrl|social|name$)/;

function textPaths(obj, base = []) {
  if (typeof obj === 'string') return [base];
  if (Array.isArray(obj)) return obj.flatMap((x, i) => textPaths(x, [...base, i]));
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, x]) => (SKIP.test(k) ? [] : textPaths(x, [...base, k])));
  return [];
}
const getAt = (o, p) => p.reduce((x, k) => (x == null ? undefined : x[k]), o);
function setAt(o, p, val) {
  let x = o;
  p.slice(0, -1).forEach((k, i) => { if (x[k] == null) x[k] = typeof p[i + 1] === 'number' ? [] : {}; x = x[k]; });
  x[p.at(-1)] = val;
}

/** Reorder keyed arrays (homepage sections) in the overlay to match English. */
function align(en, ar) {
  if (Array.isArray(en)) {
    const arr = Array.isArray(ar) ? ar : [];
    const byKey = new Map(arr.filter((o) => o?.key).map((o) => [o.key, o]));
    return en.map((e, i) => {
      const o = e?.key ? (byKey.get(e.key) || (arr[i] && !arr[i].key ? arr[i] : {})) : arr[i];
      const out = align(e, o);
      return e?.key ? { ...out, key: e.key } : out;
    });
  }
  if (en && typeof en === 'object') {
    const out = {};
    for (const k of Object.keys(en)) { const x = align(en[k], ar?.[k]); if (x !== undefined) out[k] = x; }
    return out;
  }
  return typeof ar === 'string' ? ar : undefined;
}

export function TranslationEditor({ tab, english, initial }) {
  const s = useSaver('/api/admin/content', `${tab}_ar`, align(english, initial || {}));
  const paths = textPaths(english);
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section className="panel"><div className="ph"><h2>Arabic text</h2><span className="label">Leave a box empty to show the English text</span></div>
        <div className="pb stack" style={{ gap: 14 }}>
          {paths.length === 0 && <p className="muted">Nothing to translate here.</p>}
          {paths.map((p) => {
            const en = getAt(english, p) || '';
            const id = `ar-${p.join('-')}`;
            const long = en.length > 90;
            const val = getAt(s.v, p) || '';
            const set = (e) => s.update((d) => { setAt(d, p, e.target.value); return d; });
            return (
              <div key={id} className="tr-row">
                <label htmlFor={id} className="label">{p.join(' › ')}</label>
                <p className="muted" style={{ margin: '4px 0 6px', fontSize: '.85rem', whiteSpace: 'pre-wrap' }}>{en}</p>
                {long ? <textarea id={id} dir="rtl" lang="ar" className="textarea" style={{ minHeight: Math.min(260, 60 + en.length / 3) }} value={val} onChange={set} />
                  : <input id={id} dir="rtl" lang="ar" className="input" value={val} onChange={set} />}
              </div>
            );
          })}
        </div>
      </section>
      <SaveBar {...s} />
    </div>
  );
}
