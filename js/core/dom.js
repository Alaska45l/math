/**
 * dom.js — Helpers de selección segura, creación de nodos HTML/SVG,
 * delegación de eventos y un store mínimo para el patrón unidireccional
 * (state → compute(state) → render(state, computed)).
 */

export const SVG_NS = 'http://www.w3.org/2000/svg';

/** Selección segura: lanza un error claro si el nodo no existe. */
export function byId(id, root = document) {
  const el = root.getElementById ? root.getElementById(id) : root.querySelector(`#${id}`);
  if (!el) throw new Error(`[dom] No existe el elemento #${id}`);
  return el;
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Aplica atributos a un nodo (HTML o SVG). */
function applyAttrs(el, attrs) {
  if (!attrs) return;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') {
      el.setAttribute('class', Array.isArray(value) ? value.filter(Boolean).join(' ') : value);
    } else if (key === 'text') {
      el.textContent = String(value);
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value)) el.dataset[dk] = dv;
    } else if (key === 'on') {
      for (const [type, fn] of Object.entries(value)) el.addEventListener(type, fn);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false || child === '') continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Crea un elemento HTML: h('div', {class:'x'}, 'texto', otroNodo) */
export function h(tag, attrs, ...children) {
  const el = tag === 'svg' ? document.createElementNS(SVG_NS, 'svg') : document.createElement(tag);
  applyAttrs(el, attrs);
  appendChildren(el, children);
  return el;
}

/** Crea un elemento SVG: s('circle', {cx, cy, r}) */
export function s(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  applyAttrs(el, attrs);
  appendChildren(el, children);
  return el;
}

/**
 * Icono vectorial estilo tiza:
 * lock, check, cross, tutor/glasses, smug/star, drop/sweat, anger,
 * smile/spark, print, shield, book, play, hint, reset, target,
 * dot-open, dot-closed.
 */
