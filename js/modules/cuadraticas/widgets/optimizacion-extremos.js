/**
 * Widget 10 · optimizacion-extremos.js
 * Laboratorio geométrico y físico en vivo:
 * Modo 1: El Cuadrado Inscrito MNOP dentro de un cuadrado de 16 cm (S(x) = 2x² − 32x + 256 en [0; 16])
 * Modo 2: Lanzamiento de proyectil h(t) = −5t² + 20t en [0; 4] y cerco rectangular.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initOptimizacionExtremos(host) {
  if (!host) return null;
  clear(host);

  const state = {
    mode: 'square', // 'square' | 'projectile'
    xCut: 5, // en [0; 16]
    tTime: 1.5, // en [0; 4]
  };

  const predictBox = createPredictBox({
    prompt:
      'Al inscribir un cuadrado dentro de otro cuadrado de 16 cm de lado (área 256 cm²), cuando el punto de corte pasa por la mitad exacta del lado (x = 8 cm), ¿qué fracción del área original ocupa el cuadrado inscrito?',
    options: [
      {
        label: 'Un cuarto del área original (64 cm²)',
        correct: false,
        explanation:
          'Por Pitágoras, con catetos de 8 cm y 8 cm el área es 8² + 8² = 64 + 64 = 128 cm².',
      },
      {
        label: 'Exactamente la mitad del área original (128 cm², mínimo absoluto)',
        correct: true,
        explanation:
          '¡Exacto! En xᵥ = 8 cm los cuatro triángulos de las esquinas suman la otra mitad (128 cm²) y el cuadrado interior alcanza su área mínima.',
      },
      {
        label: 'El área se mantiene constante en 256 cm² para cualquier corte x',
        correct: false,
        explanation:
          'Al girar el cuadrado interior, se recortan cuatro triángulos rectángulos en las esquinas cuya área varía con x.',
      },
    ],
  });

  const modeRow = h('div', { class: 'pr-chip-row pr-presets' });
  const btnSquare = h(
    'button',
    { type: 'button', class: 'pr-chip is-active' },
    'Escenario 1 · Cuadrado Inscrito de 16 cm (Mínimo en Vértice)'
  );
  const btnProjectile = h(
    'button',
    { type: 'button', class: 'pr-chip' },
    'Escenario 2 · Proyectil h(t) = −5t² + 20t (Máximo en Vértice)'
  );
  modeRow.append(btnSquare, btnProjectile);

  const board = createQuadBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Simulador de optimización cuadrática: cuadrado inscrito y trayectoria de proyectil',
  });

  const sliderCut = createSliderField({
    label: 'Corte x sobre el lado de 16 cm (dominio físico [0; 16])',
    min: 0,
    max: 16,
    step: 0.5,
    value: state.xCut,
    formatValue: (v) => `${v} cm`,
    onInput: (v) => {
      state.xCut = v;
      render();
    },
  });

  const sliderTime = createSliderField({
    label: 'Tiempo t del proyectil (dominio físico [0; 4] s)',
    min: 0,
    max: 4,
    step: 0.1,
    value: state.tTime,
    formatValue: (v) => `${v} s`,
    onInput: (v) => {
      state.tTime = v;
      render();
    },
  });
  sliderTime.root.setAttribute('hidden', '');

  const slidersWrap = h('div', { class: 'quad-sliders-grid' }, [
    sliderCut.root,
    sliderTime.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  btnSquare.addEventListener('click', () => {
    playClick();
    state.mode = 'square';
    btnSquare.classList.add('is-active');
    btnProjectile.classList.remove('is-active');
    sliderCut.root.removeAttribute('hidden');
    sliderTime.root.setAttribute('hidden', '');
    render();
  });

  btnProjectile.addEventListener('click', () => {
    playClick();
    state.mode = 'projectile';
    btnProjectile.classList.add('is-active');
    btnSquare.classList.remove('is-active');
    sliderTime.root.removeAttribute('hidden');
    sliderCut.root.setAttribute('hidden', '');
    render();
  });

  function render() {
    clear(board.gridLayer);
    clear(board.clippedLayer);
    clear(board.overlayLayer);

    if (state.mode === 'square') {
      const x = state.xCut;
      const area = 2 * x * x - 32 * x + 256;

      // Izquierda (x = 45..265): Dibujo geométrico del cuadrado de 16x16 y el cuadrado inscrito MNOP
      const sqX = 52;
      const sqY = 58;
      const sqSize = 210;
      const ratio = x / 16;
      const dPx = ratio * sqSize;

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + sqSize / 2,
            y: 42,
            fill: 'var(--yellow)',
            'font-size': 12.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `Cuadrado exterior 16 × 16 cm`
        )
      );

      // Cuadrado grande exterior
      board.overlayLayer.appendChild(
        s('rect', {
          x: sqX,
          y: sqY,
          width: sqSize,
          height: sqSize,
          fill: 'rgba(20, 30, 25, 0.85)',
          stroke: 'var(--muted)',
          'stroke-width': 2,
        })
      );

      // Cuadrado inscrito MNOP con vértices en los 4 lados a distancia dPx de cada esquina
      const pM = `${sqX + dPx},${sqY}`;
      const pN = `${sqX + sqSize},${sqY + dPx}`;
      const pO = `${sqX + sqSize - dPx},${sqY + sqSize}`;
      const pP = `${sqX},${sqY + sqSize - dPx}`;

      board.overlayLayer.appendChild(
        s('polygon', {
          points: `${pM} ${pN} ${pO} ${pP}`,
          fill:
            Math.abs(x - 8) < 1e-6
              ? 'rgba(129, 178, 154, 0.35)'
              : 'rgba(132, 165, 157, 0.25)',
          stroke: Math.abs(x - 8) < 1e-6 ? 'var(--green)' : 'var(--blue)',
          'stroke-width': 2.5,
        })
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + sqSize / 2,
            y: sqY + sqSize / 2 + 5,
            fill: 'var(--ink)',
            'font-size': 14,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `S(${fmtNumClean(x)}) = ${fmtNumClean(area)} cm²`
        )
      );

      // Etiquetas de los catetos x y 16 - x arriba
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + dPx / 2,
            y: sqY - 6,
            fill: 'var(--yellow)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          `x=${fmtNumClean(x)}`
        )
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + dPx + (sqSize - dPx) / 2,
            y: sqY - 6,
            fill: 'var(--pink)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          `16−x=${fmtNumClean(16 - x)}`
        )
      );

      // Derecha (x = 320..650): Gráfico de S(x) = 2x^2 - 32x + 256 sobre el dominio físico [0; 16]
      const rightBox = { x: 325, y: 34, w: 325, h: 256 };
      const mapper = createCartesianMapper(rightBox, {
        xMin: -2,
        xMax: 18,
        yMin: 0,
        yMax: 280,
      });

      drawCartesianAxes(board.gridLayer, mapper, {
        xStep: 4,
        yStep: 64,
        xLabel: 'x (cm)',
        yLabel: 'S(x)',
      });

      const fnS = (u) => 2 * u * u - 32 * u + 256;

      // Ramas fuera del dominio físico punteadas
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnS, mapper, 100, -2, 18),
          fill: 'none',
          stroke: 'rgba(167, 184, 174, 0.28)',
          'stroke-width': 1.8,
          'stroke-dasharray': '4 4',
        })
      );

      // Arco activo sobre el dominio físico [0; 16]
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnS, mapper, 90, 0, 16),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 3,
        })
      );

      // Mínimo en el vértice (8; 128)
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(8),
          cy: mapper.toY(128),
          r: 5.5,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.6,
        })
      );

      // Punto actual (x; S(x))
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(x),
          cy: mapper.toY(area),
          r: 6.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 2,
        })
      );

      readoutLine1.textContent = `Modelo Pitagórico: S(x) = x² + (16 − x)² = 2x² − 32x + 256 con dominio físico x ∈ [0; 16] cm`;
      readoutLine2.textContent = `Para x = ${fmtNumClean(x)} cm → Área S(${fmtNumClean(
        x
      )}) = ${fmtNumClean(
        area
      )} cm² · Mínimo absoluto en el vértice V(8 cm; 128 cm²) · Máximo en bordes x = 0 o 16 (256 cm²).`;
    } else {
      const t = state.tTime;
      const heightVal = -5 * t * t + 20 * t;

      const rightBox = { x: 60, y: 30, w: 580, h: 260 };
      const mapper = createCartesianMapper(rightBox, {
        xMin: -0.5,
        xMax: 4.5,
        yMin: -2,
        yMax: 24,
      });

      drawCartesianAxes(board.gridLayer, mapper, {
        xStep: 1,
        yStep: 5,
        xLabel: 't (s)',
        yLabel: 'h(t) (m)',
      });

      const fnH = (u) => -5 * u * u + 20 * u;
      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnH, mapper, 100, 0, 4),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 3,
        })
      );

      // Vértice máximo (2; 20)
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(2),
          cy: mapper.toY(20),
          r: 6,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );

      // Posición actual del proyectil (t; h(t))
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(t),
          cy: mapper.toY(heightVal),
          r: 7,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 2,
        })
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: mapper.toX(2),
            y: mapper.toY(20) - 10,
            fill: 'var(--green)',
            'font-size': 12,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'Cumbre Máxima V(2 s; 20 m)'
        )
      );

      readoutLine1.textContent = `Trayectoria h(t) = −5t² + 20t = −5t(t − 4) sobre el dominio físico t ∈ [0; 4] segundos`;
      readoutLine2.textContent = `En t = ${fmtNumClean(t)} s → Altura h(${fmtNumClean(
        t
      )}) = ${fmtNumClean(
        heightVal
      )} m · Altura máxima en el vértice: tᵥ = 2 s con h_máx = 20 m.`;
    }
  }

  render();
  host.append(predictBox, modeRow, board.svg, slidersWrap, readout);
  return { state, render };
}

export const initWidget = initOptimizacionExtremos;
export default initOptimizacionExtremos;
