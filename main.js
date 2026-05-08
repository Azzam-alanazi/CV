'use strict';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════
   PAGE LOADER
══════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('page-loader');
  const fill   = document.getElementById('loader-fill');
  if (!loader) return;

  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      setTimeout(() => { loader.classList.add('hidden'); revealHero(); }, 300);
    }
    if (fill) fill.style.width = pct + '%';
  }, 80);
}

/* ══════════════════════════════════════════════
   PAGE CURTAIN TRANSITIONS
══════════════════════════════════════════════ */
function initPageTransitions() {
  const curtain = document.getElementById('page-curtain');
  if (!curtain) return;

  setTimeout(() => curtain.classList.add('out'), 50);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http') || link.target === '_blank') return;
    link.addEventListener('click', e => {
      e.preventDefault();
      curtain.classList.remove('out');
      setTimeout(() => { window.location.href = href; }, 420);
    });
  });
}

/* ══════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════ */
function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn) return;

  const stored = localStorage.getItem('theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }

  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

/* ══════════════════════════════════════════════
   TYPEWRITER — HERO ROLE
══════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const phrases = [
    'Information Systems × Software Engineer',
    'Full Stack Developer',
    'Lua & Python Specialist',
    'Backend Architect'
  ];
  let pi = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 55, SPEED_DEL = 28, PAUSE = 2200;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  tick();
}

/* ══════════════════════════════════════════════
   TEXT SCRAMBLE
══════════════════════════════════════════════ */
class TextScramble {
  constructor(el) {
    this.el    = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const old  = this.el.innerText;
    const len  = Math.max(old.length, newText.length);
    const promise = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      this.queue.push({ from: old[i] || '', to: newText[i] || '', start: Math.floor(Math.random() * 18), end: Math.floor(Math.random() * 18) + 18 });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let out = '', done = 0;
    for (const { from, to, start, end } of this.queue) {
      if (this.frame >= end) { done++; out += to; }
      else if (this.frame >= start) out += `<span class="scramble-char">${this.chars[Math.floor(Math.random() * this.chars.length)]}</span>`;
      else out += from;
    }
    this.el.innerHTML = out;
    if (done === this.queue.length) { this.resolve(); return; }
    this.frameReq = requestAnimationFrame(this.update);
    this.frame++;
  }
}

function initTextScramble() {
  if (REDUCED_MOTION) return;
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const fx      = new TextScramble(el);
    const original = el.innerText;
    let done = false;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !done) {
        done = true;
        observer.disconnect();
        setTimeout(() => fx.setText(original), 200);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

/* ══════════════════════════════════════════════
   COPY-TO-CLIPBOARD TOAST
══════════════════════════════════════════════ */
function initCopyToast() {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;

  function showToast(msg) {
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  document.querySelectorAll('[data-copy-email]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard.writeText('mr.azzam1.q@gmail.com')
        .then(() => showToast('Email copied!'))
        .catch(() => showToast('Copy failed'));
    });
  });
}

/* ══════════════════════════════════════════════
   SCROLL TO TOP
══════════════════════════════════════════════ */
function initScrollToTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', scrollY > innerHeight * 0.4);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  });
}

/* ══════════════════════════════════════════════
   CURSOR LABEL ("View" / "Open" on hover)
══════════════════════════════════════════════ */
function initCursorLabel() {
  const label = document.getElementById('cursor-label');
  if (!label) return;

  let rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { rx = e.clientX; ry = e.clientY; });

  function updatePos() {
    label.style.left = rx + 'px';
    label.style.top  = ry + 'px';
    requestAnimationFrame(updatePos);
  }
  updatePos();

  const viewEls = '.tilt-card, .chapter-card, .cert-visual, .project-card, .edu-card';
  document.querySelectorAll(viewEls).forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = 'View'; label.classList.add('visible'); });
    el.addEventListener('mouseleave', () => label.classList.remove('visible'));
  });

  document.querySelectorAll('.btn-primary, .btn-outline, .btn, [data-magnetic]').forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = ''; label.classList.remove('visible'); });
  });
}

