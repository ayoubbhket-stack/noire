import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { HttpError, requireAdminApi } from '@/lib/auth';
import { handler, ok } from '@/lib/http';
import { saveSetting } from '@/lib/settings';
import { CONTENT } from '@/lib/content-schemas';

export const dynamic = 'force-dynamic';

// Arabic overlays only ever hold text; anything else is dropped.
function textOnly(v, depth = 0) {
  if (depth > 6) return undefined;
  if (typeof v === 'string') return v.slice(0, 20000);
  if (Array.isArray(v)) return v.slice(0, 80).map((x) => textOnly(x, depth + 1) ?? null);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, x] of Object.entries(v).slice(0, 80)) { const c = textOnly(x, depth + 1); if (c !== undefined) out[k] = c; }
    return out;
  }
  return undefined;
}

export const PUT = handler(async (req) => {
  await requireAdminApi('content.write');
  const { key, value } = z.object({ key: z.string(), value: z.any() }).parse(await req.json());
  if (key.endsWith('_ar')) {
    const base = key.slice(0, -3);
    if (!CONTENT[base] && base !== 'store') throw new HttpError(422, 'Unknown content section.');
    const clean = textOnly(value);
    if (JSON.stringify(clean ?? {}).length > 200000) throw new HttpError(422, 'Text is too long.');
    await saveSetting(key, clean ?? {});
  } else {
    if (!CONTENT[key]) throw new HttpError(422, 'Unknown content section.');
    await saveSetting(key, CONTENT[key].parse(value));
  }
  revalidatePath('/', 'layout');
  return ok({ ok: true });
});
