/**
 * @file js/modules/polinomios/widgets/inspector-polinomios.js
 * Widget 1 (Sec 1): Inspector estructural de polinomios vs no-polinomios.
 * 2-stage POE + casilleros de potencias x^5..x^0 + alerta visual de exponentes inválidos.
 */

import {
  h,
  s,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  addChips,
  button,
  renderReadout,
  playClick,
} from '../../../core/board-kit.js';
import {
  parsePolynomialExpr,
  inspectPolynomial,
  formatPoly,
  ratToString,
  isOneRat,
} from '../logic.js';

const PRESETS = [
  ['std', '5 + x^3 - 2x^4', 'Desordenado (5 + x³ − 2x⁴)'],
  ['frac', '2x^4 - 3x^2 + 1/2 x - 2', 'Incompleto con ½x'],
  ['monic', 'x^3 - 5x + 1', 'Mónico (x³ − 5x + 1)'],
  ['const', '5', 'Constante (5)'],
  ['zero', '0', 'Polinomio nulo (0)'],
  ['trap_rat', '5 / (3x - 1)', 'Trampa: 5/(3x−1)'],
  ['trap_neg', 'x^(-2) + 3x', 'Trampa: x⁻² + 3x'],
  ['trap_rad', '√x + 2', 'Trampa: √x + 2'],
];

