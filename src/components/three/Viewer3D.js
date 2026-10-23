'use client';
// React wrapper around the lazy-loaded Three.js engine. Shows a still image
// until the 3D scene is ready, and keeps it if WebGL is unavailable.
import { useEffect, useRef, useState } from 'react';

export default function Viewer3D({ bottle, modelUrl, mode = 'viewer', drag = true, poster, posterAlt = '', className = 'viewer', eager = false, ...opts }) {
  const box = useRef(null);
  const api = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const key = JSON.stringify(bottle || {});

  useEffect(() => {
    let cancelled = false; let io;
    const start = async () => {
      try {
        const eng = await import('./engine');
        if (cancelled) return;
        if (!eng.webglAvailable()) { setFailed(true); return; }
        api.current = eng.createScene(box.current, { bottle, modelUrl, mode, drag, ...opts, onReady: () => !cancelled && setReady(true) });
      } catch (e) { console.warn(e); setFailed(true); }
    };
    if (eager) {
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
      idle(start);
    } else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '200px' });
      io.observe(box.current);
    }
    return () => { cancelled = true; io?.disconnect(); api.current?.dispose(); api.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    api.current?.setModel({ bottle, modelUrl });
  }, [key, modelUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className} data-cursor={drag ? 'drag' : undefined} role="img" aria-label={posterAlt}>
      {poster && <img src={poster} alt="" className={`poster${ready && !failed ? ' gone' : ''}`} fetchPriority={mode === 'hero' ? 'high' : undefined} />}
      <div ref={box} className="canvas-box" />
    </div>
  );
}