/* ══════════════════════════════════════════════
   KONAMI CODE EASTER EGG
══════════════════════════════════════════════ */
function initKonami() {
  const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === CODE[idx]) {
      idx++;
      if (idx === CODE.length) {
        idx = 0;
        fireKonami();
      }
    } else {
      idx = 0;
    }
  });

  function fireKonami() {
    const colors = ['#818cf8','#d4af37','#8b5cf6','#4ade80','#f472b6','#60a5fa'];
    const cx = innerWidth / 2, cy = innerHeight / 2;
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'konami-particle';
      const angle = (i / 60) * Math.PI * 2;
      const dist  = 120 + Math.random() * 260;
      p.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};--kx:${Math.cos(angle)*dist}px;--ky:${Math.sin(angle)*dist}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1100);
    }
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (toast) {
      if (toastMsg) toastMsg.textContent = '✦ You found the easter egg!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }
}

/* ══════════════════════════════════════════════
   THREE.JS — HERO SCENE
══════════════════════════════════════════════ */
function initThree() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (innerWidth < 768) { canvas.style.display = 'none'; return; }

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.14 });
  const ico    = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(2.4, 0.3, -1.5);
  scene.add(ico);

  const torGeo = new THREE.TorusGeometry(1, 0.018, 6, 90);
  const torMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.18 });
  const torus  = new THREE.Mesh(torGeo, torMat);
  torus.position.set(-3, -0.5, -2);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  const count = 900;
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 20;
    pos[i*3+1] = (Math.random() - 0.5) * 14;
    pos[i*3+2] = (Math.random() - 0.5) * 8;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 0.016, transparent: true, opacity: 0.5 });
  const pts  = new THREE.Points(pGeo, pMat);
  scene.add(pts);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth - 0.5)*2; my = (e.clientY/innerHeight - 0.5)*2; });
  const clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
    ico.rotation.x = t*0.22 + ty*0.3; ico.rotation.y = t*0.38 + tx*0.3;
    torus.rotation.z = t*0.15; torus.rotation.y = t*0.1 + tx*0.2;
    pts.rotation.y = t*0.04; pts.rotation.x = t*0.025;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* ══════════════════════════════════════════════
   SUB-PAGE UNIQUE 3D SCENES
══════════════════════════════════════════════ */
function initSubpageCanvas() {
  const canvas = document.getElementById('page-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (innerWidth < 768) { canvas.style.display = 'none'; return; }

  const path = location.pathname.toLowerCase();
  if      (path.includes('personal'))    buildPersonalScene(canvas);
  else if (path.includes('cert'))        buildCertsScene(canvas);
  else if (path.includes('edu'))         buildEduScene(canvas);
  else if (path.includes('project'))     buildProjectsScene(canvas);
}

/* helpers */
function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  return renderer;
}
function makeCamera() {
  const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  cam.position.z = 5;
  return cam;
}
function addParticles(scene, count = 450, spread = [20, 14, 8], color = 0x818cf8, size = 0.011, opacity = 0.3) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * spread[0];
    pos[i*3+1] = (Math.random() - 0.5) * spread[1];
    pos[i*3+2] = (Math.random() - 0.5) * spread[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity }));
  scene.add(pts);
  return pts;
}
function onResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* ── Personal: Torus Knot — complex, individual, organic ── */
function buildPersonalScene(canvas) {
  const scene = new THREE.Scene(), camera = makeCamera(), renderer = makeRenderer(canvas);
  const clock = new THREE.Clock();

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.4, 0.38, 120, 18, 2, 3),
    new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.11 })
  );
  knot.position.set(2.8, 0.4, -1.8);
  scene.add(knot);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.013, 6, 80),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.15 })
  );
  ring.position.set(-3.2, -0.8, -2.2);
  ring.rotation.x = Math.PI / 5;
  scene.add(ring);

  const pts = addParticles(scene, 420, [20, 14, 8], 0x818cf8, 0.011, 0.28);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth-.5)*2; my = (e.clientY/innerHeight-.5)*2; });

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx += (mx-tx)*.03; ty += (my-ty)*.03;
    knot.rotation.x = t*.14 + ty*.18; knot.rotation.y = t*.22 + tx*.18;
    ring.rotation.z = t*.09; ring.rotation.y = t*.06;
    pts.rotation.y = t*.025;
    renderer.render(scene, camera);
  })();
  onResize(camera, renderer);
}

