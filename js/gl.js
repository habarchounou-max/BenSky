/* ==========================================================================
   BEN SKY TECH — Fond WebGL : champ de pixels vivant (clin d'œil au logo)
   Un seul shader plein écran, aucune bibliothèque. Pause hors écran, repli si WebGL absent.
   ========================================================================== */
(() => {
  'use strict';
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uCell; uniform float uDark; uniform float uScroll; uniform float uNarrow;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.02; a *= .5; } return v; }
void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(frag / uCell);
  vec2 local = fract(frag / uCell);
  vec2 center = (cell + .5) * uCell;
  float asp = uRes.x / uRes.y;
  vec2 p = center / uRes.y;
  float t = uTime;
  float d1 = distance(p, vec2(asp * 1.02, -0.02 - uScroll * .0));
  float d2 = distance(p, vec2(-0.02, 1.02));
  float right = mix(smoothstep(.34 * asp, .8 * asp, p.x), smoothstep(.45, .95, p.x / asp) * (1. - smoothstep(.0, .55, p.y)) , uNarrow);
  float base = (1. - smoothstep(.05, 1.15, d1)) * (.03 + .97 * right) + .32 * (1. - smoothstep(0., .42, d2));
  float n = fbm(p * 3.2 + vec2(t * .045, -t * .035));
  float field = base * smoothstep(.30, .85, n + base * .38);
  float wave = .5 + .5 * sin(d1 * 7. - t * .9);
  field *= .62 + .38 * wave;
  float md = distance(center, uMouse);
  float m = exp(-pow(md / (uCell * 7.), 2.));
  field = clamp(field + m * .85, 0., 1.);
  float h = hash(cell + 7.1);
  float r = hash(cell + 3.7);
  float lit = smoothstep(r - .06, r + .03, field * 1.3 - .1);
  float tw = .72 + .28 * sin(t * 1.3 + h * 6.283);
  float a = lit * tw * (.42 + .58 * pow(h, 1.4));
  vec2 q = abs(local - .5) - vec2(.5 - .11 - .15);
  float dist = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - .15;
  float mask = 1. - smoothstep(-.03, .03, dist);
  vec3 blue = vec3(.184, .42, 1.), cyan = vec3(.24, .85, 1.), deep = vec3(.12, .31, .85);
  vec3 col = mix(blue, cyan, smoothstep(.35, .95, h * .6 + field * .55 + m));
  col = mix(col, deep, (1. - uDark) * .18 * (1. - h));
  float alpha = a * mask * mix(.92, .55, uNarrow);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = Object.fromEntries(['uRes', 'uTime', 'uMouse', 'uCell', 'uDark', 'uScroll', 'uNarrow'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  const root = document.documentElement;
  const hero = canvas.closest('.hero');
  let dpr = 1, W = 0, H = 0, visible = true, raf = 0;
  const mouse = { x: -1e5, y: -1e5, tx: -1e5, ty: -1e5 };
  let dark = root.dataset.theme === 'dark' ? 1 : 0;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
  };

  const draw = (now) => {
    mouse.x += (mouse.tx - mouse.x) * .12; mouse.y += (mouse.ty - mouse.y) * .12;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uTime, reduce ? 4 : now / 1000);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uCell, (W < 700 * dpr ? 15 : 19) * dpr);
    gl.uniform1f(U.uDark, dark);
    gl.uniform1f(U.uScroll, 0);
    gl.uniform1f(U.uNarrow, W < 960 * dpr ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => { draw(now); raf = visible ? requestAnimationFrame(loop) : 0; };
  const start = () => { if (!raf && visible && !reduce) raf = requestAnimationFrame(loop); };

  resize(); draw(0);
  new ResizeObserver(() => { resize(); draw(performance.now()); }).observe(canvas);
  new MutationObserver(() => { dark = root.dataset.theme === 'dark' ? 1 : 0; draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  if (!reduce) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(canvas);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) start(); });
    hero?.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) * dpr; mouse.ty = (e.clientY - r.top) * dpr;
      if (mouse.x < -1e4) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    });
    hero?.addEventListener('pointerleave', () => { mouse.tx = mouse.ty = -1e5; });
    start();
  }
})();
