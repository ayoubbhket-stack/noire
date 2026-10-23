'use client';
import { useState } from 'react';
import { useStore } from './StoreProvider';

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, ...d };
}

export function NewsletterForm({ id = 'news', dark = false }) {
  const { t } = useStore();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <form className="inline-form" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        const r = await post('/api/newsletter', { email });
        setBusy(false); setMsg(r.ok ? t('You are on the list.') : t(r.error || 'Could not subscribe.'));
        if (r.ok) setEmail('');
      }}>
        <label htmlFor={id} className="sr-only">{t('Email address')}</label>
        <input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('Email address')} autoComplete="email" />
        <button type="submit" disabled={busy}>{busy ? '…' : t('Join')}</button>
      </form>
      <p className="msg" role="status" style={{ fontSize: '.85rem', marginTop: 8, color: dark ? undefined : 'var(--muted)' }}>{msg}</p>
    </div>
  );
}

const TOPICS = ['Order question', 'Help choosing a scent', 'Authenticity', 'Gift order', 'Returns', 'Wholesale', 'Other'];

export function ContactForm() {
  const { t } = useStore();
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: TOPICS[0], body: '' });
  const [errs, setErrs] = useState({});
  const [state, setState] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setState('busy');
    const r = await post('/api/contact', f);
    if (r.ok) { setState('sent'); setF({ name: '', email: '', phone: '', subject: TOPICS[0], body: '' }); setErrs({}); }
    else { setState('error:' + t(r.error || 'Could not send.')); setErrs(Object.fromEntries(Object.entries(r.fields || {}).map(([k, v]) => [k, t(v)]))); }
  };
  if (state === 'sent') return <div className="notice ok"><strong>{t('Message received.')}</strong> {t('We reply within one working day.')}<br /><button className="link" style={{ marginTop: 8 }} onClick={() => setState(null)}>{t('Send another message')}</button></div>;
  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field id="c-name" label={t('Full name')} err={errs.name}><input id="c-name" className="input" value={f.name} onChange={set('name')} required autoComplete="name" /></Field>
      <Field id="c-email" label={t('Email')} err={errs.email}><input id="c-email" type="email" className="input" value={f.email} onChange={set('email')} required autoComplete="email" /></Field>
      <Field id="c-phone" label={t('Phone (optional)')} err={errs.phone}><input id="c-phone" type="tel" className="input" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
      <Field id="c-subject" label={t('Topic')}><select id="c-subject" className="select" value={f.subject} onChange={set('subject')}>
        {TOPICS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
      </select></Field>
      <Field id="c-body" label={t('Message')} err={errs.body} full><textarea id="c-body" className="textarea" value={f.body} onChange={set('body')} required /></Field>
      {state?.startsWith('error:') && <div className="notice bad full" role="alert">{state.slice(6)}</div>}
      <div className="full"><button className="btn" disabled={state === 'busy'}>{state === 'busy' ? t('Sending…') : t('Send message')}</button></div>
    </form>
  );
}

export function Field({ id, label, err, hint, full, children }) {
  return (
    <div className={`field${err ? ' has-error' : ''}${full ? ' full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !err && <span className="hint">{hint}</span>}
      {err && <span className="err" id={`${id}-err`} role="alert">{err}</span>}
    </div>
  );
}

export function ReviewForm({ productId }) {
  const { toast, t } = useStore();
  const [f, setF] = useState({ name: '', city: '', rating: 5, title: '', body: '' });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  if (done) return <div className="notice ok">{t('Thanks. Your review will appear after a quick check by our team.')}</div>;
  return (
    <form className="review-form" noValidate onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const r = await post('/api/reviews', { ...f, productId });
      setBusy(false);
      if (r.ok) { setDone(true); toast(t('Review submitted for approval')); } else setErrs(Object.fromEntries(Object.entries(r.fields || { body: r.error }).map(([k, v]) => [k, t(v)])));
    }}>
      <div className="field"><span className="lab">{t('Rating')}</span>
        <div className="rating-input" role="radiogroup" aria-label={t('Rating')}>
          {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={f.rating === n} aria-label={`${n}/5`} className={n <= f.rating ? 'on' : ''} onClick={() => setF({ ...f, rating: n })}>★</button>)}
        </div>
      </div>
      <div className="form-grid">
        <Field id="r-name" label={t('Name')} err={errs.name}><input id="r-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field id="r-city" label={t('City (optional)')}><input id="r-city" className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
        <Field id="r-title" label={t('Title')} full><input id="r-title" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field id="r-body" label={t('Review')} err={errs.body} full><textarea id="r-body" className="textarea" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </div>
      <div><button className="btn" disabled={busy}>{busy ? t('Sending…') : t('Submit review')}</button></div>
    </form>
  );
}

export function CopyText({ text, label }) {
  const { t } = useStore();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="copy-btn" onClick={() => {
      navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }).catch(() => {});
    }}>{done ? t('Copied') : (label || t('Copy'))}</button>
  );
}
