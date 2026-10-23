// Three.js scene for the hero and the product viewer: one perfume bottle that
// floats, follows the pointer and can be rotated by dragging. Loaded lazily
// (dynamic import) so it never blocks first paint.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildBottle, makeStudioEnv, tintModel } from '@/lib/three/bottle';

const glbCache = new Map();

export function createScene(container, opts = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const hero = opts.mode === 'hero';
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = makeStudioEnv(THREE, renderer);
  const camera = new THREE.PerspectiveCamera(opts.fov || 26, 1, 0.1, 400);

  const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(-8, 12, 10); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xfff7ec, 0xd8c7ad, 0.9));
  const warm = new THREE.PointLight(0xffd9a0, hero ? 90 : 60, 60); warm.position.set(9, 2, 6); scene.add(warm);

  const pivot = new THREE.Group();
  const holder = new THREE.Group();
  pivot.add(holder); scene.add(pivot);

  // soft pearls floating around the hero bottle
  const floaters = [];
  if (hero) {
    const pearl = new THREE.MeshPhysicalMaterial({ color: '#f3e3d8', roughness: 0.25, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color('#ffffff') });
    const gold = new THREE.MeshPhysicalMaterial({ color: '#c9a45c', metalness: 1, roughness: 0.2 });
    const blush = new THREE.MeshPhysicalMaterial({ color: '#e9c1c0', roughness: 0.35, clearcoat: 0.8 });
    const defs = [
      [new THREE.SphereGeometry(1.1, 48, 32), pearl, [-7, 5.5, -3]],
      [new THREE.SphereGeometry(0.6, 48, 32), gold, [6.5, 7, -2]],
      [new THREE.TorusGeometry(2, 0.08, 16, 96), gold, [6, -5, -5]],
      [new THREE.SphereGeometry(0.8, 48, 32), blush, [-6.5, -5.5, 1]],
      [new THREE.SphereGeometry(0.4, 32, 24), pearl, [4.5, -7.5, 3]],
    ];
    for (const [g, m, p] of defs) {
      const mesh = new THREE.Mesh(g, m); mesh.position.set(...p);
      mesh.userData.base = new THREE.Vector3(...p); mesh.userData.seed = Math.random() * 10;
      scene.add(mesh); floaters.push(mesh);
    }
  }

  let model = null;
  const state = { tx: 0, ty: 0, rx: 0, ry: 0, dragging: false, lastX: 0, lastY: 0, spinY: opts.initialY ?? -0.35, spinX: opts.initialX ?? 0.08, velocity: 0, visible: true, disposed: false, t: 0, idle: 0 };

  function frameModel() {
    if (!model) return;
    model.position.set(0, 0, 0); model.scale.setScalar(1);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    model.position.sub(c);
    const s = (opts.fit || 12) / Math.max(size.y, size.x, 0.001);
    model.scale.setScalar(s);
    model.position.multiplyScalar(s);
  }

  async function setModel(o) {
    let next;
    if (o.modelUrl) {
      try {
        if (!glbCache.has(o.modelUrl)) glbCache.set(o.modelUrl, new GLTFLoader().loadAsync(o.modelUrl));
        const gltf = await glbCache.get(o.modelUrl);
        next = gltf.scene.clone(true);
        next.traverse((m) => { if (m.isMesh) m.material = m.material.clone(); });
        tintModel(THREE, next, o.bottle || {});
      } catch (e) {
        console.warn('GLB failed, falling back to procedural bottle', e);
      }
    }
    if (!next) next = buildBottle(THREE, o.bottle || {});
    if (state.disposed) return;
    if (model) { holder.remove(model); disposeTree(model); }
    model = next; holder.add(model); frameModel();
    holder.scale.setScalar(0.88);
    state.pop = 1;
  }

  const el = renderer.domElement;
  el.style.touchAction = opts.drag ? 'pan-y' : 'auto';
  Object.assign(el.style, { width: '100%', height: '100%', display: 'block' });
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    state.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    state.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (state.dragging) {
      const dx = e.clientX - state.lastX; const dy = e.clientY - state.lastY;
      state.spinY += dx * 0.01; state.spinX = Math.max(-0.6, Math.min(0.6, state.spinX + dy * 0.005));
      state.velocity = dx * 0.01; state.lastX = e.clientX; state.lastY = e.clientY; state.idle = 0;
    }
  };
  const onDown = (e) => { if (!opts.drag) return; state.dragging = true; state.lastX = e.clientX; state.lastY = e.clientY; el.setPointerCapture?.(e.pointerId); };
  const onUp = () => { state.dragging = false; };
  const target = hero ? window : el;
  target.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  const resize = () => {
    const w = container.clientWidth || 1; const h = container.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const d = opts.distance || 34;
    camera.position.set(0, 1.2, d * (camera.aspect < 0.8 ? 0.8 / Math.max(camera.aspect, 0.5) : 1));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    render();
  };
  const ro = new ResizeObserver(resize); ro.observe(container);
  const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) loop(); }, { threshold: 0.01 });
  io.observe(container);

  const clock = new THREE.Clock();
  let raf = 0;
  function render() { renderer.render(scene, camera); }
  function loop() {
    cancelAnimationFrame(raf);
    if (!state.visible || state.disposed) return;
    const dt = Math.min(clock.getDelta(), 0.05); state.t += dt; state.idle += dt;
    if (!reduced) {
      if (!state.dragging) {
        state.velocity *= 0.94;
        state.spinY += state.velocity + (opts.autoRotate !== false && state.idle > 1.2 ? dt * (hero ? 0.35 : 0.4) : 0);
      }
      const follow = hero ? 0.25 : 0.08;
      state.rx += ((state.ty * follow) - state.rx) * 0.06;
      state.ry += ((state.tx * follow) - state.ry) * 0.06;
      holder.position.y = Math.sin(state.t * 0.9) * (hero ? 0.35 : 0.15);
      if (state.pop) { const s = holder.scale.x + (1 - holder.scale.x) * 0.1; holder.scale.setScalar(s); if (Math.abs(1 - s) < 0.001) state.pop = 0; }
      for (const f of floaters) {
        const s = f.userData.seed;
        f.position.y = f.userData.base.y + Math.sin(state.t * 0.6 + s) * 0.7 - state.ty * 0.8;
        f.position.x = f.userData.base.x - state.tx * 0.6;
        f.rotation.x += dt * 0.2; f.rotation.y += dt * 0.3;
      }
    } else {
      holder.scale.setScalar(1);
    }
    pivot.rotation.set(state.spinX + state.rx * 0.5, state.spinY + state.ry, 0);
    render();
    raf = requestAnimationFrame(loop);
  }

  setModel(opts).then(() => { resize(); loop(); opts.onReady?.(); });

  return {
    setModel,
    setAngle(y, x = 0.08) { state.spinY = y; state.spinX = x; state.idle = 0; },
    dispose() {
      state.disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      target.removeEventListener('pointermove', onMove); el.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp);
      disposeTree(scene); renderer.dispose(); el.remove();
    },
  };
}

function disposeTree(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
  });
}

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
