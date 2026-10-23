import { getContent } from '@/lib/settings';
import { getLang } from '@/lib/lang';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const lang = await getLang();
  const store = await getContent('store', lang);
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: { default: store.seoTitle || store.name, template: `%s — ${store.name}` },
    description: store.seoDescription,
    openGraph: { siteName: store.name, type: 'website', locale: lang === 'ar' ? 'ar_EG' : 'en_EG', title: store.seoTitle, description: store.seoDescription, images: [{ url: '/opengraph.jpg' }] },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/icon.svg' },
  };
}

export const viewport = { themeColor: '#f7f2ea', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&family=El+Messiri:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap';

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
