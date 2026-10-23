// Procedural perfume bottle. Builds glass body, liquid, metal collar, neck and
// cap from a small style object, so every product can get its own bottle
// without 3D files. Meshes are named "glass", "liquid", "cap" and "collar" so
// colours can be changed later (and GLB files can use the same names).

export const BOTTLE_SHAPES = ['classic', 'round', 'tall', 'flacon', 'faceted', 'orb'];
export const CAP_STYLES = ['cube', 'cylinder', 'sphere', 'tall', 'disc'];

const DEFAULT_STYLE = { shape: 'classic', glassHex: '#f4efe6', liquidHex: '#e7b46a', capHex: '#c9a45c', cap: 'cube', capMetal: true };

function roundedRect(THREE, w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function polygon(THREE, n, r) {
  const s = new THREE.Shape();
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2 + Math.PI / n;
    const p = [Math.cos(t) * r, Math.sin(t) * r];
    if (i === 0) s.moveTo(...p); else s.lineTo(...p);
  }
  return s;
}

/** Body geometry for a given shape, standing on y=0. Returns { geo, height, inner(scale) } */
function body(THREE, shape, scale = 1) {
  const k = scale;
  const prism = (sh, depth, height, bevel) => {
    // extrude a footprint (x/z plane) upwards
    const g = new THREE.ExtrudeGeometry(sh, { depth: height - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 32 });
    g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0);
    return g;
  };
  switch (shape) {
    case 'round': {
      const pts = [];
      const H = 6.2 * k, R = 2.4 * k;
      pts.push(new THREE.Vector2(0, 0));
      for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI / 2; pts.push(new THREE.Vector2(R - 0.35 * k + Math.sin(a) * 0.35 * k, 0.35 * k - Math.cos(a) * 0.35 * k)); }
      pts.push(new THREE.Vector2(R, H - 0.6 * k));
      for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI / 2; pts.push(new THREE.Vector2(0.75 * k + (R - 0.75 * k) * Math.cos(a), H - 0.6 * k + 0.6 * k * Math.sin(a))); }
      pts.push(new THREE.Vector2(0, H));
      return { geo: new THREE.LatheGeometry(pts, 96), height: H };
    }
    case 'orb': {
      const g = new THREE.SphereGeometry(3 * k, 96, 64);
      g.scale(1, 0.92, 1); g.translate(0, 2.76 * k, 0);
      return { geo: g, height: 5.52 * k };
    }
    case 'flacon': {
      const pts = [new THREE.Vector2(0, 0)];
      const H = 5 * k;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40; const y = t * H;
        const r = (2.0 + 1.3 * Math.sin(Math.PI * Math.pow(t, 0.8))) * k * (1 - 0.55 * Math.pow(t, 6));
        pts.push(new THREE.Vector2(Math.max(r, 0.7 * k), y));
      }
      pts.push(new THREE.Vector2(0, H));
      return { geo: new THREE.LatheGeometry(pts, 96), height: H };
    }
    case 'tall': return { geo: prism(roundedRect(THREE, 3.2 * k, 2.1 * k, 0.5 * k), 2.1 * k, 8.4 * k, 0.28 * k), height: 8.4 * k };
    case 'faceted': return { geo: prism(polygon(THREE, 8, 2.6 * k), 0, 6 * k, 0.12 * k), height: 6 * k };
    case 'classic':
    default: return { geo: prism(roundedRect(THREE, 5.2 * k, 2.6 * k, 0.7 * k), 2.6 * k, 6.4 * k, 0.35 * k), height: 6.4 * k };
  }
}

