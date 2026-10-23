// Current storefront language, read from the `lang` cookie (default Arabic).
import 'server-only';
import { cookies } from 'next/headers';
import { translator } from './i18n';

export const LANGS = ['ar', 'en'];
export const DEFAULT_LANG = 'ar';

export async function getLang() {
  try {
    const v = cookies().get('lang')?.value;
    return LANGS.includes(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: translator(lang) };
}
