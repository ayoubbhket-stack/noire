import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { DEFAULTS } from './defaults';

function merge(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over ?? base;
  if (base && typeof base === 'object' && over && typeof over === 'object') {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

export async function getSetting(key) {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  return merge(DEFAULTS[key], row?.value);
}

export async function getSettings(keys) {
  const out = {};
  await Promise.all(keys.map(async (k) => { out[k] = await getSetting(k); }));
  return out;
}

export async function saveSetting(key, value) {
  if (!(key in DEFAULTS)) throw new Error('Unknown settings key');
  const db = await getDb();
  await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({
    target: schema.settings.key, set: { value, updatedAt: new Date() },
  });
}

/** Overlay translated strings on top of a base object. Only non-empty strings
 *  from `over` replace base values, so ids, numbers and flags always come from
 *  the base (English) settings. Arrays are merged item by item. */
export function mergeText(base, over) {
  if (typeof base === 'string') return typeof over === 'string' && over.trim() ? over : base;
  if (Array.isArray(base)) {
    const arr = Array.isArray(over) ? over : [];
    // sections are matched by their key so reordering in English keeps the translations
    const byKey = arr.some((o) => o?.key) ? new Map(arr.filter((o) => o?.key).map((o) => [o.key, o])) : null;
    return base.map((b, i) => mergeText(b, byKey && b?.key ? byKey.get(b.key) : arr[i]));
  }
  if (base && typeof base === 'object') {
    const out = { ...base };
    for (const k of Object.keys(base)) out[k] = mergeText(base[k], over?.[k]);
    return out;
  }
  return base;
}

/** Content in the visitor's language: English base + Arabic overlay (key_ar). */
export async function getContent(key, lang) {
  const base = await getSetting(key);
  if (lang !== 'ar' || !((`${key}_ar`) in DEFAULTS)) return base;
  return mergeText(base, await getSetting(`${key}_ar`));
}

export async function getContents(keys, lang) {
  const out = {};
  await Promise.all(keys.map(async (k) => { out[k] = await getContent(k, lang); }));
  return out;
}
