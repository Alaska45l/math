/**
 * Widget 8 · radiografia-cuadratica.js
 * Visor de Rayos X Cartesiano con 4 lentes interactivos:
 * 1) Imagen en Eje Y, 2) Monotonía I↑/I↓ en Eje X, 3) Signos C₀/C⁺/C⁻, 4) Prueba Horizontal y Rama Inversa.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { analyzeQuadratic, fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createPredictBox,
} from './board-kit.js';

const PRESETS = [
  { label: 'f(x) = 16 − (x − 4)²', a: -1, b: 8, c: 0 },
  { label: 'f(x) = −2x² + 4x − 2 (rebote Δ = 0)', a: -2, b: 4, c: -2 },
  { label: 'g(x) = x² − 2x − 3', a: 1, b: -2, c: -3 },
  { label: 'f(x) = −(x + 3)² + 1', a: -1, b: -6, c: -8 },
  { label: 'h(x) = x² − 4x + 6 (Δ < 0, todo C⁺)', a: 1, b: -4, c: 6 },
];

const LENSES = [
  { id: 'image', label: 'Lente 1 · Imagen en Eje Y (corchete cerrado)' },
  { id: 'monotonicity', label: 'Lente 2 · Monotonía I↑ / I↓ en Eje X' },
  { id: 'signs', label: 'Lente 3 · Signos C₀ / C⁺ / C⁻' },
  { id: 'bijectivity', label: 'Lente 4 · Prueba Horizontal y Rama Inversa' },
];

export function initRadiografiaCuadratica(host) {
  if (!host) return null;
  clear(host);

  const state = {
    presetIdx: 0,
    lens: 'image',
  };

  const predictBox = createPredictBox({
    prompt:
      'En f(x) = −(x + 3)² + 1 (cuyo vértice es V(−3; 1) y abre hacia abajo), ¿qué número define el corte del intervalo de crecimiento I↑ y qué número define el tope de la Imagen Im(f)?',
    options: [
      {
        label: 'Ambos usan el 1: I↑ = (−∞; 1) e Im(f) = (−∞; 1]',
        correct: false,
        explanation:
          'El intervalo de crecimiento se lee sobre el suelo del eje X (quiebra en xᵥ = −3), nunca con la altura 1.',
      },
      {
        label: 'Crecimiento quiebra en xᵥ = −3: I↑ = (−∞; −3); Imagen llega hasta yᵥ = 1: Im(f) = (−∞; 1]',
        correct: true,
        explanation:
          '¡Perfecto! Piso X para crecimiento (xᵥ = −3) y altura Y con corchete cerrado para Imagen (yᵥ = 1).',
      },
      {
        label: 'Im(f) lleva paréntesis abierto (−∞; 1) igual que las exponenciales',
        correct: false,
        explanation:
          'A diferencia de la asíntota exponencial, la parábola sí alcanza y pisa su propio vértice en x = −3, por lo que lleva corchete cerrado.',
      },
    ],
    onVerify: () => {
      state.presetIdx = 3;
      state.lens = 'image';
      for (const [i, el] of presetsRow.querySelectorAll('button').entries()) {
        el.classList.toggle('is-active', i === 3);
      }
      for (const [i, el] of lensesRow.querySelectorAll('button').entries()) {
        el.classList.toggle('is-active', i === 0);
      }
      render();
    },
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const lensesRow = h('div', { class: 'pr-chip-row' });

  PRESETS.forEach((p, idx) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${idx === 0 ? ' is-active' : ''}` },
      p.label
    );
    b.addEventListener('click', () => {
      playClick();
      state.presetIdx = idx;
      for (const el of presetsRow.querySelectorAll('button')) {
        el.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    presetsRow.appendChild(b);
  });

  LENSES.forEach((ln, idx) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${idx === 0 ? ' is-active' : ''}` },
      ln.label
    );
    b.addEventListener('click', () => {
      playClick();
      state.lens = ln.id;
      for (const el of lensesRow.querySelectorAll('button')) {
        el.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    lensesRow.appendChild(b);
  });

  const board = createQuadBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Visor de Rayos X de función cuadrática: imagen, monotonía, signos y biyectividad',
  });

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  function render() {
    const p = PRESETS[state.presetIdx];
    const ana = analyzeQuadratic(p);
    const { xv, yv } = ana.vertex;

    const yLim = Math.max(8, Math.min(20, Math.ceil((Math.abs(yv) + 4) / 2) * 2));
    const xCenter = Math.round(xv);
    const mapper = createCartesianMapper(board.plotBox, {
      xMin: xCenter - 7,
      xMax: xCenter + 7,
      yMin: -yLim,
      yMax: yLim,
    });

    drawCartesianAxes(board.gridLayer, mapper, {
      xStep: 2,
      yStep: yLim > 12 ? 4 : 2,
    });

    clear(board.clippedLayer);
    clear(board.overlayLayer);

    const fn = (x) => p.a * x * x + p.b * x + p.c;
    const pxV = mapper.toX(xv);
    const pyV = mapper.toY(yv);
    const px0 = mapper.toX(0);
    const py0 = mapper.toY(0);

    // Eje de simetría punteado
    board.clippedLayer.appendChild(
      s('line', {
        x1: pxV,
        y1: board.plotBox.y,
        x2: pxV,
        y2: board.plotBox.y + board.plotBox.h,
        stroke: 'rgba(246, 189, 96, 0.45)',
        'stroke-width': 1.4,
        'stroke-dasharray': '4 4',
      })
    );

    if (state.lens === 'image') {
      // Sombra de Imagen sobre el eje Y desde yv hacia arriba (a > 0) o hacia abajo (a < 0)
      const yEndPx = ana.a > 0 ? board.plotBox.y : board.plotBox.y + board.plotBox.h;
      board.clippedLayer.appendChild(
        s('line', {
          x1: px0,
          y1: pyV,
          x2: px0,
          y2: yEndPx,
          stroke: 'var(--yellow)',
          'stroke-width': 6,
          'stroke-linecap': 'butt',
        })
      );
      // Línea horizontal desde el vértice hasta el eje Y
      board.clippedLayer.appendChild(
        s('line', {
          x1: pxV,
          y1: pyV,
          x2: px0,
          y2: pyV,
          stroke: 'var(--yellow)',
          'stroke-width': 1.8,
          'stroke-dasharray': '3 3',
        })
      );
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 150),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 2.8,
        })
      );
      // Punto cerrado en (0, yv) representando el corchete cerrado
      board.clippedLayer.appendChild(
        s('circle', {
          cx: px0,
          cy: pyV,
          r: 6,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );
      readoutLine1.textContent = `Lente Imagen (Eje Y): Im(f) = ${ana.image} · Extremo en V(${fmtNumClean(
        xv
      )}; ${fmtNumClean(yv)})`;
      readoutLine2.textContent = `Como la curva sí toca su propio vértice en yᵥ = ${fmtNumClean(
        yv
      )}, lleva SIEMPRE corchete cerrado.`;
    } else if (state.lens === 'monotonicity') {
      // Rama izquierda y rama derecha con colores distintos y proyección en el eje X
      const leftColor = ana.a > 0 ? 'var(--pink)' : 'var(--green)';
      const rightColor = ana.a > 0 ? 'var(--green)' : 'var(--pink)';
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 80, mapper.xMin, xv),
          fill: 'none',
          stroke: leftColor,
          'stroke-width': 3,
        })
      );
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 80, xv, mapper.xMax),
          fill: 'none',
          stroke: rightColor,
          'stroke-width': 3,
        })
      );
      board.clippedLayer.appendChild(
        s('line', {
          x1: board.plotBox.x,
          y1: py0,
          x2: pxV,
          y2: py0,
          stroke: leftColor,
          'stroke-width': 5,
        })
      );
      board.clippedLayer.appendChild(
        s('line', {
          x1: pxV,
          y1: py0,
          x2: board.plotBox.x + board.plotBox.w,
          y2: py0,
          stroke: rightColor,
          'stroke-width': 5,
        })
      );
      readoutLine1.textContent = `Lente Monotonía (Eje X): Crecimiento I↑ = ${ana.increasingInterval} · Decrecimiento I↓ = ${ana.decreasingInterval}`;
      readoutLine2.textContent = `¡Miramos únicamente el piso X! El cambio de sentido ocurre exactamente en la abscisa del vértice xᵥ = ${fmtNumClean(
        xv
      )}.`;
    } else if (state.lens === 'signs') {
      // Colorear eje X en C+ (verde) y C- (rosa)
      const steps = 160;
      const dx = (mapper.xMax - mapper.xMin) / steps;
      for (let i = 0; i < steps; i++) {
        const xA = mapper.xMin + i * dx;
        const xB = xA + dx;
        const yMid = fn((xA + xB) / 2);
        board.clippedLayer.appendChild(
          s('line', {
            x1: mapper.toX(xA),
            y1: py0,
            x2: mapper.toX(xB),
            y2: py0,
            stroke: yMid >= 0 ? 'var(--green)' : 'var(--pink)',
            'stroke-width': 5,
          })
        );
      }
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 150),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 2.8,
        })
      );
      for (const r of ana.roots) {
        board.clippedLayer.appendChild(
          s('circle', {
            cx: mapper.toX(r),
            cy: py0,
            r: 5.5,
            fill: 'var(--yellow)',
            stroke: '#111',
            'stroke-width': 1.8,
          })
        );
      }
      readoutLine1.textContent = `Lente Signos: C₀ = ${ana.C0} · C⁺ = ${ana.CPlus} · C⁻ = ${ana.CMinus}`;
      readoutLine2.textContent =
        ana.roots.length === 1
          ? `Ojo: en x = ${fmtNumClean(ana.roots[0])} la función vale 0 (rebota), por lo que debemos excluir ese punto de ${
              ana.a > 0 ? 'C⁺' : 'C⁻'
            }.`
          : 'En verde sobre el eje X los tramos con curva por encima (y > 0) y en rosa los tramos bajo tierra (y < 0).';
    } else {
      // Lente 4: Prueba de la recta horizontal y restricción de rama inversa
      const yTest = yv + (ana.a > 0 ? 4 : -4);
      const pyTest = mapper.toY(yTest);
      // Recta horizontal que corta en dos puntos simétricos
      board.clippedLayer.appendChild(
        s('line', {
          x1: board.plotBox.x,
          y1: pyTest,
          x2: board.plotBox.x + board.plotBox.w,
          y2: pyTest,
          stroke: 'var(--pink)',
          'stroke-width': 1.8,
          'stroke-dasharray': '5 4',
        })
      );
      // Rama izquierda punteada (descartada) y rama derecha sólida [xv; +inf) (elegida para invertir)
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 80, mapper.xMin, xv),
          fill: 'none',
          stroke: 'rgba(167, 184, 174, 0.35)',
          'stroke-width': 2,
          'stroke-dasharray': '4 4',
        })
      );
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fn, mapper, 80, xv, mapper.xMax),
          fill: 'none',
          stroke: 'var(--green)',
          'stroke-width': 3.2,
        })
      );
      readoutLine1.textContent = `No es inyectiva en ℝ (la recta horizontal corta las dos ramas). Ramas biyectivas: ${ana.bijectivity.restrictedBranches[0]} o ${ana.bijectivity.restrictedBranches[1]} → ${ana.image}`;
      readoutLine2.textContent = `Al restringir el dominio a la rama derecha [${fmtNumClean(
        xv
      )}; +∞) y el codominio a ${ana.image}, pasa a ser biyectiva e inversible con raíz cuadrada.`;
    }

    // Punto del vértice
    board.clippedLayer.appendChild(
      s('circle', {
        cx: pxV,
        cy: pyV,
        r: 5.5,
        fill: 'var(--yellow)',
        stroke: '#111',
        'stroke-width': 1.6,
      })
    );
  }

  render();
  host.append(predictBox, presetsRow, lensesRow, board.svg, readout);
  return { state, render };
}

export const initWidget = initRadiografiaCuadratica;
export default initRadiografiaCuadratica;
