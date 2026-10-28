/**
 * dimensional/render.js — Vista del laboratorio de unidades.
 * Toda razón entre unidades se muestra con fracción horizontal (.fr).
 */
import { h, s, mount } from '../../core/dom.js';
import { fmt, frac } from '../../core/math-format.js';
import { FACTORS, PROBLEMS, CUBE_PROBLEM } from './logic.js';

const F6 = (n) => fmt(n, 6);
const dot = () => h('span', { class: 'dot' }, '·');
const join = (nodes) => nodes.flatMap((n, i) => (i ? [dot(), n] : [n]));
const sup = (e) => (e > 1 ? h('sup', null, String(e)) : null);
const numNode = (n) => (n === null || n === undefined ? null : h('span', { class: 'num' }, F6(n)));

/** Ficha con silueta SVG de pin (numerador) o hueco (denominador) con knob incluido y fondo transparente. */
export const token = (u, side, status, extra = null) => {
  const isPin = side === 'n';
  const isSocket = side === 'd';
  const shape = s('svg', {
    class: 'token__shape',
    viewBox: '0 0 100 60',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  },
    s('path', {
      d: isPin
        ? 'M 12 16 L 36 16 C 36 6, 64 6, 64 16 L 88 16 C 96 16, 100 20, 100 28 L 100 48 C 100 56, 96 60, 88 60 L 12 60 C 4 60, 0 56, 0 48 L 0 28 C 0 20, 4 16, 12 16 Z'
        : isSocket
        ? 'M 12 0 L 88 0 C 96 0, 100 4, 100 12 L 100 32 C 100 40, 96 44, 88 44 L 64 44 C 64 34, 36 34, 36 44 L 12 44 C 4 44, 0 40, 0 32 L 0 12 C 0 4, 4 0, 12 0 Z'
        : 'M 10 2 L 90 2 C 96 2, 98 4, 98 10 L 98 50 C 98 56, 96 58, 90 58 L 10 58 C 4 58, 2 56, 2 50 L 2 10 C 2 4, 4 2, 10 2 Z',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
      'vector-effect': 'non-scaling-stroke',
    })
  );

  return h('span', { class: ['token', isPin ? 'token--pin' : 'token--socket', `token--${status}`] },
    shape,
    h('span', { class: 'token__text' }, u, extra)
  );
};

/** Neutro multiplicativo: pareja pin/socket tachada con diagonal 1.5px y 1 manuscrito en --green. */
const neutralOne = (u, fresh, side = 'd') =>
  h('span', { class: ['one', fresh && 'is-fresh'], title: `${u} sobre ${u} = 1` },
    h('span', { class: ['one__token', 'tachado--green'] },
      token(u, side, 'neutral')
    ),
    h('span', { class: 'one__num', 'aria-hidden': 'true' }, '1')
  );

/** Mapa de unidades → nodo (fracción de dos pisos si hay denominador). */
export function unitNode(m, status = null) {
  const top = [], bot = [];
  Object.entries(m).forEach(([u, e]) => {
    const node = status ? token(u, e > 0 ? 'n' : 'd', status, sup(Math.abs(e))) : h('span', null, u, sup(Math.abs(e)));
    (e > 0 ? top : bot).push(node);
  });
  if (!top.length) top.push(h('span', null, '1'));
  return bot.length ? frac(join(top), join(bot), { className: 'fr--sm' }) : h('span', null, join(top));
}

function termNode(t) {
  const item = (x) => (x.pair !== undefined ? neutralOne(x.u, x.fresh, x.side) : token(x.u, x.side, x.status));
  const top = [numNode(t.nv), ...join(t.n.map(item))];
  if (!t.d.length) return h('span', { class: 'fr' }, h('span', { class: 'top' }, top));
  return frac(top, [numNode(t.dv), ...join(t.d.map(item))]);
}

export function renderExpression(root, state, c) {
  const p = c.problem;
  const resTop = [], resBot = [];
  Object.entries(c.remaining).forEach(([u, e]) => {
    (e > 0 ? resTop : resBot).push(token(u, e > 0 ? 'n' : 'd', p.to[u] === e ? 'wanted' : 'pending', sup(Math.abs(e))));
  });
  const valTop = [numNode(c.value), ...join(resTop)];
  const result = resBot.length ? frac(valTop, join(resBot)) : h('span', { class: 'fr' }, h('span', { class: 'top' }, valTop));
  const parts = c.terms.flatMap((t, i) => (i ? [h('span', { class: 'op' }, '×'), termNode(t)] : [termNode(t)]));
  mount(root, parts, h('span', { class: 'op' }, '='), result);
}

export function renderGoal(root, state, c) {
  const p = c.problem;
  mount(root, 'Objetivo: transformar ',
    h('strong', { class: 'dim-inline' }, F6(state.v), ' ', unitNode(p.from)),
    ' en ', h('strong', { class: 'dim-inline' }, unitNode(p.to)), '.');
}