/* ── Certificates: Dodecahedron + orbiting ring — formal, precious ── */
function buildCertsScene(canvas) {
  const scene = new THREE.Scene(), camera = makeCamera(), renderer = makeRenderer(canvas);
  const clock = new THREE.Clock();

  /* Main dodecahedron (12 faces = achievement) */
  const dodec = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.5, 0),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.13 })
  );
  dodec.position.set(2.6, 0.2, -1.6);
  scene.add(dodec);

  /* Inner icosahedron */
  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.12 })
  );
  inner.position.copy(dodec.position);
  scene.add(inner);

  /* Orbiting ring */
  const orb = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.014, 6, 90),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.09 })
  );
  orb.position.copy(dodec.position);
  orb.rotation.x = Math.PI / 2.5;
  scene.add(orb);

  const pts = addParticles(scene, 380, [20, 14, 7], 0xd4af37, 0.012, 0.25);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth-.5)*2; my = (e.clientY/innerHeight-.5)*2; });

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx += (mx-tx)*.03; ty += (my-ty)*.03;
    dodec.rotation.x = t*.12 + ty*.15; dodec.rotation.y = t*.19 + tx*.15;
    inner.rotation.x = -t*.18; inner.rotation.y = t*.26;
    orb.rotation.z = t*.08;
    pts.rotation.y = t*.022;
    renderer.render(scene, camera);
  })();
  onResize(camera, renderer);
}

/* ── Education: Helix tube — journey, growth, progression ── */
function buildEduScene(canvas) {
  const scene = new THREE.Scene(), camera = makeCamera(), renderer = makeRenderer(canvas);
  const clock = new THREE.Clock();

  /* Double helix */
  function makeHelix(phase, color, opacity) {
    const points = [];
    for (let i = 0; i < 220; i++) {
      const t = i / 220;
      const angle = t * Math.PI * 10 + phase;
      points.push(new THREE.Vector3(Math.cos(angle) * 1.3, t * 14 - 7, Math.sin(angle) * 1.3));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo   = new THREE.TubeGeometry(curve, 300, 0.022, 6, false);
    const mat   = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    const mesh  = new THREE.Mesh(geo, mat);
    mesh.position.set(3.2, 0, -2);
    scene.add(mesh);
    return mesh;
  }

  const helix1 = makeHelix(0,          0x818cf8, 0.16);
  const helix2 = makeHelix(Math.PI,    0xd4af37, 0.12);

  /* Cross-rungs connecting helices */
  const rungMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.08 });
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const angle = t * Math.PI * 10;
    const y = t * 14 - 7;
    const p1 = new THREE.Vector3(Math.cos(angle) * 1.3 + 3.2, y, Math.sin(angle) * 1.3 - 2);
    const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * 1.3 + 3.2, y, Math.sin(angle + Math.PI) * 1.3 - 2);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), rungMat));
  }

  const pts = addParticles(scene, 360, [20, 16, 8], 0x818cf8, 0.01, 0.25);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth-.5)*2; my = (e.clientY/innerHeight-.5)*2; });

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx += (mx-tx)*.03; ty += (my-ty)*.03;
    [helix1, helix2].forEach(h => { h.rotation.y = t*.12 + tx*.1; });
    pts.rotation.y = t*.018;
    renderer.render(scene, camera);
  })();
  onResize(camera, renderer);
}

