'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, Dropzone, F, Toggle, uploadFiles, useAdmin } from './ui';
import { BOTTLE_SHAPES, CAP_STYLES } from '@/lib/three/bottle';
import { CONCENTRATIONS, FAMILIES, GENDERS, SEASONS } from '@/lib/perfume';
import { label } from '@/lib/i18n';

const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const EMPTY = {
  name: '', nameAr: '', brand: '', slug: '', sku: '', description: '', descriptionAr: '', categoryId: null, collectionIds: [],
  gender: 'unisex', family: 'woody', concentration: 'edp',
  specs: { top: '', heart: '', base: '', topAr: '', heartAr: '', baseAr: '', longevity: 3, sillage: 3, seasons: [] },
  bottleStyle: { shape: 'classic', cap: 'cube', liquidHex: '#e2a35c', capHex: '#c9a45c', capMetal: true },
  modelMediaId: null, status: 'draft', featured: false, newArrival: true, seoTitle: '', seoDescription: '', images: [],
  variants: [{ sku: '', volume: 50, price: '', salePrice: '', costPrice: '', stock: 0, active: true }, { sku: '', volume: 100, price: '', salePrice: '', costPrice: '', stock: 0, active: true }],
};

function Scale({ id, labelText, value, onChange, words }) {
  return (
    <F id={id} label={`${labelText}: ${words[value - 1]}`}>
      <div className="row" style={{ gap: 6 }} role="radiogroup" aria-label={labelText}>
        {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} className={`btn small${value === n ? '' : ' ghost'}`} style={{ minWidth: 40 }} onClick={() => onChange(n)}>{n}</button>)}
      </div>
    </F>
  );
}