export function renderStatus(root, state, c) {
  const p = c.problem;
  let msg;
  switch (c.msgKind) {
    case 'start':
      msg = ['Elegí un factor: buscá un pin y un hueco con el mismo nombre. Al unirse forman explícitamente el neutro multiplicativo 1.'];
      break;
    case 'solved':
      msg = ['Listo: ', h('span', { class: 'dim-inline' }, F6(state.v), ' ', unitNode(p.from)), ' = ',
        h('span', { class: 'dim-inline' }, F6(c.value), ' ', unitNode(p.to)),
        '. Cada pareja encastrada vale 1; la dimensión que permanece es la pedida.'];
      break;
    case 'stacked':
      msg = ['Hay unidades apiladas: dos pines o dos huecos no pueden encastrar. Deshacé ese factor y usá la fracción con la orientación opuesta.'];
      break;
    default:
      msg = ['Ahora tenés ', h('span', { class: 'dim-inline' }, unitNode(c.remaining)),
        '. Seguí encastrando las unidades que no pertenecen al objetivo.'];
  }
  if (c.predictionOk !== null) msg.push(` Tu predicción fue ${c.predictionOk ? 'correcta' : 'al revés'}.`);
  mount(root, msg);
}

export function renderMiddle(root, state, c) {
  const p = c.problem;
  const numTop = [h('span', { class: 'num' }, F6(state.v)), ...state.steps.flatMap((st) => [h('span', { class: 'op' }, '×'), h('span', { class: 'num' }, F6(st.top[0]))])];
  const numBot = state.steps.length
    ? state.steps.flatMap((st, i) => [i ? h('span', { class: 'op' }, '×') : null, h('span', { class: 'num' }, F6(st.bot[0]))])
    : [h('span', { class: 'num' }, '1')];

  const allTop = c.terms.flatMap((t) => t.n), allBot = c.terms.flatMap((t) => t.d);
  const uItem = (x) => (x.pair !== undefined ? token(x.u, x.side, 'neutral') : token(x.u, x.side, x.status));
  const unitTop = allTop.length ? join(allTop.map(uItem)) : ['1'];
  const unitBot = allBot.length ? join(allBot.map(uItem)) : ['1'];

  mount(root,
    h('strong', null, 'Paso intermedio: la conmutatividad permite reordenar y agrupar los factores'),
    h('div', { class: 'dim-groups' },
      h('div', { class: 'dim-group' }, frac(numTop, numBot), h('small', null, `Cálculo numérico puro: ${F6(c.value)}`)),
      h('span', { class: 'op' }, '×'),
      h('div', { class: 'dim-group' }, frac(unitTop, unitBot), h('small', null, 'Cocientes de unidades: cada pareja verde forma el neutro 1')),
      h('span', { class: 'op' }, '='),
      h('div', { class: 'dim-group' }, unitNode(c.remaining), h('small', null, 'Dimensión remanente')),
    ),
    h('p', { class: 'muted small' }, 'Los factores solo se agrupan: la cantidad multiplicada no cambia.'),
  );
  root.hidden = !state.middle;
}

export function renderLog(root, state, c) {
  if (!c.log.length) {
    mount(root, h('li', null, 'El registro mostrará cada encastre como una unidad completa (= 1).'));
    return;
  }
  mount(root, c.log.map((l) => {
    const st = l.step;
    const factor = frac([h('span', { class: 'num' }, F6(st.top[0])), ' ', st.top[1]], [h('span', { class: 'num' }, F6(st.bot[0])), ' ', st.bot[1]], { className: 'fr--sm' });
    const body = l.neutral
      ? ['El factor ', factor, ' encastra una pareja y forma el neutro multiplicativo 1.']
      : ['El factor ', factor, ' no encuentra su conector opuesto; deja ', unitNode(l.after), '.'];
    if (state.p === CUBE_PROBLEM && st.k === 'm_cm') body.push(' Neutraliza un solo factor cm de los tres que componen cm³.');
    return h('li', null, body);
  }));
}

export function renderPowerNote(root, state, c) {
  root.hidden = state.p !== CUBE_PROBLEM;
  if (root.hidden) return;
  const applied = Math.min(c.cubeApplied, 3);
  const slots = [0, 1, 2].map((i) => (i < applied ? neutralOne('cm', false, 'd') : token('cm', 'd', 'pending')));
  mount(root,
    h('strong', null, 'Autopsia de cm³'),
    h('p', null, 'El denominador es ', h('strong', null, 'cm · cm · cm'), ', no una sola ficha. Neutralizaste ',
      h('strong', null, `${applied} de 3`), ': ', join(slots)),
    h('p', { class: 'muted' }, 'El volumen tiene 3 dimensiones espaciales: hay que aplicar ',
      frac([h('span', { class: 'num' }, '100'), ' cm'], [h('span', { class: 'num' }, '1'), ' m'], { className: 'fr--sm' }),
      ' tres veces. Por eso el factor numérico es 100³ = 1.000.000.'),
  );
}

/** Botones de factores (se reconstruyen al cambiar de problema). */
export function renderTools(root, state) {
  const p = PROBLEMS[state.p];
  mount(root, p.facs.map((k) => {
    const f = FACTORS[k];
    const btn = (t, b, o, label) => h('button', { type: 'button', class: 'dim-tool__btn', dataset: { k, o }, 'aria-label': label },
      frac([h('span', { class: 'num' }, F6(t[0])), token(t[1], 'n', 'pending')], [h('span', { class: 'num' }, F6(b[0])), token(b[1], 'd', 'pending')]));
    return h('div', { class: 'dim-tool' },
      h('span', { class: 'label-sm' }, `1 ${f.a[1]} = ${F6(f.b[0])} ${f.b[1]}`),
      btn(f.b, f.a, 0, `${F6(f.b[0])} ${f.b[1]} sobre ${F6(f.a[0])} ${f.a[1]}`),
      btn(f.a, f.b, 1, `${F6(f.a[0])} ${f.a[1]} sobre ${F6(f.b[0])} ${f.b[1]}`));
  }));
}