/* ── Projects: Network nodes — code, connections, systems ── */
function buildProjectsScene(canvas) {
  const scene = new THREE.Scene(), camera = makeCamera(), renderer = makeRenderer(canvas);
  const clock = new THREE.Clock();

  /* Node positions (spread across viewport) */
  const nodePositions = [
    [2.5,  1.2, -1.5],  [-3.0,  0.8, -2.0],  [3.8, -0.5, -2.5],
    [-2.2, -1.4, -1.8], [1.0,  2.4, -2.2],   [-1.0, -2.8, -2.0],
    [4.2,  1.8, -3.0],  [-3.8, -0.3, -2.8],  [0.5, -1.8, -1.5],
    [2.0, -2.6, -2.2],  [-1.8,  2.0, -2.5],  [3.0,  0.0, -1.8]
  ];

  const nodeMat  = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.55 });
  const nodes    = nodePositions.map(([x,y,z]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), nodeMat);
    m.position.set(x, y, z);
    scene.add(m);
    return m;
  });

  /* Edges — connect each node to 2 neighbours */
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.11 });
  nodes.forEach((n, i) => {
    [1, 3, 5].forEach(step => {
      const target = nodes[(i + step) % nodes.length];
      const geo = new THREE.BufferGeometry().setFromPoints([n.position, target.position]);
      scene.add(new THREE.Line(geo, edgeMat));
    });
  });

  /* Gold accent node (center/hub) */
  const hub = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 1),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.5 })
  );
  hub.position.set(0.8, 0.2, -1.2);
  scene.add(hub);

  const pts = addParticles(scene, 350, [22, 14, 8], 0x818cf8, 0.01, 0.22);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth-.5)*2; my = (e.clientY/innerHeight-.5)*2; });

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx += (mx-tx)*.03; ty += (my-ty)*.03;
    hub.rotation.x = t*.3; hub.rotation.y = t*.4;
    /* Gentle pulse on nodes */
    nodes.forEach((n, i) => {
      n.scale.setScalar(1 + Math.sin(t * 1.2 + i * 0.8) * 0.15);
    });
    pts.rotation.y = t*.016;
    renderer.render(scene, camera);
  })();
  onResize(camera, renderer);
}

/* ══════════════════════════════════════════════
   SKILL RADAR CHART
══════════════════════════════════════════════ */
function initRadarChart() {
  const svg = document.getElementById('radar-svg');
  if (!svg) return;

  const skills = [
    { label: 'Lua',        value: 0.85 },
    { label: 'Python',     value: 0.80 },
    { label: 'HTML/CSS',   value: 0.75 },
    { label: 'SQL',        value: 0.70 },
    { label: 'JavaScript', value: 0.60 },
    { label: 'XML',        value: 0.65 }
  ];

  const cx = 110, cy = 110, r = 85, n = skills.length;
  const NS = 'http://www.w3.org/2000/svg';

  /* Grid rings */
  [0.25, 0.5, 0.75, 1].forEach(scale => {
    const pts = skills.map((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + Math.cos(angle) * r * scale},${cy + Math.sin(angle) * r * scale}`;
    }).join(' ');
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('class', 'radar-grid');
    svg.appendChild(poly);
  });

  /* Axes */
  skills.forEach((_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const line  = document.createElementNS(NS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + Math.cos(angle) * r);
    line.setAttribute('y2', cy + Math.sin(angle) * r);
    line.setAttribute('class', 'radar-axis');
    svg.appendChild(line);
  });

  /* Data polygon */
  const dataPoints = skills.map((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${cx + Math.cos(angle) * r * s.value},${cy + Math.sin(angle) * r * s.value}`;
  }).join(' ');
  const dataPoly = document.createElementNS(NS, 'polygon');
  dataPoly.setAttribute('points', dataPoints);
  dataPoly.setAttribute('class', 'radar-poly');
  svg.appendChild(dataPoly);

  /* Dots */
  skills.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const dot   = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', cx + Math.cos(angle) * r * s.value);
    dot.setAttribute('cy', cy + Math.sin(angle) * r * s.value);
    dot.setAttribute('r', '3');
    dot.setAttribute('class', 'radar-dot');
    svg.appendChild(dot);
  });

  /* Labels */
  skills.forEach((s, i) => {
    const angle   = (i / n) * Math.PI * 2 - Math.PI / 2;
    const labelR  = r + 18;
    const text    = document.createElementNS(NS, 'text');
    text.setAttribute('x', cx + Math.cos(angle) * labelR);
    text.setAttribute('y', cy + Math.sin(angle) * labelR + 4);
    text.setAttribute('class', 'radar-label');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = s.label;
    svg.appendChild(text);
  });

  /* Animate on scroll into view */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { dataPoly.classList.add('animated'); observer.disconnect(); }
  }, { threshold: 0.4 });
  observer.observe(svg);
}