export function chalkIcon(type, attrs = {}) {
  const { class: customClass, ...restAttrs } = attrs;
  const fullClass = customClass
    ? `chalk-icon chalk-icon--${type} ${customClass}`
    : `chalk-icon chalk-icon--${type}`;
  const icon = s('svg', {
    viewBox: '0 0 16 16',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
    ...restAttrs,
    class: fullClass,
  });

  if (type === 'lock') {
    icon.append(
      s('rect', { x: 3, y: 7, width: 10, height: 8, rx: 1.5 }),
      s('path', { d: 'M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7' })
    );
  } else if (type === 'check') {
    icon.append(s('path', { d: 'M3 8.5l3.5 3.5 6.5-8' }));
  } else if (type === 'cross') {
    icon.append(s('path', { d: 'M4 4l8 8M12 4l-8 8' }));
  } else if (type === 'tutor' || type === 'glasses') {
    icon.append(
      s('circle', { cx: 4.5, cy: 9, r: 2.8 }),
      s('circle', { cx: 11.5, cy: 9, r: 2.8 }),
      s('path', { d: 'M7.3 9h1.4M1.7 8.5L3 5M14.3 8.5L13 5' })
    );
  } else if (type === 'smug' || type === 'star') {
    icon.append(
      s('path', { d: 'M8 1.8l1.6 3.8 4.1.4-3.1 2.7.9 4-3.5-2.1-3.5 2.1.9-4-3.1-2.7 4.1-.4L8 1.8z' })
    );
  } else if (type === 'drop' || type === 'sweat') {
    icon.append(
      s('path', { d: 'M8 2.2C8 2.2 4 7.2 4 10.2a4 4 0 0 0 8 0c0-3-4-8-4-8z' }),
      s('path', { d: 'M6.5 10.5a1.8 1.8 0 0 0 1.5 1.5' })
    );
  } else if (type === 'anger') {
    icon.append(
      s('path', { d: 'M3 6.5c2.2 0 3.5-1.3 3.5-3.5M9.5 3c0 2.2 1.3 3.5 3.5 3.5M13 9.5c-2.2 0-3.5 1.3-3.5 3.5M6.5 13c0-2.2-1.3-3.5-3.5-3.5' })
    );
  } else if (type === 'smile' || type === 'spark') {
    icon.append(
      s('path', { d: 'M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.6 3.6l2 2M10.4 10.4l2 2M12.4 3.6l-2 2M5.6 10.4l-2 2' })
    );
  } else if (type === 'print') {
    icon.append(
      s('path', { d: 'M4.5 5.5V2.5h7v3' }),
      s('rect', { x: 2.5, y: 5.5, width: 11, height: 6, rx: 1 }),
      s('rect', { x: 4.5, y: 9.5, width: 7, height: 4 })
    );
  } else if (type === 'shield') {
    icon.append(
      s('path', { d: 'M8 1.8l5.2 2.2v3.8c0 3.5-2.2 5.5-5.2 6.6-3-1.1-5.2-3.1-5.2-6.6V4L8 1.8z' }),
      s('path', { d: 'M8.5 5.2L6.5 8.5h3L7.5 11.8' })
    );
  } else if (type === 'book') {
    icon.append(
      s('path', { d: 'M2 3.5h4.5a1.5 1.5 0 0 1 1.5 1.5v8a1.2 1.2 0 0 0-1.2-1.2H2V3.5z' }),
      s('path', { d: 'M14 3.5H9.5A1.5 1.5 0 0 0 8 5v8a1.2 1.2 0 0 1 1.2-1.2H14V3.5z' })
    );
  } else if (type === 'play') {
    icon.append(
      s('polygon', { points: '4.5,3 12.5,8 4.5,13' })
    );
  } else if (type === 'hint') {
    icon.append(
      s('path', { d: 'M5.5 10.2A4 4 0 1 1 10.5 10.2c-.5.5-.8 1.1-.8 1.8H6.3c0-.7-.3-1.3-.8-1.8z' }),
      s('path', { d: 'M6.5 14h3' })
    );
  } else if (type === 'reset') {
    icon.append(
      s('path', { d: 'M3.2 6.5A5 5 0 1 1 4 11.5' }),
      s('path', { d: 'M2.5 3.5v3.2h3.2' })
    );
  } else if (type === 'target') {
    icon.append(
      s('circle', { cx: 8, cy: 8, r: 5.2 }),
      s('circle', { cx: 8, cy: 8, r: 1.8 }),
      s('path', { d: 'M8 1.2v2M8 12.8v2M1.2 8h2M12.8 8h2' })
    );
  } else if (type === 'dot-open') {
    icon.append(
      s('circle', { cx: 8, cy: 8, r: 4.5, fill: 'var(--bg, #1b261e)', 'stroke-width': '2.2' })
    );
  } else if (type === 'dot-closed') {
    icon.append(
      s('circle', { cx: 8, cy: 8, r: 4.5, fill: 'currentColor', 'stroke-width': '2.2' })
    );
  }
  return icon;
}

/** Reemplaza todos los hijos del nodo. */
export function mount(el, ...children) {
  el.replaceChildren();
  appendChildren(el, children);
  return el;
}

/**
 * Registro de eventos con delegación opcional.
 *   on(root, 'click', handler)
 *   on(root, 'click', 'button[data-k]', (e, matched) => ...)
 */
export function on(target, type, selectorOrHandler, maybeHandler) {
  if (typeof selectorOrHandler === 'function') {
    target.addEventListener(type, selectorOrHandler);
    return () => target.removeEventListener(type, selectorOrHandler);
  }
  const listener = (e) => {
    const matched = e.target.closest(selectorOrHandler);
    if (matched && target.contains(matched)) maybeHandler(e, matched);
  };
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
}

/** Alterna aria-pressed en un botón conmutable. */
export function setPressed(btn, pressed) {
  btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

/**
 * Store mínimo e inmutable (copia superficial congelada en cada cambio).
 * set acepta un objeto parcial o una función (state) => parcial.
 */
export function createStore(initial) {
  let state = Object.freeze({ ...initial });
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = Object.freeze({ ...state, ...p });
      subs.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

/** Conecta store + compute + render y dispara un primer render. */
export function connect(store, compute, render) {
  const run = (st) => render(st, compute(st));
  store.subscribe(run);
  run(store.get());
  return () => run(store.get());
}

/** Posición del puntero en coordenadas del viewBox de un SVG. */
export function svgPoint(svgEl, evt) {
  const pt = svgEl.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svgEl.getScreenCTM();
  return ctm ? pt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
}