export function buildBottle(THREE, opts = {}) {
  const st = { ...DEFAULT_STYLE, ...(opts.style || opts) };
  const group = new THREE.Group();
  const mats = {
    // glass: clear reflective shell (no transmission so the liquid stays visible on every GPU)
    glass: new THREE.MeshPhysicalMaterial({ name: 'glass', color: st.glassHex, metalness: 0, roughness: 0.02, transparent: true, opacity: st.glassOpacity ?? 0.17, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, specularIntensity: 1, ior: 1.5, side: THREE.DoubleSide }),
    liquid: new THREE.MeshPhysicalMaterial({ name: 'liquid', color: st.liquidHex, metalness: 0, roughness: 0.08, transparent: true, opacity: st.liquidOpacity ?? 0.93, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.55, sheen: 0.4, sheenColor: new THREE.Color(st.liquidHex).offsetHSL(0, 0, 0.2) }),
    cap: st.capMetal
      ? new THREE.MeshPhysicalMaterial({ name: 'cap', color: st.capHex, metalness: 1, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 1.5 })
      : new THREE.MeshPhysicalMaterial({ name: 'cap', color: st.capHex, metalness: 0.05, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1 }),
    collar: new THREE.MeshPhysicalMaterial({ name: 'collar', color: st.collarHex || '#cfae6a', metalness: 1, roughness: 0.22, envMapIntensity: 1.4 }),
  };

  const outer = body(THREE, st.shape, 1);
  const glass = new THREE.Mesh(outer.geo, mats.glass); glass.name = 'glass'; glass.renderOrder = 2; group.add(glass);

  // liquid: a smaller copy of the body, filled to ~80%
  const inner = body(THREE, st.shape, 0.9);
  inner.geo.computeBoundingBox();
  const lift = (outer.height - inner.height) * 0.28 + 0.25;
  const fill = st.fill ?? 0.82;
  const liquid = new THREE.Mesh(inner.geo, mats.liquid);
  liquid.name = 'liquid'; liquid.position.y = lift;
  liquid.scale.y = fill; liquid.renderOrder = 1; group.add(liquid);

  // neck + collar
  const H = outer.height;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.5, 48), mats.glass); neck.position.y = H + 0.2; neck.name = 'glass'; neck.renderOrder = 2; group.add(neck);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 64), mats.collar); collar.position.y = H + 0.55; collar.name = 'collar'; group.add(collar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.06, 16, 64), mats.collar); ring.rotation.x = Math.PI / 2; ring.position.y = H + 0.3; ring.name = 'collar'; group.add(ring);

  // cap
  let cap; const capY = H + 0.8;
  switch (st.cap) {
    case 'sphere': cap = new THREE.Mesh(new THREE.SphereGeometry(1.25, 64, 48), mats.cap); cap.position.y = capY + 1.15; break;
    case 'cylinder': cap = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 2.2, 64), mats.cap); cap.position.y = capY + 1.1; break;
    case 'tall': cap = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 3.4, 8), mats.cap); cap.position.y = capY + 1.7; break;
    case 'disc': cap = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.9, 72), mats.cap); cap.position.y = capY + 0.45; break;
    case 'cube':
    default: {
      const g = new THREE.ExtrudeGeometry(roundedRect(THREE, 2.2, 2.2, 0.25), { depth: 1.9, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 });
      g.rotateX(-Math.PI / 2); g.translate(0, 0.08, 0);
      cap = new THREE.Mesh(g, mats.cap); cap.position.y = capY;
    }
  }
  cap.name = 'cap'; group.add(cap);

  // centre horizontally, base at y = -height/2 so it rotates around its middle
  const box = new THREE.Box3().setFromObject(group);
  const c = box.getCenter(new THREE.Vector3());
  group.children.forEach((ch) => ch.position.sub(c));
  group.userData.materials = mats;
  group.userData.width = box.max.y - box.min.y; // engine fits on the tallest side
  return group;
}

/** Re-tint meshes named glass/liquid/cap (works for GLB too). */
export function tintModel(THREE, root, { glassHex, liquidHex, capHex } = {}) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const n = `${o.name} ${o.material?.name || ''}`.toLowerCase();
    if (liquidHex && n.includes('liquid')) { o.material.color?.set(liquidHex); o.material.attenuationColor?.set(liquidHex); }
    if (glassHex && n.includes('glass')) o.material.color?.set(glassHex);
    if (capHex && n.includes('cap')) o.material.color?.set(capHex);
  });
}

/** A bright, warm studio (cream walls, large white softboxes, soft gold
 *  accents) used as the reflection environment for glass and metal. */
export function makeStudioEnv(THREE, renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e9e1d4');
  const box = (w, h, color, intensity, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); scene.add(m);
  };
  box(18, 6, '#ffffff', 3, [0, 10, 6]);          // top softbox
  box(10, 14, '#fffaf2', 2.2, [-11, 2, 8]);      // tall left softbox
  box(3, 14, '#ffffff', 2.6, [11, 1, 4]);        // strip right
  box(12, 4, '#e8c99a', 1.1, [0, -8, 8]);        // warm floor bounce
  box(20, 10, '#d9cdbb', 0.9, [0, 0, -12]);      // cream back wall
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  return tex;
}
