import Link from 'next/link';
import { getContent } from '@/lib/settings';
import { mediaUrl } from '@/lib/catalog';
import { getT } from '@/lib/lang';

export async function generateMetadata() {
  const { lang, t } = await getT();
  const a = await getContent('about', lang);
  return { title: t('About'), description: a.intro.slice(0, 155), alternates: { canonical: '/about' } };
}

export default async function About() {
  const { lang, t } = await getT();
  const a = await getContent('about', lang);
  const imgs = (a.images || []).map(mediaUrl);
  return (
    <>
      <section className="section about-hero">
        <div className="wrap">
          <p className="eyebrow" data-reveal>{t('About us')}</p>
          <h1 className="display-xl">{a.headline}</h1>
          <p className="lede" style={{ marginTop: 28 }}>{a.intro}</p>
        </div>
        {imgs[0] && <div className="wrap"><div className="img wide-img"><img src={imgs[0]} alt="" data-parallax="0.08" /></div></div>}
      </section>

      <section className="section">
        <div className="wrap chapters">
          {[['01', t('Our story'), a.story], ['02', t('How we choose'), a.philosophy]].map(([k, title, body]) => (
            <div className="chapter" key={k} data-reveal><span className="k num">{k}</span><h2 className="display-m">{title}</h2><p className="muted">{body}</p></div>
          ))}
        </div>
      </section>

      <div className="values-marquee" aria-label={a.values.join(', ')}>
        <div className="track" aria-hidden="true">{[...a.values, ...a.values, ...a.values].map((v, i) => <span key={i}>{v}</span>)}</div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head" data-reveal><h2 className="display-l">{t('From source to your door')}</h2></div>
          <div className="process">
            {a.process.map((s, i) => <div key={i} data-reveal style={{ '--d': `${i * 90}ms` }}><span className="n num">{String(i + 1).padStart(2, '0')}</span><h3 className="display-s">{s.title}</h3><p className="muted">{s.text}</p></div>)}
          </div>
        </div>
      </section>

      {imgs.length > 1 && (
        <section className="section tight"><div className="wrap editorial">
          <figure data-reveal><img src={imgs[1]} alt="" loading="lazy" /></figure>
          {imgs[2] && <figure data-reveal><img src={imgs[2]} alt="" loading="lazy" /></figure>}
        </div></section>
      )}

      <section className="section">
        <div className="wrap timeline-wrap">
          <div data-reveal><p className="eyebrow">{t('Milestones')}</p><h2 className="display-m">{t('Timeline')}</h2></div>
          <div className="timeline" data-progress>
            <span className="fill" aria-hidden="true" />
            {a.timeline.map((x, i) => <div className="tl-item" key={i} data-reveal><span className="dot" /><span className="y">{x.year}</span><div><h3 className="display-s">{x.title}</h3><p className="muted">{x.text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <div className="section-head" data-reveal><h2 className="display-l">{t('What makes us different')}</h2><Link className="btn ghost end" href="/shop">{t('Shop perfumes')}</Link></div>
          <div className="diff">{a.difference.map((d, i) => <div key={i} data-reveal style={{ '--d': `${i * 90}ms` }}><h3 className="display-s">{d.title}</h3><p className="muted">{d.text}</p></div>)}</div>
        </div>
      </section>
    </>
  );
}
