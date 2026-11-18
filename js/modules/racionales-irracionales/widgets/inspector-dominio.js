/**
 * @file js/modules/racionales-irracionales/widgets/inspector-dominio.js
 * Widget 1 (Sec 1 & Sec 5): Domain Inspector across Rational Simplification,
 * Rational Division, Even/Odd Radical Index, and Radical in Denominator.
 * 2-stage POE + keyboard-accessible draggable x0 probe (attachSvgDrag) + persistent DOM nodes.
 */

import {
  s,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  createCartesianMapper,
  attachSvgDrag,
  addRange,
  addChips,
  button,
  renderReadout,
  playClick,
  fmt,
  MINUS,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyMul,
  simplifyRational,
  rationalDomainFromPolys,
  analyzeIrrationalDomain,
  formatPoly,
} from '../logic.js';

const MODES = [
  ['rat_simp', 'Racional (simplificación)'],
  ['rat_div', 'Cociente (P/Q) : (R/S)'],
  ['rad_even', 'Irracional par √g(x)'],
  ['rad_odd', 'Irracional impar ∛g(x)'],
  ['rad_denom', 'Radical abajo 1/√g(x)'],
];

export function initInspectorDominio(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    mode: 'rat_simp',
    a: 3,
    x0: 1,
    simplifiedOn: true,
  });

  const predictBox = createPredictBox({
    classPrefix: 'ri',
    prompt: 'Si simplificamos (x² − 9) / (x − 3) a x + 3, ¿su dominio pasa a ser ℝ?',
    options: [
      {
        label: 'Sí, al cancelar (x − 3) desaparece la división por cero',
        correct: false,
        explanation:
          'Simplificar cambia la apariencia algebraica para operar más cómodo, pero en x = 3 la fórmula original sigue dividiendo por 0. El dominio se fija ANTES de cancelar.',
      },
      {
        label: 'No: x = 3 sigue excluido en la fórmula original (Dom = ℝ − {3})',
        correct: true,
        explanation:
          '¡Exacto! El dominio máximo se hereda del denominador original Q(x): aunque (x − 3) se cancele, x = 3 queda excluido como punto agujero.',
      },
      {
        label: 'Solo queda excluido x = −3',
        correct: false,
        explanation:
          'x = −3 anula el numerador (x² − 9 = 0), lo cual es completamente válido (da 0 / −6 = 0). El único valor prohibido es x = 3.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'rat_simp', a: 3, x0: 3, simplifiedOn: true });
    },
  });

  const board = createBoard(host, 'Inspector de dominio y aduana de restricciones', '0 0 640 310', {
    prefix: 'ri',
  });
  host.prepend(predictBox);

  const updateModeChips = addChips(
    board.controls,
    MODES,
    store.get().mode,
    (mode) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ mode });
    },
    'Modo del inspector de dominio'
  );

  const aCtrl = addRange(board.controls, store, 'a', 'Parámetro a', -4, 4, store.get().a, 1);
  aCtrl.input.addEventListener('input', () => predictBox.notifyInteraction());

  const simpBtn = button('Mostrar simplificación: Sí', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set((st) => ({ simplifiedOn: !st.simplifiedOn }));
  }, 'chip is-active');
  const resetBtn = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'rat_simp', a: 3, x0: 1, simplifiedOn: true });
    aCtrl.input.value = '3';
    aCtrl.output.textContent = fmt(3);
  }, 'chip chip--ghost');
  board.actions.append(simpBtn, resetBtn);

  // Persistent SVG scene
  const mapper = createCartesianMapper(
    { x: 48, y: 40, w: 544, h: 120 },
    { xMin: -6, xMax: 6, yMin: -1, yMax: 1 }
  );

  const lineY = 92;
  const bgLayer = s('g', { class: 'ri-inspector-bg' });
  const domainLayer = s('g', { class: 'ri-inspector-domain' });
  const ticksLayer = s('g', { class: 'ri-inspector-ticks' });
  const gateLayer = s('g', { class: 'ri-inspector-gate' });

  // Static axis & ticks
  bgLayer.append(
    s('text', { x: 320, y: 26, 'text-anchor': 'middle', fill: 'var(--yellow)', 'font-size': 14, 'font-weight': 'bold' }, 'Recta real de dominio y sonda interactiva x₀'),
    s('line', { x1: mapper.toX(-6), y1: lineY, x2: mapper.toX(6), y2: lineY, stroke: 'rgba(236, 242, 232, 0.35)', 'stroke-width': 2 })
  );
  for (let t = -6; t <= 6; t++) {
    const px = mapper.toX(t);
    ticksLayer.append(
      s('line', { x1: px, y1: lineY - 5, x2: px, y2: lineY + 5, stroke: 'rgba(236, 242, 232, 0.45)', 'stroke-width': 1.2 }),
      s('text', { x: px, y: lineY + 22, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 11 }, fmt(t))
    );
  }

  // Persistent Gate Box
  const gateRect = s('rect', {
    x: 34,
    y: 148,
    width: 572,
    height: 138,
    fill: 'rgba(18, 24, 28, 0.85)',
    stroke: 'var(--green)',
    'stroke-width': 2,
  });
  const gateTitle = s('text', { x: 52, y: 176, fill: 'var(--green)', 'font-size': 15, 'font-weight': 'bold' }, '');
  const gateFormula = s('text', { x: 52, y: 204, fill: 'var(--ink)', 'font-size': 14 }, '');
  const gateEval = s('text', { x: 52, y: 232, fill: 'var(--yellow)', 'font-size': 14 }, '');
  const gateNote = s('text', { x: 52, y: 262, fill: 'var(--muted)', 'font-size': 12.5 }, '');
  gateLayer.append(gateRect, gateTitle, gateFormula, gateEval, gateNote);

  // Persistent Draggable Probe x0
  const probeLine = s('line', { x1: mapper.toX(1), y1: 52, x2: mapper.toX(1), y2: lineY + 8, stroke: 'var(--yellow)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
  const probeDot = s('circle', {
    cx: mapper.toX(1),
    cy: lineY,
    r: 9,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    class: 'ri-drag-handle',
    'aria-label': 'Sonda de prueba x₀ en la recta real',
    'aria-valuemin': '-6',
    'aria-valuemax': '6',
    'aria-valuenow': '1',
  });
  const probeBadge = s('text', { x: mapper.toX(1), y: 46, 'text-anchor': 'middle', fill: 'var(--yellow)', 'font-size': 12.5, 'font-weight': 'bold' }, 'x₀ = 1');

  board.drawing.append(bgLayer, ticksLayer, domainLayer, gateLayer, probeLine, probeDot, probeBadge);

  attachSvgDrag(
    board.svg,
    probeDot,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const snapped = Math.round(Math.max(-6, Math.min(6, x)) * 4) / 4;
      store.set({ x0: snapped });
    },
    { stepX: 0.25, stepY: 0, ariaLabel: 'Sonda de prueba x₀ en la recta real' }
  );

  const render = (st) => {
    updateModeChips(st.mode);
    aCtrl.input.value = String(st.a);
    aCtrl.output.textContent = fmt(st.a);
    simpBtn.textContent = `Mostrar simplificación: ${st.simplifiedOn ? 'Sí' : 'No'}`;
    simpBtn.className = `chip ${st.simplifiedOn ? 'is-active' : 'chip--ghost'}`;
    simpBtn.style.display = st.mode === 'rat_simp' ? '' : 'none';

    const a = st.a;
    const x0 = st.x0;
    const px0 = mapper.toX(x0);
    probeLine.setAttribute('x1', String(px0));
    probeLine.setAttribute('x2', String(px0));
    probeDot.setAttribute('cx', String(px0));
    probeDot.setAttribute('cy', String(lineY));
    probeDot.setAttribute('aria-valuenow', String(x0));
    probeBadge.setAttribute('x', String(Math.max(70, Math.min(570, px0))));
    probeBadge.textContent = `x₀ = ${fmt(x0)}`;

    clear(domainLayer);

    let formulaText = '';
    let domText = '';
    let restriction = '';
    let passed = true;
    let evalMsg = '';
    let noteMsg = '';
    let simpMsg = '';

    if (st.mode === 'rat_simp') {
      const aSafe = a === 0 ? 1 : a;
      const P = polyFromDescending([1, 0, -(aSafe * aSafe)]); // x^2 - a^2
      const Q = polyFromDescending([1, -aSafe]); // x - a
      const simp = simplifyRational(P, Q);
      formulaText = `f(x) = (${formatPoly(P)}) / (${formatPoly(Q)})`;
      domText = simp.domain.domainFormatted;
      restriction = `x ${aSafe >= 0 ? `− ${aSafe}` : `+ ${Math.abs(aSafe)}`} ≠ 0 ⇒ x ≠ ${fmt(aSafe)}`;
      simpMsg = st.simplifiedOn
        ? `Simplificada: ${simp.formattedSimplified} (con x ≠ ${fmt(aSafe)})`
        : 'Simplificación oculta';

      const denVal = x0 - aSafe;
      if (Math.abs(denVal) < 1e-9) {
        passed = false;
        evalMsg = `BLOQUEADO en x₀ = ${fmt(x0)}: denominador Q(${fmt(x0)}) = 0 → división por cero.`;
        noteMsg = `Aunque x + ${fmt(aSafe)} daría ${fmt(2 * aSafe)}, en la fórmula original divide por cero (agujero).`;
      } else {
        const yVal = (x0 * x0 - aSafe * aSafe) / denVal;
        evalMsg = `PASA en x₀ = ${fmt(x0)}: f(${fmt(x0)}) = ${fmt(Number(yVal.toFixed(3)))}`;
        noteMsg = `Como x₀ ≠ ${fmt(aSafe)}, la expresión original y la simplificada coinciden.`;
      }

      const pxEx = mapper.toX(aSafe);
      domainLayer.append(
        s('line', { x1: mapper.toX(-6), y1: lineY, x2: pxEx - 5, y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 }),
        s('line', { x1: pxEx + 5, y1: lineY, x2: mapper.toX(6), y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 }),
        s('circle', { cx: pxEx, cy: lineY, r: 5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2.5 })
      );
    } else if (st.mode === 'rat_div') {
      // (x + 1)/(x - 2) : (x - a)/(x + 3) -> excludes x = 2, x = -3, AND x = a!
      const Q1 = polyFromDescending([1, -2]);
      const Q2 = polyFromDescending([1, 3]);
      const P2 = polyFromDescending([1, -a]);
      const dom = rationalDomainFromPolys([Q1, Q2, P2]);
      formulaText = `((x + 1)/(x − 2)) : ((${formatPoly(P2)})/(x + 3))`;
      domText = dom.domainFormatted;
      restriction = `Se excluyen raíces de (x − 2), (x + 3) y del numerador divisor (${formatPoly(P2)})`;
      simpMsg = `Al invertir el divisor se exige además x ≠ ${fmt(a)}`;

      const isExcl = dom.excludedRoots.some((r) => Math.abs(r.value - x0) < 1e-8);
      if (isExcl) {
        passed = false;
        const why =
          Math.abs(x0 - 2) < 1e-8
            ? 'anula (x − 2)'
            : Math.abs(x0 + 3) < 1e-8
              ? 'anula (x + 3)'
              : 'anula el numerador del divisor al invertir';
        evalMsg = `BLOQUEADO en x₀ = ${fmt(x0)}: ${why}.`;
        noteMsg = 'En un cociente de fracciones racionales se excluyen las raíces de ambos denominadores y del numerador divisor.';
      } else {
        const yVal = ((x0 + 1) / (x0 - 2)) / ((x0 - a) / (x0 + 3));
        evalMsg = `PASA en x₀ = ${fmt(x0)}: resultado = ${fmt(Number(yVal.toFixed(3)))}`;
        noteMsg = 'Ninguno de los tres factores prohibidos se anula en este punto.';
      }

      const sortedPts = [-6, ...dom.excludedRoots.map((r) => r.value).filter((v) => v > -6 && v < 6), 6];
      for (let i = 0; i < sortedPts.length - 1; i++) {
        const xL = mapper.toX(sortedPts[i]) + (i === 0 ? 0 : 5);
        const xR = mapper.toX(sortedPts[i + 1]) - (i === sortedPts.length - 2 ? 0 : 5);
        if (xR > xL) {
          domainLayer.append(
            s('line', { x1: xL, y1: lineY, x2: xR, y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 })
          );
        }
      }
      dom.excludedRoots.forEach((r) => {
        if (r.value >= -6 && r.value <= 6) {
          domainLayer.append(
            s('circle', { cx: mapper.toX(r.value), cy: lineY, r: 5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2.5 })
          );
        }
      });
    } else if (st.mode === 'rad_even') {
      const dom = analyzeIrrationalDomain({ index: 2, radicandCoeffs: [-a, 1], inDenominator: false });
      formulaText = `f(x) = √(${formatPoly(polyFromDescending([1, -a]))})`;
      domText = dom.domainFormatted;
      restriction = `Índice par (n = 2): x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`} ≥ 0 ⇒ x ≥ ${fmt(a)}`;
      simpMsg = 'Borde cerrado [a; +∞)';

      const gVal = x0 - a;
      if (gVal < -1e-9) {
        passed = false;
        evalMsg = `BLOQUEADO en x₀ = ${fmt(x0)}: radicando = ${fmt(gVal)} < 0 (no existe √negativo en ℝ).`;
        noteMsg = 'Las raíces de índice par requieren radicando mayor o igual a cero.';
      } else {
        const yVal = Math.sqrt(Math.max(0, gVal));
        evalMsg = `PASA en x₀ = ${fmt(x0)}: √(${fmt(gVal)}) = ${fmt(Number(yVal.toFixed(3)))}`;
        noteMsg = gVal === 0 ? 'Justo en el borde x = a la raíz vale 0 y pertenece al dominio.' : 'Radicando positivo: resultado real válido.';
      }

      const pxA = mapper.toX(a);
      domainLayer.append(
        s('line', { x1: mapper.toX(-6), y1: lineY, x2: pxA, y2: lineY, stroke: 'rgba(235, 120, 100, 0.35)', 'stroke-width': 3, 'stroke-dasharray': '5 4' }),
        s('line', { x1: pxA, y1: lineY, x2: mapper.toX(6), y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 }),
        s('circle', { cx: pxA, cy: lineY, r: 5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.5 })
      );
    } else if (st.mode === 'rad_odd') {
      const dom = analyzeIrrationalDomain({ index: 3, radicandCoeffs: [-a, 1], inDenominator: false });
      formulaText = `f(x) = ∛(${formatPoly(polyFromDescending([1, -a]))})`;
      domText = dom.domainFormatted;
      restriction = 'Índice impar (n = 3): sin restricción de signo';
      simpMsg = 'Admite radicandos negativos, nulos y positivos';

      const gVal = x0 - a;
      const yVal = Math.cbrt(gVal);
      evalMsg = `PASA en x₀ = ${fmt(x0)}: ∛(${fmt(gVal)}) = ${fmt(Number(yVal.toFixed(3)))}`;
      noteMsg = gVal < 0 ? 'Con índice impar la raíz cúbica de un negativo existe en ℝ.' : 'Todo número real tiene raíz cúbica única.';
      domainLayer.append(
        s('line', { x1: mapper.toX(-6), y1: lineY, x2: mapper.toX(6), y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 })
      );
    } else {
      // rad_denom: 1 / sqrt(x - a)
      const dom = analyzeIrrationalDomain({ index: 2, radicandCoeffs: [-a, 1], inDenominator: true });
      formulaText = `f(x) = 1 / √(${formatPoly(polyFromDescending([1, -a]))})`;
      domText = dom.domainFormatted;
      restriction = `Par en denominador: x ${a >= 0 ? `− ${a}` : `+ ${Math.abs(a)}`} > 0 estricto`;
      simpMsg = 'Borde abierto (a; +∞) porque √0 = 0 divide por cero';

      const gVal = x0 - a;
      if (gVal <= 1e-9) {
        passed = false;
        evalMsg =
          Math.abs(gVal) <= 1e-9
            ? `BLOQUEADO en x₀ = ${fmt(x0)}: √0 = 0 divide por cero en el denominador.`
            : `BLOQUEADO en x₀ = ${fmt(x0)}: radicando = ${fmt(gVal)} < 0 no existe en ℝ.`;
        noteMsg = 'Cuando √g(x) está en el denominador se exige g(x) > 0 estricto (paréntesis abierto).';
      } else {
        const yVal = 1 / Math.sqrt(gVal);
        evalMsg = `PASA en x₀ = ${fmt(x0)}: 1 / √(${fmt(gVal)}) = ${fmt(Number(yVal.toFixed(3)))}`;
        noteMsg = 'El radicando es estrictamente positivo y no divide por cero.';
      }

      const pxA = mapper.toX(a);
      domainLayer.append(
        s('line', { x1: mapper.toX(-6), y1: lineY, x2: pxA - 5, y2: lineY, stroke: 'rgba(235, 120, 100, 0.35)', 'stroke-width': 3, 'stroke-dasharray': '5 4' }),
        s('line', { x1: pxA + 5, y1: lineY, x2: mapper.toX(6), y2: lineY, stroke: 'var(--green)', 'stroke-width': 4 }),
        s('circle', { cx: pxA, cy: lineY, r: 5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2.5 })
      );
    }

    gateRect.setAttribute('stroke', passed ? 'var(--green)' : 'var(--pink)');
    gateTitle.setAttribute('fill', passed ? 'var(--green)' : 'var(--pink)');
    gateTitle.textContent = passed ? 'COMPUERTA ABIERTA · x₀ PERTENECE AL DOMINIO' : 'COMPUERTA CERRADA · x₀ EXCLUIDO';
    gateFormula.textContent = `Fórmula: ${formulaText}`;
    gateEval.textContent = evalMsg;
    gateNote.textContent = noteMsg;

    renderReadout(board.readout, 'Lectura en tiempo real del dominio', [
      ['Dominio máximo', domText],
      ['Condición de validez', restriction],
      ['Nota algebraica', simpMsg],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store, board, predictBox };
}