/* ══════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════ */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending…</span>';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.reset();
        if (status) { status.textContent = '✦ Message sent! I\'ll reply soon.'; status.classList.add('visible'); }
      } else {
        throw new Error();
      }
    } catch {
      if (status) { status.textContent = '✦ Something went wrong — email me directly.'; status.classList.add('visible'); }
    }

    btn.innerHTML = orig;
    btn.disabled = false;
    setTimeout(() => status?.classList.remove('visible'), 5000);
  });
}

/* ══════════════════════════════════════════════
   HERO ENTRANCE
══════════════════════════════════════════════ */
function revealHero() {
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 120);
  });
  initTypewriter();
}

/* ══════════════════════════════════════════════
   PHOTO PARALLAX
══════════════════════════════════════════════ */
function initPhotoParallax() {
  if (REDUCED_MOTION) return;
  const wrap = document.getElementById('photo-parallax-wrap');
  if (!wrap) return;
  window.addEventListener('scroll', () => {
    wrap.style.transform = `translateY(${scrollY * 0.12}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   GSAP LETTER REVEAL
══════════════════════════════════════════════ */
function initLetterReveal() {
  if (REDUCED_MOTION) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.section-title em').forEach(el => {
    const text  = el.textContent;
    el.innerHTML = text.split('').map(ch =>
      `<span class="ls" style="display:inline-block;overflow:hidden"><span class="ls-inner" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span></span>`
    ).join('');

    gsap.from(el.querySelectorAll('.ls-inner'), {
      y: '110%', opacity: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let rx = 0, ry = 0, dx = 0, dy = 0;
  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  (function moveCursor() {
    rx = lerp(rx, dx, 0.12); ry = lerp(ry, dy, 0.12);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(moveCursor);
  })();

  const hoverEls = 'a, button, [data-magnetic], .tilt-card, .bento-cell, .info-panel, .cert-visual, .edu-card, input, textarea';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ══════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * 0.28;
      const y = (e.clientY - r.top  - r.height/2) * 0.28;
      el.style.transform  = `translate(${x}px,${y}px)`;
      el.style.transition = 'transform 0.15s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform  = '';
      el.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
    });
  });
}

/* ══════════════════════════════════════════════
   3D TILT CARDS
══════════════════════════════════════════════ */
function initTilt() {
  document.querySelectorAll('.tilt-card, .info-panel').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      const intensity = card.classList.contains('info-panel') ? 8 : 14;
      card.style.transform  = `perspective(900px) rotateY(${x*intensity}deg) rotateX(${-y*intensity}deg) scale3d(1.02,1.02,1.02)`;
      card.style.transition = 'transform 0.12s ease';
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.setProperty('--gx', ((x+0.5)*100)+'%');
        glow.style.setProperty('--gy', ((y+0.5)*100)+'%');
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(900px) rotateY(0) rotateX(0) scale3d(1,1,1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    });
  });
}

/* ══════════════════════════════════════════════
   PHOTO CARD 3D TILT
══════════════════════════════════════════════ */
function initPhotoTilt() {
  const card = document.getElementById('photo-card');
  if (!card) return;
  document.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const x  = (e.clientX - cx) / (innerWidth / 2);
    const y  = (e.clientY - cy) / (innerHeight / 2);
    card.style.transform  = `perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
    card.style.transition = 'transform 0.2s ease';
  });
}

