'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, useAdmin } from './ui';

export default function SeedButton() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="notice" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ flex: 1 }}>The store has no products yet. Load the sample perfumes, collections and photos to see it complete (you can edit or delete them later).</span>
      <button className="btn small" disabled={busy} onClick={async () => {
        setBusy(true); setErr('');
        const r = await api('POST', '/api/admin/seed');
        setBusy(false);
        if (r.ok) { toast(`Loaded ${r.data.products} sample perfumes`); router.refresh(); } else setErr(r.error);
      }}>{busy ? 'Loading… (up to a minute)' : 'Load sample perfumes'}</button>
      {err && <span style={{ color: 'var(--bad)', width: '100%' }}>{err}</span>}
    </div>
  );
}