export default function ProductEditor({ initial, categories, collections, readOnly, sold = 0 }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [d, setD] = useState(initial || EMPTY);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const isNew = !d.id;
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const setSpec = (k, v) => setD((x) => ({ ...x, specs: { ...x.specs, [k]: v } }));
  const setBottle = (k, v) => setD((x) => ({ ...x, bottleStyle: { ...x.bottleStyle, [k]: v } }));
  const err = (k) => errs[k];

  const save = async (statusOverride) => {
    setBusy(true); setErrs({});
    const body = {
      ...d, status: statusOverride || d.status,
      variants: d.variants.map((v) => ({
        ...v, salePrice: v.salePrice === '' ? null : v.salePrice, costPrice: v.costPrice === '' ? null : v.costPrice,
        sku: v.sku || `${d.sku}-${v.volume}`.toUpperCase().replace(/\s+/g, ''),
      })),
    };
    const r = await api(isNew ? 'POST' : 'PUT', isNew ? '/api/admin/products' : `/api/admin/products/${d.id}`, body);
    setBusy(false);
    if (r.ok) {
      toast(isNew ? 'Product created' : `Saved${statusOverride ? ` · ${statusOverride}` : ''}`);
      if (statusOverride) set('status', statusOverride);
      if (isNew) router.replace(`/admin/products/${r.data.id}`); else router.refresh();
    } else { setErrs(r.fields); toast(r.error + (Object.keys(r.fields).length ? ` (${Object.values(r.fields)[0]})` : ''), 'bad'); }
  };

  const addImages = async (files) => {
    setUp(true);
    try {
      const ms = await uploadFiles(files);
      set('images', [...d.images, ...ms.map((m) => ({ mediaId: m.id, alt: `${d.brand} ${d.name}`.trim() }))]);
      toast(`${ms.length} image${ms.length > 1 ? 's' : ''} uploaded`);
    } catch (e) { toast(e.message, 'bad'); } finally { setUp(false); }
  };
  const moveImg = (i, dir) => { const a = [...d.images]; const j = i + dir; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set('images', a); };
  const setVar = (i, k, v) => set('variants', d.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const num = (v) => v.replace(/[^\d.]/g, '');
  const vErr = (i, k) => errs[`variants.${i}.${k}`] && <span className="err" style={{ color: 'var(--bad)', fontSize: '.75rem', display: 'block' }}>{errs[`variants.${i}.${k}`]}</span>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
      <fieldset disabled={readOnly || busy} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 20 }}>
        <div className="adm-head">
          <div>
            <Link href="/admin/products" className="link label">← Products</Link>
            <h1 style={{ marginTop: 8 }}>{isNew ? 'New perfume' : `${d.brand} ${d.name}`.trim() || 'Product'}</h1>
            <p className="sub">{isNew ? 'Saved as draft until you publish.' : <>Status <span className={`pill ${d.status}`}>{d.status}</span> · {sold} units sold all-time</>}</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {!isNew && <a className="btn ghost small" href={`/product/${d.slug}${d.status !== 'published' ? '?preview=1' : ''}`} target="_blank" rel="noreferrer">{d.status === 'published' ? 'View on store ↗' : 'Preview ↗'}</a>}
            {!isNew && !readOnly && (
              <button type="button" className="btn small danger" onClick={async () => {
                if (!(await confirm({ title: 'Delete this product?', body: sold ? 'It has orders, so it will be archived (hidden from the store) instead of deleted.' : 'This permanently removes the product, its sizes and images.', danger: true, confirmLabel: sold ? 'Archive' : 'Delete' }))) return;
                const r = await api('DELETE', `/api/admin/products/${d.id}`);
                if (r.ok) { toast(r.data.archived ? 'Product archived' : 'Product deleted'); router.replace('/admin/products'); router.refresh(); } else toast(r.error, 'bad');
              }}>{sold ? 'Archive' : 'Delete'}</button>
            )}
          </div>
        </div>
        {readOnly && <div className="notice">Your role can view products but not edit them.</div>}

        <div className="grid-2">
          <div style={{ display: 'grid', gap: 20 }}>
            <section className="panel"><div className="ph"><h2>Details</h2></div><div className="pb form-grid">
              <F id="p-brand" label="Brand" err={err('brand')}><input id="p-brand" className="input" value={d.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Maison Ambre" /></F>
              <F id="p-sku" label="SKU" err={err('sku')}><input id="p-sku" className="input mono" value={d.sku} onChange={(e) => set('sku', e.target.value.toUpperCase())} placeholder="NR-XXX" /></F>
              <F id="p-name" label="Name (English)" err={err('name')}><input id="p-name" className="input" value={d.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} /></F>
              <F id="p-name-ar" label="Name (Arabic)" err={err('nameAr')} hint="Leave empty to show the English name"><input id="p-name-ar" dir="rtl" lang="ar" className="input" value={d.nameAr} onChange={(e) => set('nameAr', e.target.value)} /></F>
              <F id="p-slug" label="URL slug" err={err('slug')} hint={`/product/${d.slug || '…'}`} full><input id="p-slug" className="input mono" value={d.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></F>
              <F id="p-desc" label="Description (English)" err={err('description')} full><textarea id="p-desc" className="textarea" value={d.description} onChange={(e) => set('description', e.target.value)} /></F>
              <F id="p-desc-ar" label="Description (Arabic)" err={err('descriptionAr')} full><textarea id="p-desc-ar" dir="rtl" lang="ar" className="textarea" value={d.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} /></F>
              <F id="p-gender" label="For"><select id="p-gender" className="select" value={d.gender} onChange={(e) => set('gender', e.target.value)}>{GENDERS.map((g) => <option key={g} value={g}>{label('gender', g, 'en')}</option>)}</select></F>
              <F id="p-family" label="Scent family"><select id="p-family" className="select" value={d.family} onChange={(e) => set('family', e.target.value)}>{FAMILIES.map((f) => <option key={f} value={f}>{label('family', f, 'en')}</option>)}</select></F>
              <F id="p-conc" label="Concentration"><select id="p-conc" className="select" value={d.concentration} onChange={(e) => set('concentration', e.target.value)}>{CONCENTRATIONS.map((c) => <option key={c} value={c}>{label('concentration', c, 'en')}</option>)}</select></F>
            </div></section>

            <section className="panel"><div className="ph"><h2>Sizes, prices &amp; stock</h2><button type="button" className="btn small ghost" onClick={() => set('variants', [...d.variants, { sku: '', volume: '', price: '', salePrice: '', costPrice: '', stock: 0, active: true }])}>+ Add size</button></div>
              <div className="pb flush tbl-wrap">
                <table className="tbl variant-tbl">
                  <thead><tr><th>Size (ml)</th><th>Price (EGP)</th><th>Sale price</th><th>Cost</th><th>SKU</th><th className="r">Stock</th><th>Active</th><th></th></tr></thead>
                  <tbody>{d.variants.map((v, i) => (
                    <tr key={v.id || `n${i}`}>
                      <td><input className="input mono" aria-label="Size in ml" inputMode="numeric" value={v.volume} onChange={(e) => setVar(i, 'volume', e.target.value.replace(/\D/g, ''))} style={{ width: 80 }} />{vErr(i, 'volume')}</td>
                      <td><input className="input mono" aria-label="Price" inputMode="decimal" value={v.price} onChange={(e) => setVar(i, 'price', num(e.target.value))} style={{ width: 100 }} />{vErr(i, 'price')}</td>
                      <td><input className="input mono" aria-label="Sale price" inputMode="decimal" value={v.salePrice ?? ''} placeholder="—" onChange={(e) => setVar(i, 'salePrice', num(e.target.value))} style={{ width: 100 }} />{vErr(i, 'salePrice')}</td>
                      <td><input className="input mono" aria-label="Cost per unit" inputMode="decimal" value={v.costPrice ?? ''} placeholder="—" onChange={(e) => setVar(i, 'costPrice', num(e.target.value))} style={{ width: 90 }} /></td>
                      <td><input className="input mono" aria-label="Size SKU" value={v.sku} placeholder="auto" onChange={(e) => setVar(i, 'sku', e.target.value.toUpperCase())} style={{ minWidth: 120 }} />{vErr(i, 'sku')}</td>
                      <td className="r"><input className="input mono" aria-label="Stock" inputMode="numeric" value={v.stock} onChange={(e) => setVar(i, 'stock', e.target.value.replace(/\D/g, '') === '' ? '' : Number(e.target.value.replace(/\D/g, '')))} style={{ width: 70, textAlign: 'end' }} /></td>
                      <td><Toggle id={`va${i}`} label="" checked={v.active} onChange={(x) => setVar(i, 'active', x)} /></td>
                      <td><button type="button" className="icon-btn" aria-label="Remove size" disabled={d.variants.length === 1} onClick={() => set('variants', d.variants.filter((_, j) => j !== i))}>✕</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {err('variants') && <div className="notice bad" style={{ margin: 12 }}>{err('variants')}</div>}
                <p className="muted" style={{ fontSize: '.8rem', padding: '0 14px 12px', margin: 0 }}>Each size has its own price and stock. The store shows “from” the cheapest size. Cost is private and used for profit reports. Stock edits are recorded in the inventory history.</p>
              </div>
            </section>

            <section className="panel"><div className="ph"><h2>Fragrance notes</h2><span className="label">Separate notes with commas</span></div><div className="pb form-grid">
              <F id="n-top" label="Top notes (English)"><input id="n-top" className="input" value={d.specs.top} onChange={(e) => setSpec('top', e.target.value)} placeholder="Bergamot, Pink pepper" /></F>
              <F id="n-top-ar" label="Top notes (Arabic)"><input id="n-top-ar" dir="rtl" className="input" value={d.specs.topAr} onChange={(e) => setSpec('topAr', e.target.value)} placeholder="برجموت، فلفل وردي" /></F>
              <F id="n-heart" label="Heart notes (English)"><input id="n-heart" className="input" value={d.specs.heart} onChange={(e) => setSpec('heart', e.target.value)} /></F>
              <F id="n-heart-ar" label="Heart notes (Arabic)"><input id="n-heart-ar" dir="rtl" className="input" value={d.specs.heartAr} onChange={(e) => setSpec('heartAr', e.target.value)} /></F>
              <F id="n-base" label="Base notes (English)"><input id="n-base" className="input" value={d.specs.base} onChange={(e) => setSpec('base', e.target.value)} /></F>
              <F id="n-base-ar" label="Base notes (Arabic)"><input id="n-base-ar" dir="rtl" className="input" value={d.specs.baseAr} onChange={(e) => setSpec('baseAr', e.target.value)} /></F>
              <Scale id="n-long" labelText="Longevity" value={d.specs.longevity} onChange={(n) => setSpec('longevity', n)} words={['Very weak', 'Weak', 'Moderate', 'Long lasting', 'Very long lasting']} />
              <Scale id="n-sill" labelText="Sillage (projection)" value={d.specs.sillage} onChange={(n) => setSpec('sillage', n)} words={['Intimate', 'Soft', 'Moderate', 'Strong', 'Enormous']} />
              <div className="full stack" style={{ gap: 6 }}><span className="label" style={{ fontSize: '.64rem' }}>Best seasons</span>
                <div className="row" style={{ gap: 12 }}>{SEASONS.map((s) => <label key={s} className="check"><input type="checkbox" checked={d.specs.seasons.includes(s)} onChange={(e) => setSpec('seasons', e.target.checked ? [...d.specs.seasons, s] : d.specs.seasons.filter((x) => x !== s))} /> {cap(s)}</label>)}</div>
              </div>
            </div></section>

            <section className="panel"><div className="ph"><h2>Images</h2><span className="label">First image is the main photo</span></div><div className="pb stack" style={{ gap: 14 }}>
              {err('images') && <div className="notice bad">{err('images')}</div>}
              {d.images.length > 0 && (
                <div className="img-grid">
                  {d.images.map((im, i) => (
                    <div className="img-tile" key={im.mediaId + i}>
                      {i === 0 && <span className="tag first">Main</span>}
                      <img src={`/api/media/${im.mediaId}`} alt={im.alt} />
                      <input className="input" style={{ minHeight: 30, fontSize: '.75rem', borderRadius: 0, border: 0, borderTop: '1px solid var(--line)' }} aria-label="Alt text" placeholder="Alt text" value={im.alt} onChange={(e) => set('images', d.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                      <div className="bar">
                        <button type="button" aria-label="Move left" onClick={() => moveImg(i, -1)} disabled={i === 0}>←</button>
                        <button type="button" aria-label="Move right" onClick={() => moveImg(i, 1)} disabled={i === d.images.length - 1}>→</button>
                        <button type="button" aria-label="Remove image" onClick={() => set('images', d.images.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Dropzone onFiles={addImages} busy={up} />
              <p className="muted" style={{ margin: 0, fontSize: '.8rem' }}>Use photos you own or that the brand allows retailers to use. Square or 4:5 photos on a light background look best.</p>
            </div></section>

            <section className="panel"><div className="ph"><h2>Search engine listing</h2></div><div className="pb stack" style={{ gap: 12 }}>
              <F id="seo-t" label={`SEO title (${d.seoTitle.length}/70)`} err={err('seoTitle')}><input id="seo-t" className="input" value={d.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={`${d.brand} ${d.name}`} /></F>
              <F id="seo-d" label={`Meta description (${d.seoDescription.length}/170)`} err={err('seoDescription')}><textarea id="seo-d" className="textarea" style={{ minHeight: 70 }} value={d.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} placeholder={d.description.slice(0, 155)} /></F>
            </div></section>
          </div>

          <div style={{ display: 'grid', gap: 20, position: 'sticky', top: 80, alignContent: 'start' }}>
            <section className="panel"><div className="ph"><h2>Publishing</h2></div><div className="pb stack" style={{ gap: 14 }}>
              <F id="p-status" label="Status"><select id="p-status" className="select" value={d.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="archived">Archived</option></select></F>
              <Toggle id="p-feat" label="Featured on homepage" checked={d.featured} onChange={(v) => set('featured', v)} />
              <Toggle id="p-new" label="New arrival" checked={d.newArrival} onChange={(v) => set('newArrival', v)} />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" style={{ flex: 1 }}>{busy ? 'Saving…' : 'Save'}</button>
                {d.status !== 'published' && <button type="button" className="btn ghost" onClick={() => save('published')}>Save &amp; publish</button>}
              </div>
            </div></section>
            <section className="panel"><div className="ph"><h2>Organisation</h2></div><div className="pb stack" style={{ gap: 14 }}>
              <F id="p-cat" label="Category"><select id="p-cat" className="select" value={d.categoryId || ''} onChange={(e) => set('categoryId', e.target.value ? Number(e.target.value) : null)}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></F>
              <div className="stack" style={{ gap: 6 }}><span className="label" style={{ fontSize: '.64rem' }}>Collections</span>
                {collections.map((c) => <label key={c.id} className="check"><input type="checkbox" checked={d.collectionIds.includes(c.id)} onChange={(e) => set('collectionIds', e.target.checked ? [...d.collectionIds, c.id] : d.collectionIds.filter((x) => x !== c.id))} /> {c.name}</label>)}
              </div>
            </div></section>
            <section className="panel"><div className="ph"><h2>3D bottle</h2></div><div className="pb form-grid">
              <F id="b-shape" label="Bottle shape"><select id="b-shape" className="select" value={d.bottleStyle.shape} onChange={(e) => setBottle('shape', e.target.value)}>{BOTTLE_SHAPES.map((s) => <option key={s}>{s}</option>)}</select></F>
              <F id="b-cap" label="Cap style"><select id="b-cap" className="select" value={d.bottleStyle.cap} onChange={(e) => setBottle('cap', e.target.value)}>{CAP_STYLES.map((s) => <option key={s}>{s}</option>)}</select></F>
              <F id="b-liq" label="Perfume colour"><input id="b-liq" type="color" className="hex" style={{ width: 60, height: 40 }} value={d.bottleStyle.liquidHex} onChange={(e) => setBottle('liquidHex', e.target.value)} /></F>
              <F id="b-capc" label="Cap colour"><input id="b-capc" type="color" className="hex" style={{ width: 60, height: 40 }} value={d.bottleStyle.capHex} onChange={(e) => setBottle('capHex', e.target.value)} /></F>
              <div className="full"><Toggle id="b-metal" label="Metallic cap" checked={d.bottleStyle.capMetal !== false} onChange={(v) => setBottle('capMetal', v)} /></div>
              <div className="full stack" style={{ gap: 10 }}>
                {d.modelMediaId ? <div className="row" style={{ justifyContent: 'space-between' }}><span className="pill ok">GLB attached</span><button type="button" className="btn small ghost" onClick={() => set('modelMediaId', null)}>Remove</button></div>
                  : <p className="muted" style={{ margin: 0, fontSize: '.85rem' }}>The store builds a 3D bottle from the settings above. You can upload a real GLB model instead.</p>}
                <Dropzone accept=".glb,model/gltf-binary" multiple={false} label={d.modelMediaId ? 'Replace GLB' : 'Upload GLB model'} busy={up} onFiles={async (files) => {
                  setUp(true);
                  try { const [m] = await uploadFiles(files.slice(0, 1), 'model'); set('modelMediaId', m.id); toast('3D model uploaded'); } catch (e) { toast(e.message, 'bad'); } finally { setUp(false); }
                }} />
              </div>
            </div></section>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