export function initInspectorPolinomios(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    preset: 'std',
    expr: '5 + x^3 - 2x^4',
    sortDesc: true,
    showZeros: false,
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'En P(x) = 5 + x³ − 2x⁴, ¿cuál es su grado y su coeficiente principal?',
    options: [
      {
        label: 'Grado 0 y coeficiente principal 5 (porque aparece primero)',
        correct: false,
        explanation:
          'El primer término escrito a la izquierda no manda cuando el polinomio está desordenado: el término de mayor exponente es −2x⁴, así que gr(P) = 4 y a₄ = −2.',
      },
      {
        label: 'Grado 4 y coeficiente principal −2',
        correct: true,
        explanation:
          '¡Exacto! El grado y el coeficiente principal pertenecen siempre al término de mayor exponente de x (−2x⁴), sin importar en qué orden estén escritos.',
      },
      {
        label: 'Grado 3 y coeficiente principal 1',
        correct: false,
        explanation:
          'Observá el último término −2x⁴: exponente 4 supera a 3, por lo que manda el grado 4 y su coeficiente −2.',
      },
    ],
    onVerify: (opt) => {
      store.set({ preset: 'std', expr: '5 + x^3 - 2x^4', sortDesc: true, showZeros: true });
    },
  });

  const board = createBoard(host, 'Inspector estructural de polinomios', '0 0 640 250', {
    prefix: 'poly',
  });
  host.prepend(predictBox);

  const inputRow = h('div', { class: 'poly-inline-input-row' });
  const exprInput = h('input', {
    type: 'text',
    class: 'pr-check-input',
    value: store.get().expr,
    'aria-label': 'Expresión a inspeccionar',
    placeholder: 'Ej: 5 + x^3 - 2x^4 o 5/(3x-1)',
  });
  const applyBtn = button('Inspeccionar', 'target', () => {
    playClick();
    predictBox.notifyInteraction();
    store.set({ preset: 'custom', expr: exprInput.value });
  }, 'pr-btn');
  inputRow.append(exprInput, applyBtn);

  exprInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyBtn.click();
    }
  });

  const updateChips = addChips(
    board.controls,
    PRESETS.map(([id, , label]) => [id, label]),
    store.get().preset,
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      const found = PRESETS.find(([pid]) => pid === id);
      if (found) {
        exprInput.value = found[1];
        store.set({ preset: id, expr: found[1] });
      }
    },
    'Ejemplos para inspeccionar'
  );
  board.controls.prepend(inputRow);

  const toggleSortBtn = button('Ordenar decreciente: Sí', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set((st) => ({ sortDesc: !st.sortDesc }));
  }, 'chip is-active');
  const toggleZerosBtn = button('Completar con 0x^k: No', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set((st) => ({ showZeros: !st.showZeros }));
  }, 'chip chip--ghost');
  board.actions.append(toggleSortBtn, toggleZerosBtn);

  // Persistent SVG scene groups
  const sceneGroup = s('g', { class: 'poly-inspector-scene' });
  board.drawing.append(sceneGroup);

  const render = (st) => {
    updateChips(st.preset);
    toggleSortBtn.textContent = `Ordenar decreciente: ${st.sortDesc ? 'Sí' : 'No'}`;
    toggleSortBtn.className = `chip ${st.sortDesc ? 'is-active' : 'chip--ghost'}`;
    toggleZerosBtn.textContent = `Completar con 0x^k: ${st.showZeros ? 'Sí' : 'No'}`;
    toggleZerosBtn.className = `chip ${st.showZeros ? 'is-active' : 'chip--ghost'}`;

    clear(sceneGroup);
    let parsed = null;
    let errorInfo = null;
    try {
      parsed = parsePolynomialExpr(st.expr);
    } catch (err) {
      errorInfo = {
        code: err.code || 'syntax_error',
        message: err.message,
      };
    }

    if (errorInfo) {
      sceneGroup.append(
        s('rect', {
          x: 24,
          y: 36,
          width: 592,
          height: 170,
          fill: 'rgba(235, 120, 100, 0.10)',
          stroke: 'var(--pink)',
          'stroke-width': 2,
          'stroke-dasharray': '6 4',
        }),
        s(
          'text',
          { x: 320, y: 82, 'text-anchor': 'middle', fill: 'var(--pink)', 'font-size': 18, 'font-weight': 'bold' },
          'NO ES UN POLINOMIO'
        ),
        s(
          'text',
          { x: 320, y: 116, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 15 },
          `Expresión analizada: ${st.expr}`
        ),
        s(
          'text',
          { x: 320, y: 150, 'text-anchor': 'middle', fill: 'var(--yellow)', 'font-size': 13.5 },
          errorInfo.message
        ),
        s(
          'text',
          { x: 320, y: 180, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12.5 },
          'Condición obligatoria: exponentes n en {0, 1, 2, ...} y sin x en denominadores o raíces.'
        )
      );

      renderReadout(board.readout, 'Diagnóstico estructural', [
        ['Estado', 'No es polinomio'],
        ['Causa', errorInfo.message],
      ]);
      return;
    }

    const info = inspectPolynomial(parsed.coeffs);
    if (info.isZero) {
      sceneGroup.append(
        s('rect', {
          x: 60,
          y: 48,
          width: 520,
          height: 146,
          fill: 'rgba(230, 211, 138, 0.08)',
          stroke: 'var(--yellow)',
          'stroke-width': 2,
        }),
        s(
          'text',
          { x: 320, y: 98, 'text-anchor': 'middle', fill: 'var(--yellow)', 'font-size': 22, 'font-weight': 'bold' },
          'P(x) = 0  (Polinomio nulo)'
        ),
        s(
          'text',
          { x: 320, y: 134, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14.5 },
          'Todos sus coeficientes valen 0. Por definición, NO TIENE GRADO.'
        ),
        s(
          'text',
          { x: 320, y: 164, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 13 },
          'Cuidado: una constante distinta de 0 (como 5) sí tiene grado 0.'
        )
      );

      renderReadout(board.readout, 'Ficha del polinomio nulo', [
        ['Grado gr(P)', 'No tiene grado'],
        ['Coef. principal', 'No definido (todos 0)'],
        ['Término indep.', '0'],
        ['¿Es mónico?', 'No'],
      ]);
      return;
    }

    const deg = info.degree;
    const slots = [];
    for (let d = deg; d >= 0; d--) {
      const c = parsed.coeffs[d];
      if (st.showZeros || c.n !== 0) {
        slots.push({ deg: d, coeff: c, isPlaceholder: c.n === 0 });
      }
    }
    if (!st.sortDesc) slots.reverse();

    const maxShow = Math.min(slots.length, 6);
    const cardW = Math.min(104, Math.floor(580 / Math.max(1, maxShow)) - 10);
    const totalW = maxShow * cardW + (maxShow - 1) * 10;
    const startX = (640 - totalW) / 2;

    sceneGroup.append(
      s(
        'text',
        { x: 320, y: 30, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 15, 'font-weight': 'bold' },
        `P(x) = ${formatPoly(parsed.coeffs, { order: st.sortDesc ? 'desc' : 'asc' })}`
      )
    );

    slots.slice(0, maxShow).forEach((slot, i) => {
      const x = startX + i * (cardW + 10);
      const y = 58;
      const isLead = slot.deg === deg;
      const isConst = slot.deg === 0;
      const strokeColor = slot.isPlaceholder
        ? 'rgba(236, 242, 232, 0.25)'
        : isLead
          ? 'var(--yellow)'
          : isConst
            ? 'var(--blue)'
            : 'var(--green)';
      const roleLabel = slot.isPlaceholder
        ? 'hueco (0)'
        : isLead
          ? 'principal'
          : isConst
            ? 'independ.'
            : `grado ${slot.deg}`;

      const cardG = s('g', {});
      cardG.append(
        s('rect', {
          x,
          y,
          width: cardW,
          height: 120,
          fill: slot.isPlaceholder ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
          stroke: strokeColor,
          'stroke-width': isLead ? 2.2 : 1.5,
          'stroke-dasharray': slot.isPlaceholder ? '4 4' : 'none',
        }),
        s(
          'text',
          { x: x + cardW / 2, y: y + 24, 'text-anchor': 'middle', fill: strokeColor, 'font-size': 11.5, 'font-weight': 'bold' },
          roleLabel
        ),
        s(
          'text',
          { x: x + cardW / 2, y: y + 60, 'text-anchor': 'middle', fill: slot.isPlaceholder ? 'var(--muted)' : 'var(--ink)', 'font-size': 17, 'font-weight': 'bold' },
          ratToString(slot.coeff)
        ),
        s(
          'text',
          { x: x + cardW / 2, y: y + 92, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 14 },
          slot.deg === 0 ? 'x⁰ = 1' : slot.deg === 1 ? 'x¹' : `x^${slot.deg}`
        )
      );
      sceneGroup.append(cardG);
    });

    sceneGroup.append(
      s(
        'text',
        { x: 320, y: 214, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12.5 },
        info.completeTermCount === info.nonZeroTermCount
          ? 'Polinomio completo: no faltan potencias intermedias.'
          : `Polinomio incompleto: faltan ${info.completeTermCount - info.nonZeroTermCount} término(s) con coeficiente 0.`
      )
    );

    renderReadout(board.readout, 'Propiedades estructurales', [
      ['Grado gr(P)', String(deg)],
      ['Coef. principal', ratToString(info.leadingCoeff)],
      ['Término indep.', ratToString(info.constantTerm)],
      ['¿Es mónico?', isOneRat(info.leadingCoeff) ? 'Sí (a_n = 1)' : 'No'],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
