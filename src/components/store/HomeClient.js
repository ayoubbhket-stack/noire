'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Viewer3D from '../three/Viewer3D';
import { ArrowIcon } from './Icons';
import { useStore } from './StoreProvider';

export function HomeHero({ hero, poster, stats }) {
  const { t } = useStore();
  const words = (hero.headline || '').split(/\s+/).filter(Boolean);
  return (
    <section className="hero" aria-label={t('Introduction')}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          {hero.eyebrow && <p className="eyebrow">{hero.eyebrow}</p>}
          <h1 className="display-xl" aria-label={hero.headline}>
            {words.map((w, i) => <span className="word" key={i} aria-hidden="true"><span style={{ '--i': i }}>{w}</span>{i < words.length - 1 ? ' ' : ''}</span>)}
          </h1>
          <p className="lede">{hero.text}</p>
          <div className="row">
            {hero.primaryLabel && <Link className="btn" href={hero.primaryHref || '/shop'}>{hero.primaryLabel} <ArrowIcon /></Link>}
            {hero.secondaryLabel && <Link className="btn ghost" href={hero.secondaryHref || '/finder'}>{hero.secondaryLabel}</Link>}
          </div>
          <dl className="hero-stats">
            {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="num">{v}</dd></div>)}
          </dl>
        </div>
        <div className="hero-stage">
          <div className="halo" aria-hidden="true" />
          <Viewer3D className="hero-canvas" mode="hero" eager drag={false} poster={poster} posterAlt={t('A perfume bottle turning slowly')}
            bottle={hero.bottle} fit={13} distance={40} initialY={-0.4} />
        </div>
      </div>
      <span className="scroll-cue" aria-hidden="true" />
    </section>
  );
}

/** Horizontal, draggable product rail. */
export function Rail({ children, label }) {
  const { t } = useStore();
  const track = useRef(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: 0 });
  const bar = useRef(null);
  useEffect(() => {
    const el = track.current;
    const on = () => { const max = el.scrollWidth - el.clientWidth; if (bar.current) bar.current.style.transform = `scaleX(${max ? Math.abs(el.scrollLeft) / max : 0})`; };
    el.addEventListener('scroll', on, { passive: true }); on();
    return () => el.removeEventListener('scroll', on);
  }, []);
  const rtl = () => getComputedStyle(track.current).direction === 'rtl';
  const by = (dir) => track.current.scrollBy({ left: dir * (rtl() ? -1 : 1) * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="rail">
      <div className="rail-controls">
        <button className="icon-btn round" onClick={() => by(-1)} aria-label={t('Previous')}><span className="flip-x"><ArrowIcon /></span></button>
        <button className="icon-btn round" onClick={() => by(1)} aria-label={t('Next')}><ArrowIcon /></button>
      </div>
      <div ref={track} className="rail-track" data-cursor="drag" tabIndex={0} aria-label={label}
        onPointerDown={(e) => { if (e.pointerType !== 'mouse') return; drag.current = { on: true, x: e.clientX, left: track.current.scrollLeft, moved: 0 }; }}
        onPointerMove={(e) => { const d = drag.current; if (!d.on) return; d.moved = Math.abs(e.clientX - d.x); if (d.moved > 4) track.current.classList.add('dragging'); track.current.scrollLeft = d.left - (e.clientX - d.x); }}
        onPointerUp={() => { drag.current.on = false; track.current.classList.remove('dragging'); }}
        onPointerLeave={() => { drag.current.on = false; track.current.classList.remove('dragging'); }}
        onClickCapture={(e) => { if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation(); drag.current.moved = 0; } }}>
        {children}
      </div>
      <div className="rail-progress" aria-hidden="true"><span ref={bar} /></div>
    </div>
  );
}