/* ══════════════════════════════════════════════
   CERT IMAGE PARALLAX
══════════════════════════════════════════════ */
function initCertParallax() {
  document.querySelectorAll('.cert-card').forEach(card => {
    const img = card.querySelector('.cert-visual img');
    if (!img) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      img.style.transform  = `scale(1.05) translate(${x*8}px, ${y*8}px)`;
      img.style.transition = 'transform 0.2s ease';
    });
    card.addEventListener('mouseleave', () => {
      img.style.transform  = 'scale(1) translate(0,0)';
      img.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    });
  });
}

/* ══════════════════════════════════════════════
   EDUCATION TIMELINE RAIL
══════════════════════════════════════════════ */
function initTimelineRail() {
  const rail = document.getElementById('timeline-rail');
  if (!rail) return;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { rail.classList.add('animated'); observer.disconnect(); }
  }, { threshold: 0.1 });
  observer.observe(rail);
}

/* ══════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    bar.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   NAV SCROLL
══════════════════════════════════════════════ */
function initNavScroll() {
  const nav = document.getElementById('top-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
}

/* ══════════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════════ */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const mn  = document.getElementById('mobile-nav');
  if (!btn || !mn) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mn.classList.toggle('open');
    document.body.style.overflow = mn.classList.contains('open') ? 'hidden' : '';
  });
  mn.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open'); mn.classList.remove('open'); document.body.style.overflow = '';
  }));
}

/* ══════════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el     = entry.target;
      const target = +el.getAttribute('data-target');
      const suffix = el.getAttribute('data-suffix') || '';
      const dur    = 1600, start = performance.now();
      function tick(now) {
        const p = Math.min((now-start)/dur, 1), ease = 1-Math.pow(1-p,4);
        el.textContent = Math.floor(ease*target) + (p >= 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  els.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════
   EDUCATION CARD REVEAL
══════════════════════════════════════════════ */
function initEduReveal() {
  const cards = document.querySelectorAll('.edu-card');
  if (!cards.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  cards.forEach((card, i) => { card.style.setProperty('--delay', (i * 0.1) + 's'); observer.observe(card); });
}

/* ══════════════════════════════════════════════
   INFO ROW STAGGER REVEAL
══════════════════════════════════════════════ */
function initInfoRows() {
  const panels = document.querySelectorAll('.info-panel');
  if (!panels.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.querySelectorAll('.info-row').forEach((row, i) => {
        setTimeout(() => row.classList.add('row-visible'), i * 80);
      });
    });
  }, { threshold: 0.2 });
  panels.forEach(p => observer.observe(p));
}

/* ══════════════════════════════════════════════
   SKILL BARS
══════════════════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('animated'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  fills.forEach(f => observer.observe(f));
}

/* ══════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════ */
function initLightbox() {
  const lb  = document.querySelector('.lightbox');
  const img = lb?.querySelector('img');
  const cls = lb?.querySelector('.lightbox-close');
  if (!lb) return;

  document.querySelectorAll('.cert-visual').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const src = wrap.querySelector('img')?.src;
      if (src) { img.src = src; lb.classList.add('active'); }
    });
  });

  cls?.addEventListener('click', () => lb.classList.remove('active'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('active'); });
}

/* ══════════════════════════════════════════════
   PERSONAL HERO REVEAL
══════════════════════════════════════════════ */
function initPersonalHero() {
  const hero = document.querySelector('.personal-hero');
  if (!hero) return;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) hero.classList.add('visible');
  }, { threshold: 0.3 });
  observer.observe(hero);
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initThemeToggle();
  initLoader();
  initThree();
  initSubpageCanvas();
  initCursor();
  initCursorLabel();
  initMagnetic();
  initTilt();
  initPhotoTilt();
  initPhotoParallax();
  initCertParallax();
  initTimelineRail();
  initScrollProgress();
  initNavScroll();
  initHamburger();
  initCounters();
  initReveal();
  initEduReveal();
  initInfoRows();
  initSkillBars();
  initLightbox();
  initPersonalHero();
  initTextScramble();
  initCopyToast();
  initScrollToTop();
  initLetterReveal();
  initRadarChart();
  initContactForm();
  initKonami();
});
