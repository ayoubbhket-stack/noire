'use client';
// Global motion layer: first-visit loader, scroll reveals, parallax, custom
// cursor and a route progress bar. Everything is skipped for reduced motion,
// and content is always visible without JavaScript.
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Loader() {
  const [state, setState] = useState('hidden');
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('nr_loaded') === '1'; sessionStorage.setItem('nr_loaded', '1'); } catch { seen = true; }
    if (seen || reduced()) return undefined;
    setState('show');
    const t = setTimeout(() => setState('done'), 1900);
    const t2 = setTimeout(() => setState('hidden'), 2600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);
  if (state === 'hidden') return null;
  return (
    <div className={`loader${state === 'done' ? ' done' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 140">
        <g className="mist"><circle cx="78" cy="22" r="2.4" /><circle cx="88" cy="16" r="1.8" /><circle cx="92" cy="28" r="1.5" /><circle cx="100" cy="20" r="1.2" /><circle cx="84" cy="32" r="1.1" /></g>
        <rect className="cap" x="46" y="14" width="22" height="18" rx="3" />
        <rect className="collar" x="50" y="32" width="14" height="7" />
        <path className="glass" d="M28 50c0-6 5-11 11-11h36c6 0 11 5 11 11v66c0 8-6 14-14 14H42c-8 0-14-6-14-14V50Z" />
        <clipPath id="ld-clip"><path d="M34 56c0-4 3-7 7-7h32c4 0 7 3 7 7v58c0 6-4 10-10 10H44c-6 0-10-4-10-10V56Z" /></clipPath>
        <g clipPath="url(#ld-clip)"><rect className="fill" x="30" y="50" width="60" height="80" /></g>
      </svg>
    </div>
  );
}

export function MotionLayer() {
  const path = usePathname();
  useEffect(() => {
    if (reduced()) return undefined;
    // Reveal: only elements below the fold are hidden, so the first frame is complete.
    // Runs after hydration has settled so React never sees the added classes.
    let io; let raf = 0; let px = [];
    const setup = () => {
    const els = [...document.querySelectorAll('[data-reveal]:not(.will-reveal)')];
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (const el of els) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) { el.classList.add('will-reveal'); io.observe(el); }
    }
    px = [...document.querySelectorAll('[data-parallax]')];
    tick();
    };
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of px) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * Number(el.dataset.parallax || 0.15) * 100).toFixed(2)}%, 0)`;
      }
      // timeline fill
      document.querySelectorAll('[data-progress]').forEach((t) => {
        const r = t.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        t.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const timer = setTimeout(setup, 300);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { clearTimeout(timer); io?.disconnect(); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [path]);
  return null;
}

export function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced() || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const el = ref.current;
    let x = -100, y = -100, cx = x, cy = y, raf;
    const move = (e) => {
      x = e.clientX; y = e.clientY; el.classList.add('on');
      const t = e.target.closest?.('a, button, [data-cursor]');
      el.classList.toggle('hover', !!t);
      el.classList.toggle('drag', t?.dataset?.cursor === 'drag');
    };
    const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; raf = requestAnimationFrame(loop); };
    const leave = () => el.classList.remove('on');
    window.addEventListener('pointermove', move);
    document.addEventListener('mouseleave', leave);
    loop();
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true" />;
}

export function RouteProgress() {
  const path = usePathname();
  const [w, setW] = useState(0);
  useEffect(() => {
    const click = (e) => {
      const a = e.target.closest?.('a[href^="/"]');
      if (!a || a.target || e.metaKey || e.ctrlKey || a.getAttribute('href') === window.location.pathname + window.location.search) return;
      setW(30); setTimeout(() => setW((v) => (v && v < 70 ? 70 : v)), 250);
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
  useEffect(() => { if (!w) return undefined; setW(100); const t = setTimeout(() => setW(0), 350); return () => clearTimeout(t); }, [path]); // eslint-disable-line
  return <div className="route-bar" style={{ width: `${w}%`, opacity: w && w < 100 ? 1 : 0 }} aria-hidden="true" />;
}
