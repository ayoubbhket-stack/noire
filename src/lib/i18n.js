// Storefront translations. Strings are written in English in the code and
// looked up here for Arabic, so a missing entry simply falls back to English.
// Safe to import from client and server components.
import { AR } from './i18n-ar';

const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : s);

// Server messages that contain numbers or names (from the cart/checkout APIs).
const PATTERNS = [
  [/^Only (\d+) left in stock\.?$/, (m) => `فاضل ${m[1]} بس في المخزون.`],
  [/^Only (\d+) left$/, (m) => `فاضل ${m[1]} بس`],
  [/^(.+) is sold out\.?$/, (m) => `${m[1]} خلص.`],
  [/^Add (.+) more to use this code\.?$/, (m) => `ضيف ${m[1]} كمان علشان تستخدم الكود ده.`],
  [/^Spend EGP ([\d,.]+) or more to use this code\.?$/, (m) => `الكود ده للطلبات من ${m[1]} ج.م أو أكتر.`],
  [/^(.+) just sold out\.?$/, (m) => `${m[1]} لسه خلص حالاً.`],
  [/^Use at most (\d+) characters\.?$/, (m) => `اكتب ${m[1]} حرف بالكتير.`],
];

export function translate(lang, s, vars) {
  if (s == null) return '';
  if (lang !== 'ar') return fill(String(s), vars);
  const hit = AR[s];
  if (hit) return fill(hit, vars);
  for (const [re, fn] of PATTERNS) { const m = String(s).match(re); if (m) return fn(m); }
  return fill(String(s), vars);
}

export const translator = (lang) => (s, vars) => translate(lang, s, vars);

// Labels for catalogue values.
export const LABELS = {
  gender: { women: ['Women', 'حريمي'], men: ['Men', 'رجالي'], unisex: ['Unisex', 'للجنسين'] },
  family: {
    floral: ['Floral', 'ورود'], woody: ['Woody', 'خشبي'], oriental: ['Oriental', 'شرقي'], fresh: ['Fresh', 'منعش'],
    citrus: ['Citrus', 'حمضيات'], aquatic: ['Aquatic', 'بحري'], gourmand: ['Gourmand', 'حلو'], leather: ['Leather', 'جلدي'],
    spicy: ['Spicy', 'توابل'], musky: ['Musky', 'مسك'], green: ['Green', 'أخضر'], fruity: ['Fruity', 'فواكه'], powdery: ['Powdery', 'بودري'],
  },
  concentration: { parfum: ['Parfum', 'بارفان'], edp: ['Eau de Parfum', 'أو دو بارفان'], edt: ['Eau de Toilette', 'أو دو تواليت'], edc: ['Eau de Cologne', 'كولونيا'], oil: ['Perfume oil', 'زيت عطري'] },
  concShort: { parfum: ['Parfum', 'بارفان'], edp: ['EDP', 'EDP'], edt: ['EDT', 'EDT'], edc: ['EDC', 'EDC'], oil: ['Oil', 'زيت'] },
  season: { spring: ['Spring', 'ربيع'], summer: ['Summer', 'صيف'], autumn: ['Autumn', 'خريف'], winter: ['Winter', 'شتا'] },
};

export function label(kind, value, lang) {
  const row = LABELS[kind]?.[value];
  if (!row) return value ? String(value)[0].toUpperCase() + String(value).slice(1) : '';
  return lang === 'ar' ? row[1] : row[0];
}

export function formatPrice(piasters, currency = 'EGP', lang = 'en') {
  const v = (Number(piasters) || 0) / 100;
  const s = v.toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  if (lang === 'ar') return `${s} ${currency === 'EGP' ? 'ج.م' : currency}`;
  return `${currency} ${s}`;
}

export const ORDER_STATUS = {
  pending: ['Received', 'اتستلم'], confirmed: ['Confirmed', 'اتأكد'], processing: ['Preparing', 'بيتجهز'],
  shipped: ['Shipped', 'اتشحن'], delivered: ['Delivered', 'وصل'], cancelled: ['Cancelled', 'اتلغى'], refunded: ['Refunded', 'اترد'],
};
