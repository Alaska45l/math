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
  const el = document.createElement(tag);
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
